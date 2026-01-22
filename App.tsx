import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { FeatureSelector } from './components/FeatureSelector';
import { ResultView } from './components/ResultView';
import { AppStep, FeatureType, AngleOption, RoomOption, CostInfo } from './types';
import { generateFurnitureImage, MODEL_NAME } from './services/geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [costInfo, setCostInfo] = useState<CostInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  // Check for billing/API key connection on mount
  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for development if not in AI Studio environment
        // Assume true if process.env.API_KEY is present, otherwise false
        setHasApiKey(!!process.env.API_KEY);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setHasApiKey(false);
    } finally {
      setCheckingKey(false);
    }
  };

  const handleConnectBilling = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Assume success after dialog closes (race condition mitigation per instructions)
        setHasApiKey(true);
      } else {
        alert("Chức năng này chỉ hoạt động trong môi trường Google AI Studio hoặc môi trường được hỗ trợ.");
      }
    } catch (e) {
      console.error("Error opening key selector:", e);
    }
  };

  const handleImageSelected = (base64: string) => {
    setOriginalImage(base64);
    setStep(AppStep.SELECT_FEATURE);
    setError(null);
  };

  const handleFeatureSelect = async (feature: FeatureType, option: AngleOption | RoomOption) => {
    if (!originalImage) return;

    setStep(AppStep.PROCESSING);
    setLoading(true);
    setError(null);

    try {
      const result = await generateFurnitureImage(originalImage, feature, option);
      setResultImage(result.imageUrl);
      setCostInfo(result.cost);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      console.error("Processing error:", err);
      let errorMessage = err.message || "Đã xảy ra lỗi trong quá trình xử lý.";
      
      if (errorMessage === "KEY_ERROR") {
         errorMessage = "Lỗi xác thực thanh toán. Vui lòng kết nối lại tài khoản.";
         setHasApiKey(false); // Force re-authentication
      } else if (
        errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('exhausted') || 
        errorMessage.includes('Resource has been exhausted')
      ) {
        if (errorMessage.includes('limit: 0') || errorMessage.includes('limit:0')) {
             errorMessage = "Tài khoản thanh toán của bạn đã hết hạn mức. Vui lòng kiểm tra lại Google Cloud Billing.";
        } else {
             errorMessage = "Hệ thống đang bận (Quá tải). Vui lòng đợi khoảng 1 phút rồi thử lại.";
        }
      }

      setError(errorMessage);
      setStep(AppStep.SELECT_FEATURE); // Go back to selection on error
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setCostInfo(null);
    setStep(AppStep.UPLOAD);
    setError(null);
  };

  const handleBackToSelect = () => {
    setStep(AppStep.SELECT_FEATURE);
  };
  
  const handleBackToUpload = () => {
    setStep(AppStep.UPLOAD);
    setOriginalImage(null);
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `furniture-processed-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Processing View
  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý hình ảnh...</h2>
      <p className="text-gray-500 text-center max-w-md mb-2">
        AI đang phân tích và tái tạo không gian. Quá trình này có thể mất từ <b>15-30 giây</b> để đảm bảo chất lượng cao nhất.
      </p>
      <p className="text-indigo-500 text-sm font-medium animate-pulse mt-4">
        Chi phí ước tính: ~$0.002 / 50đ cho tác vụ này
      </p>
    </div>
  );

  // Billing Gate View
  const renderBillingGate = () => (
    <div className="max-w-xl mx-auto mt-20 px-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Thiết lập thanh toán</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Ứng dụng sử dụng mô hình Gemini Pro Vision chất lượng cao. Để bắt đầu, vui lòng kết nối tài khoản Google Cloud của bạn.
          <br/><span className="text-sm text-gray-500 mt-2 block">(Chi phí tính theo mỗi lượt tạo ảnh thành công)</span>
        </p>
        
        <Button onClick={handleConnectBilling} fullWidth className="mb-4 text-lg py-4">
          Kết nối tài khoản & Bắt đầu
        </Button>
        
        <div className="text-xs text-gray-400">
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500">
            Xem bảng giá chi tiết của Google Gemini
          </a>
        </div>
      </div>
    </div>
  );

  if (checkingKey) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse text-indigo-600 font-medium">Đang kiểm tra thông tin...</div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow w-full">
        {!hasApiKey ? (
          renderBillingGate()
        ) : (
          <>
            {error && (
              <div className="max-w-4xl mx-auto mt-6 px-4">
                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative shadow-sm" role="alert">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 pr-8">
                        <h3 className="text-sm font-medium text-red-800">Lỗi xử lý</h3>
                        <div className="mt-1 text-sm text-red-700">
                          {error}
                        </div>
                      </div>
                      <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                          <button
                            onClick={() => setError(null)}
                            className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                          >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {step === AppStep.UPLOAD && (
              <UploadSection onImageSelected={handleImageSelected} />
            )}

            {step === AppStep.SELECT_FEATURE && originalImage && (
              <FeatureSelector 
                onSelect={handleFeatureSelect} 
                onBack={handleBackToUpload}
                imageSrc={originalImage}
              />
            )}

            {step === AppStep.PROCESSING && renderProcessing()}

            {step === AppStep.RESULT && originalImage && resultImage && (
              <ResultView 
                originalImage={originalImage}
                resultImage={resultImage}
                costInfo={costInfo}
                onReset={handleReset}
                onDownload={handleDownload}
                onGenerateMore={handleFeatureSelect}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} GP AI Studio.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Powered by 
            <span className="font-semibold text-indigo-500">{MODEL_NAME}</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;