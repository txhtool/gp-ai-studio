import React from 'react';
import { FeatureType, AngleOption, RoomOption } from '../types';

interface FeatureSelectorProps {
  onSelect: (feature: FeatureType, option: AngleOption | RoomOption) => void;
  onBack: () => void;
  imageSrc: string;
}

export const FeatureSelector: React.FC<FeatureSelectorProps> = ({ onSelect, onBack, imageSrc }) => {
  const [selectedFeature, setSelectedFeature] = React.useState<FeatureType | null>(null);

  const renderOptions = () => {
    if (selectedFeature === FeatureType.MULTI_ANGLE) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Chính diện', value: AngleOption.FRONT, icon: '⏹️', desc: 'Mặt trước' },
            { label: 'Góc nghiêng', value: AngleOption.SLANTED, icon: '📐', desc: 'Nghiêng nhẹ 15-30°' },
            { label: 'Góc 3/4', value: AngleOption.THREE_QUARTER, icon: '↘️', desc: 'Góc chéo' },
            { label: 'Góc trái', value: AngleOption.LEFT, icon: '⬅️', desc: 'Nhìn từ trái' },
            { label: 'Góc phải', value: AngleOption.RIGHT, icon: '➡️', desc: 'Nhìn từ phải' },
            { label: 'Góc sau', value: AngleOption.BACK, icon: '🔙', desc: 'Mặt lưng' },
            { label: 'Trên cao', value: AngleOption.TOP_DOWN, icon: '⬇️', desc: 'Từ trên xuống' },
            { label: 'Góc thấp', value: AngleOption.LOW_ANGLE, icon: '🆙', desc: 'Hắt từ dưới lên' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(FeatureType.MULTI_ANGLE, opt.value)}
              className="flex flex-col items-center p-3 sm:p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-center group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-bl">
                $0.002
              </div>
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{opt.icon}</span>
              <span className="font-medium text-gray-900 text-sm">{opt.label}</span>
              <span className="text-xs text-gray-500 mt-1">{opt.desc}</span>
            </button>
          ))}
        </div>
      );
    }

    if (selectedFeature === FeatureType.SCENE_PLACEMENT) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Phòng khách', value: RoomOption.LIVING_ROOM, icon: '🛋️' },
            { label: 'Phòng ăn', value: RoomOption.DINING_ROOM, icon: '🍽️' },
            { label: 'Phòng ngủ', value: RoomOption.BEDROOM, icon: '🛏️' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(FeatureType.SCENE_PLACEMENT, opt.value)}
              className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-center group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-bl">
                 Est: $0.002
              </div>
              <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{opt.icon}</span>
              <span className="font-medium text-gray-900">{opt.label}</span>
              <span className="text-xs text-gray-500 mt-1">Đặt vào {opt.label.toLowerCase()} hiện đại</span>
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Chọn phương thức xử lý</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-24">
             <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                <img src={imageSrc} alt="Original" className="w-full h-full object-contain" />
             </div>
             <p className="text-center text-sm font-medium text-gray-500">Ảnh gốc</p>
          </div>
        </div>

        <div className="md:col-span-2">
          {!selectedFeature ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedFeature(FeatureType.MULTI_ANGLE)}
                className="flex flex-col text-left p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-bl border-b border-l border-green-100">
                  Est: $0.002 / 50đ
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Góc nhìn đa chiều</h3>
                <p className="text-sm text-gray-500 mt-2">Tạo các góc nhìn khác nhau của sản phẩm.</p>
              </button>

              <button
                onClick={() => setSelectedFeature(FeatureType.SCENE_PLACEMENT)}
                className="flex flex-col text-left p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-bl border-b border-l border-green-100">
                  Est: $0.002 / 50đ
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Phối cảnh nội thất</h3>
                <p className="text-sm text-gray-500 mt-2">Tách nền và đặt sản phẩm vào không gian nội thất.</p>
              </button>
            </div>
          ) : (
            <div>
               <button 
                  onClick={() => setSelectedFeature(null)}
                  className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
               >
                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 Chọn lại tính năng
               </button>
               <h3 className="text-lg font-medium text-gray-800 mb-4">
                 {selectedFeature === FeatureType.MULTI_ANGLE ? 'Chọn góc nhìn chi tiết' : 'Chọn không gian nội thất'}
               </h3>
               {renderOptions()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};