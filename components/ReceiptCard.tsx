import React from 'react';
import { ReceiptItem } from '../types';

interface ReceiptCardProps {
  receipt: ReceiptItem;
  onClick: (receipt: ReceiptItem) => void;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onClick }) => {
  const dateObj = new Date(receipt.date);
  const formattedDate = isNaN(dateObj.getTime()) ? receipt.date : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div 
      onClick={() => onClick(receipt)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer mb-3"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
            {receipt.imageBase64 ? (
                <img src={receipt.imageBase64} alt="Receipt" className="w-full h-full object-cover" />
            ) : (
                <span className="text-blue-500">🧾</span>
            )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 truncate max-w-[150px]">{receipt.merchant}</h3>
          <p className="text-xs text-gray-500">{receipt.category}</p>
          <p className="text-xs text-gray-400">{formattedDate}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="block font-bold text-gray-900">${receipt.total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ReceiptCard;