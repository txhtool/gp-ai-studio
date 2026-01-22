import { GoogleGenAI } from "@google/genai";

// Config for Vercel Serverless Function
export const config = {
  maxDuration: 60, // Attempt to set timeout to 60 seconds (Standard on Pro, 10s on Hobby)
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

const cleanBase64 = (dataUrl: string): string => {
  // Handle case where dataUrl might not have the prefix or is malformed
  if (dataUrl.includes(',')) {
    return dataUrl.split(',')[1];
  }
  return dataUrl;
};

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { originalImageBase64, featureType, option } = req.body;

    if (!originalImageBase64 || !featureType || !option) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify API Key exists
    if (!process.env.API_KEY) {
      return res.status(500).json({ message: "Server configuration error: Missing API Key" });
    }

    const cleanImage = cleanBase64(originalImageBase64);
    let prompt = "";

    if (featureType === 'MULTI_ANGLE') {
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
    } else if (featureType === 'SCENE_PLACEMENT') {
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
          const resultData = `data:image/jpeg;base64,${part.inlineData.data}`;
          return res.status(200).json({ result: resultData });
        }
      }
    }

    return res.status(500).json({ message: "Không tìm thấy dữ liệu ảnh trong phản hồi từ AI." });

  } catch (error: any) {
    console.error("Server API Error:", error);
    
    // Detect Rate Limit / Quota errors
    const isRateLimit = error.message?.includes('429') || 
                        error.message?.includes('Quota exceeded') || 
                        error.status === 429;
                        
    const status = isRateLimit ? 429 : 500;
    
    return res.status(status).json({ 
      message: error.message || "Internal Server Error",
      code: status 
    });
  }
}