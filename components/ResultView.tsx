import React from 'react';
import { Button } from './Button';
import { FeatureType, AngleOption, RoomOption, CostInfo } from '../types';

interface ResultViewProps {
  originalImage: string;
  resultImage: string;
  costInfo: CostInfo | null;
  onReset: () => void;
  onDownload: () => void;
  onGenerateMore: (feature: FeatureType, option: AngleOption | RoomOption) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ 
  originalImage, 
  resultImage, 
  costInfo,
  onReset, 
  onDownload,
  onGenerateMore 
}) => {

  const quickAngles = [
    { label: 'Chính diện', value: AngleOption.FRONT },
    { label: 'Góc nghiêng', value: AngleOption.SLANTED },
    { label: 'Góc 3/4', value: AngleOption.THREE_QUARTER },
    { label: 'Trên cao', value: AngleOption.TOP_DOWN },
    { label: 'Góc thấp', value: AngleOption.LOW_ANGLE },
    { label: 'Trái', value: AngleOption.LEFT },
    { label: 'Phải', value: AngleOption.RIGHT },
    { label: 'Sau', value: AngleOption.BACK },
  ];

  const quickRooms = [
    { label: 'Phòng khách', value: RoomOption.LIVING_ROOM },
    { label: 'Phòng ăn', value: RoomOption.DINING_ROOM },
    { label: 'Phòng ngủ', value: RoomOption.BEDROOM },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 pb-12">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kết quả xử lý</h2>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-xs text-green-600 font-medium flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Thanh toán thành công (Paid)
            </span>
            {costInfo && (
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-green-100">
                Chi phí: {costInfo.usd} / {costInfo.vnd}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onReset}>
            Tải ảnh khác
          </Button>
          <Button onClick={onDownload}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Tải ảnh xuống
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-[400px] flex items-center justify-center bg-checkered">
            <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
          </div>
          <p className="text-center font-medium text-gray-600">Ảnh gốc</p>
        </div>

        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-md h-[400px] flex items-center justify-center bg-checkered relative overflow-hidden group">
            <img src={resultImage} alt="Processed" className="max-w-full max-h-full object-contain" />
          </div>
          <p className="text-center font-medium text-indigo-600">Ảnh đã xử lý</p>
        </div>
      </div>
      
      {/* Quick Action Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Thử ngay kiểu khác từ ảnh gốc này <span className="ml-2 text-xs font-normal text-gray-400">(Est: $0.002 / 50đ each)</span>
        </h3>
        
        <div className="space-y-6">
          {/* Angle Options */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Góc nhìn sản phẩm</p>
            <div className="flex flex-wrap gap-2">
              {quickAngles.map((angle) => (
                <button
                  key={angle.value}
                  onClick={() => onGenerateMore(FeatureType.MULTI_ANGLE, angle.value)}
                  className="px-4 py-2 text-sm bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-lg transition-colors"
                >
                  {angle.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Room Options */}
          <div>
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Phối cảnh không gian</p>
             <div className="flex flex-wrap gap-2">
              {quickRooms.map((room) => (
                <button
                  key={room.value}
                  onClick={() => onGenerateMore(FeatureType.SCENE_PLACEMENT, room.value)}
                  className="px-4 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 hover:border-purple-300 rounded-lg transition-colors flex items-center"
                >
                  <span className="mr-1">🏠</span> {room.label}
                </button>
              ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};