import React from 'react';
import { ReceiptItem } from '../types';
import { DownloadIcon, MailIcon } from './Icons';

interface ExportToolsProps {
  receipts: ReceiptItem[];
}

const ExportTools: React.FC<ExportToolsProps> = ({ receipts }) => {
  
  const generateCSV = (): string => {
    const headers = ['Date', 'Merchant', 'Category', 'Total', 'Summary', 'ID'];
    const rows = receipts.map(r => [
      r.date,
      `"${r.merchant.replace(/"/g, '""')}"`, // Escape quotes
      `"${r.category}"`,
      r.total.toFixed(2),
      `"${(r.summary || '').replace(/"/g, '""')}"`,
      r.id
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const handleDownload = () => {
    if (receipts.length === 0) return;
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `snapspend_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmail = () => {
    if (receipts.length === 0) return;
    const csvContent = generateCSV();
    const subject = encodeURIComponent(`Expense Report - ${new Date().toLocaleDateString()}`);
    
    // Note: Mailto body length is limited. We summarize in body and suggest attaching the CSV manually if needed, 
    // or just dumping the CSV text if short enough.
    const bodyStart = "Here is your expense report in CSV format (copy and save as .csv to open in Excel):\n\n";
    const body = encodeURIComponent(bodyStart + csvContent);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleDownload}
        disabled={receipts.length === 0}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
      >
        <DownloadIcon className="w-4 h-4" />
        Excel/CSV
      </button>
      <button 
        onClick={handleEmail}
        disabled={receipts.length === 0}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
      >
        <MailIcon className="w-4 h-4" />
        Email
      </button>
    </div>
  );
};

export default ExportTools;