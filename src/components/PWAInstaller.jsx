import React, { useState, useEffect } from 'react';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <div className="pwa-installer-banner">
      <div className="pwa-installer-content">
        <span>📱 Instala nuestra app para una mejor experiencia</span>
        <button onClick={handleInstallClick} className="install-btn">
          Instalar App
        </button>
        <button 
          onClick={() => setIsInstallable(false)} 
          className="close-btn"
        >
          ×
        </button>
      </div>
      
      <style jsx>{`
        .pwa-installer-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #f57710;
          color: white;
          padding: 15px;
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }
        
        .pwa-installer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .install-btn {
          background: white;
          color: #f57710;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .close-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          margin-left: 10px;
        }
      `}</style>
    </div>
  );
};

export default PWAInstaller;