import { useState, useEffect } from 'react';
import { Download, Share } from 'lucide-react';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS && !isStandalone) {
        setShowIOSHint(true);
        setTimeout(() => setShowIOSHint(false), 8000);
      } else if (!isStandalone) {
        alert("App installation is not ready yet or is managed by your browser. Please use your browser menu (e.g., Chrome menu -> Install / Add to Home Screen).");
      }
    }
  };

  if (isStandalone) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all font-bold text-sm active:scale-95 border border-blue-500/50"
        title="Install as App"
      >
        <Download size={16} />
        Install App
      </button>

      {showIOSHint && (
        <div className="absolute top-full right-0 mt-3 w-60 bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-2xl z-50 text-slate-200 text-xs leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2 items-start">
            <Share className="text-blue-400 shrink-0" size={16} />
            <div>
              To install on iPhone/iPad:
              <br />
              1. Tap the <strong>Share</strong> button
              <br />
              2. Scroll down & tap <strong>'Add to Home Screen'</strong>
            </div>
          </div>
          <div className="absolute top-0 right-6 -mt-1.5 w-3 h-3 bg-slate-800 border-l border-t border-slate-700 rotate-45" />
        </div>
      )}
    </div>
  );
}
