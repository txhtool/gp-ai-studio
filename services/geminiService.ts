import { FeatureType, AngleOption, RoomOption, GenerationResult } from "../types";
import { GoogleGenAI } from "@google/genai";

export const MODEL_NAME = 'gemini-2.5-flash-image';

// Cost constants (Estimated based on Google Gemini Flash Pricing)
// Assuming ~ $0.0004 per input image + tokens and output generation
const ESTIMATED_COST_USD = 0.002;
const EXCHANGE_RATE = 25400; // 1 USD = 25,400 VND

// Helper function to compress image
const compressImage = (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions ensuring max dimension is maxWidth
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Convert to JPEG with reduced quality
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str); // Fallback to original if context fails
      }
    };
    img.onerror = () => {
      resolve(base64Str); // Fallback to original on error
    };
  });
};

const cleanBase64 = (dataUrl: string): string => {
  if (dataUrl.includes(',')) {
    return dataUrl.split(',')[1];
  }
  return dataUrl;
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateFurnitureImage = async (
  originalImageBase64: string,
  featureType: FeatureType,
  option: AngleOption | RoomOption
): Promise<GenerationResult> => {
  
  // CRITICAL: Initialize AI client here to use the latest API Key selected by the user for billing.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Compress image before sending
  const compressedImage = await compressImage(originalImageBase64);
  const cleanImage = cleanBase64(compressedImage);

  // 2. Construct Prompt
  let prompt = "";
  if (featureType === FeatureType.MULTI_ANGLE) {
    prompt = `You are a professional product photographer. 
    Your task is to photograph the furniture item provided in the input image from a specific new angle.

    Target Viewpoint: ${option}.

    CRITICAL INSTRUCTIONS:
    1. TRANSFORMATION: You must rotate the object to match the Target Viewpoint exactly. Do not output the original view.
    2. INFERENCE: If the new view (e.g., Back, Top-down) hides details or reveals unseen areas, logically infer the design based on the item's style and symmetry.
    3. BACKGROUND: Place the object in a professional, neutral studio background (soft grey/white). COMPLETELY REMOVE the original background.
    4. FIDELITY: Keep the materials, colors, and design details identical to the product in the input image.
    5. QUANTITY: PRESERVE EXACT NUMBER OF ITEMS. Do not add or remove any furniture pieces. If the input has 1 chair, the output must have exactly 1 chair.
    
    The result must look like a fresh photo taken from the requested angle, distinctly different from the original image composition.`;
  } else if (featureType === FeatureType.SCENE_PLACEMENT) {
    prompt = `You are a professional interior designer and 3D artist.
    Your task is to place the furniture item from the input image into a completely new environment.

    Target Scene: ${option}.

    CRITICAL INSTRUCTIONS:
    1. NEW ENVIRONMENT: Place the product in a brand new, high-end, photorealistic ${option}.
    2. DIFFERENTIATION: The background and lighting MUST be completely different from the original image. Do not preserve the original room context.
    3. INTEGRATION: Ensure realistic shadows, reflections, and lighting that match the new scene.
    4. ISOLATION: Cleanly separate the furniture from its original background before placing it.
    5. QUANTITY: PRESERVE EXACT NUMBER OF ITEMS. Do not add or remove any furniture pieces. If the input has 1 chair, the output must have exactly 1 chair.
    
    The final image should look like a professional catalog photo in a modern home setting.`;
  }

  const MAX_RETRIES = 2; 
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanImage,
              },
            },
          ],
        },
      });

      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            
            // Calculate precise cost based on usageMetadata if available, otherwise use estimate
            // Note: usageMetadata might be missing in some preview models, defaulting to estimate.
            // const inputTokens = response.usageMetadata?.promptTokenCount || 0;
            // const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
            
            const costUsd = ESTIMATED_COST_USD;
            const costVnd = Math.round(costUsd * EXCHANGE_RATE);

            return {
              imageUrl: `data:image/jpeg;base64,${part.inlineData.data}`,
              cost: {
                usd: `$${costUsd.toFixed(4)}`,
                vnd: `${costVnd.toLocaleString('vi-VN')} đ`
              }
            };
          }
        }
      }
      
      throw new Error("Không nhận được kết quả hình ảnh từ Gemini.");

    } catch (error: any) {
      console.error(`Attempt ${attempt + 1} failed:`, error);

      const isRateLimit = error.message?.includes('429') || 
                          error.message?.includes('Quota exceeded') ||
                          error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (error.message?.includes('Requested entity was not found')) {
         throw new Error("KEY_ERROR");
      }

      if (attempt < MAX_RETRIES) {
        if (isRateLimit) {
          const delay = (attempt + 1) * 5000 + 2000;
          console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
          await wait(delay);
          continue;
        } else {
          await wait(1000);
          continue;
        }
      }
      
      if (isRateLimit) {
        throw new Error("Hệ thống đang quá tải (Rate Limit). Vui lòng thử lại sau ít phút.");
      } else if (error.message?.includes('413') || error.message?.includes('too large')) {
        throw new Error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.");
      }
      
      throw error;
    }
  }

  throw new Error("Không thể xử lý hình ảnh sau nhiều lần thử.");
};