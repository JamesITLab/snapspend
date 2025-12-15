import React, { useState, useEffect } from 'react';

export const IOSInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user is on iOS
    const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    // Check if already in standalone mode (installed)
    const isStandalone = (window.navigator as any).standalone === true;

    // Show prompt only on iOS web browser
    if (isIOS && !isStandalone) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-200 z-50 animate-bounce-subtle">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-bold text-gray-900 mb-1">Install SnapSpend</p>
          <p className="text-sm text-gray-600">
            Tap <span className="inline-block px-1"><svg className="w-5 h-5 inline text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span> below, then select <span className="font-semibold">"Add to Home Screen"</span> <span className="inline-block border border-gray-300 rounded px-1 text-xs bg-gray-50">+</span>.
          </p>
        </div>
        <button 
          onClick={() => setShowPrompt(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      {/* Little arrow pointing down */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"></div>
    </div>
  );
};