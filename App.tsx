import React, { useState, useEffect, useRef } from 'react';
import { parseReceiptImage } from './services/geminiService';
import { ReceiptItem, ExpenseCategory, ViewState, ScanResult } from './types';
import { CameraIcon, PlusIcon, ChevronLeftIcon, TrashIcon, ReceiptIcon } from './components/Icons';
import ReceiptCard from './components/ReceiptCard';
import ExportTools from './components/ExportTools';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewState>('LIST');
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<Partial<ReceiptItem>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('snapspend_receipts');
    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse receipts", e);
      }
    }
  }, []);

  // Save data to local storage on change
  useEffect(() => {
    localStorage.setItem('snapspend_receipts', JSON.stringify(receipts));
  }, [receipts]);

  // Handlers
  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setView('SCAN');
    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      // Strip prefix for Gemini API if present (data:image/jpeg;base64,)
      const base64Data = base64String.split(',')[1];
      
      try {
        // Pass the correct mime type from the file
        const mimeType = file.type || 'image/jpeg';
        const result: ScanResult = await parseReceiptImage(base64Data, mimeType);
        
        // Prepare new receipt for editing
        setCurrentReceipt({
          id: crypto.randomUUID(),
          merchant: result.merchant || 'Unknown Merchant',
          total: result.total || 0,
          date: result.date || new Date().toISOString().split('T')[0],
          category: result.category || ExpenseCategory.OTHER,
          summary: result.summary || '',
          imageBase64: base64String, // Keep full string for display
          createdAt: Date.now()
        });
        
        setIsProcessing(false);
        setView('EDIT');
      } catch (err) {
        console.error(err);
        setError("Failed to analyze receipt. Please try again or enter details manually.");
        setIsProcessing(false);
        // Still go to edit mode so they can manual entry, but with the image
        setCurrentReceipt({
            id: crypto.randomUUID(),
            imageBase64: base64String,
            createdAt: Date.now()
        });
        setView('EDIT');
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReceipt.id) return;

    const newReceipt = currentReceipt as ReceiptItem;
    
    // Check if updating existing or adding new
    const existingIndex = receipts.findIndex(r => r.id === newReceipt.id);
    if (existingIndex >= 0) {
      const updated = [...receipts];
      updated[existingIndex] = newReceipt;
      setReceipts(updated);
    } else {
      setReceipts([newReceipt, ...receipts]);
    }
    
    setView('LIST');
    setCurrentReceipt({});
  };

  const handleDeleteReceipt = (id: string) => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      setReceipts(receipts.filter(r => r.id !== id));
      setView('LIST');
    }
  };

  const openReceiptDetails = (receipt: ReceiptItem) => {
    setCurrentReceipt(receipt);
    setView('DETAILS');
  };

  const totalSpent = receipts.reduce((sum, item) => sum + item.total, 0);

  // --- RENDER VIEWS ---

  const renderList = () => (
    <div className="flex flex-col h-full relative">
      <header className="px-6 pt-12 pb-6 bg-white shadow-sm z-10">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">SnapSpend</h1>
                <p className="text-gray-500 text-sm">Track your expenses</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                SS
            </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 mt-2">
            <p className="text-blue-100 text-sm font-medium mb-1">Total Expenses</p>
            <h2 className="text-4xl font-bold">${totalSpent.toFixed(2)}</h2>
        </div>

        <div className="mt-6 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
            <ExportTools receipts={receipts} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-24 no-scrollbar">
        {receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 mt-8">
            <ReceiptIcon className="w-16 h-16 mb-4 opacity-20" />
            <p>No receipts yet.</p>
            <p className="text-sm">Tap the + button to scan one.</p>
          </div>
        ) : (
          receipts.map(receipt => (
            <ReceiptCard key={receipt.id} receipt={receipt} onClick={openReceiptDetails} />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
        <button 
            onClick={handleScanClick}
            className="w-16 h-16 bg-blue-600 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
        >
            <CameraIcon className="w-8 h-8" />
        </button>
        <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
        />
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center h-full bg-white p-8 text-center">
      <div className="animate-pulse w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8">
        <CameraIcon className="w-10 h-10 text-blue-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Analyzing Receipt...</h2>
      <p className="text-gray-500 max-w-xs">AI is reading the merchant, date, and total from your image.</p>
    </div>
  );

  const renderEditOrDetails = (isReadOnly: boolean) => {
    const isEditing = !isReadOnly;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <header className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 pt-12">
            <button 
                onClick={() => setView('LIST')} 
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-gray-800">{isEditing ? 'Verify Details' : 'Receipt Details'}</h2>
            {isEditing ? (
                <div className="w-10"></div> 
            ) : (
                 <button 
                 onClick={() => handleDeleteReceipt(currentReceipt.id!)} 
                 className="p-2 -mr-2 text-red-500 hover:bg-red-50 rounded-full"
             >
                 <TrashIcon className="w-5 h-5" />
             </button>
            )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {currentReceipt.imageBase64 && (
                <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
                    <img src={currentReceipt.imageBase64} alt="Receipt Preview" className="w-full max-h-80 object-contain bg-gray-900" />
                </div>
            )}
            
            {error && isEditing && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            <form id="receipt-form" onSubmit={handleSaveReceipt} className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Merchant</label>
                        <input 
                            type="text" 
                            required
                            disabled={isReadOnly}
                            value={currentReceipt.merchant || ''} 
                            onChange={e => setCurrentReceipt({...currentReceipt, merchant: e.target.value})}
                            className="w-full text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 disabled:border-transparent"
                            placeholder="Store Name"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Total</label>
                            <div className="relative">
                                <span className="absolute left-0 top-1 text-gray-500">$</span>
                                <input 
                                    type="number" 
                                    required
                                    step="0.01"
                                    disabled={isReadOnly}
                                    value={currentReceipt.total || ''} 
                                    onChange={e => setCurrentReceipt({...currentReceipt, total: parseFloat(e.target.value)})}
                                    className="w-full pl-4 text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 disabled:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date</label>
                            <input 
                                type="date" 
                                required
                                disabled={isReadOnly}
                                value={currentReceipt.date || ''} 
                                onChange={e => setCurrentReceipt({...currentReceipt, date: e.target.value})}
                                className="w-full text-lg text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 disabled:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Category</label>
                        <select 
                            value={currentReceipt.category || ExpenseCategory.OTHER} 
                            disabled={isReadOnly}
                            onChange={e => setCurrentReceipt({...currentReceipt, category: e.target.value as ExpenseCategory})}
                            className="w-full text-base text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-2 disabled:border-transparent appearance-none"
                        >
                            {Object.values(ExpenseCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Summary (AI Generated)</label>
                        <textarea
                             rows={2}
                             disabled={isReadOnly}
                             value={currentReceipt.summary || ''}
                             onChange={e => setCurrentReceipt({...currentReceipt, summary: e.target.value})}
                             className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 disabled:border-transparent resize-none"
                             placeholder="Brief description of items..."
                        />
                    </div>
                </div>
            </form>
        </div>

        {isEditing ? (
            <div className="p-6 bg-white border-t border-gray-100 safe-area-bottom">
                <button 
                    type="submit" 
                    form="receipt-form"
                    className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform"
                >
                    Save Receipt
                </button>
            </div>
        ) : (
            <div className="p-6 bg-white border-t border-gray-100 safe-area-bottom flex gap-3">
                 <button 
                    onClick={() => setView('EDIT')}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Edit
                </button>
                <button 
                    onClick={() => setView('LIST')}
                    className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform"
                >
                    Done
                </button>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans shadow-2xl">
      {view === 'LIST' && renderList()}
      {view === 'SCAN' && renderProcessing()}
      {view === 'EDIT' && renderEditOrDetails(false)}
      {view === 'DETAILS' && renderEditOrDetails(true)}
    </div>
  );
};

export default App;