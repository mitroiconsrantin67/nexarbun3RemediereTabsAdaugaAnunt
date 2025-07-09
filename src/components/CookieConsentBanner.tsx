import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Check, Settings, Cookie } from 'lucide-react';
import { savePreferences, loadPreferences, hasConsent, activateTracking } from '../lib/cookieManager';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Întotdeauna activat, nu poate fi dezactivat
    analytics: false,
    marketing: false,
    functional: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Verificăm dacă utilizatorul a setat deja preferințele
    const consentGiven = hasConsent();
    
    if (!consentGiven) {
      // Arătăm banner-ul după 1 secundă pentru o experiență mai bună
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Încărcăm preferințele salvate
      const savedPreferences = loadPreferences();
      setPreferences(savedPreferences);
      
      // Activăm cookie-urile conform preferințelor
      activateTracking(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    activateTracking(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
    activateTracking(essentialOnly);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    activateTracking(preferences);
    setIsVisible(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return; // Nu permitem dezactivarea cookie-urilor esențiale
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleCookiePolicyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVisible(false);
    navigate('/cookies');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg animate-slide-up">
      {!showPreferences ? (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Cookie className="h-6 w-6 text-nexar-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Acest site folosește cookie-uri</h3>
                <p className="text-gray-600 text-sm">
                  Folosim cookie-uri pentru a îmbunătăți experiența ta pe site, pentru analiză și pentru a personaliza conținutul. 
                  Poți afla mai multe în <Link to="/cookies" onClick={handleCookiePolicyClick} className="text-nexar-accent hover:underline">Politica de Cookies</Link>.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 md:mt-0">
              <button 
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm flex items-center justify-center"
                aria-label="Setează preferințele pentru cookie-uri"
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferințe
              </button>
              <button 
                onClick={handleRejectAll}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
                aria-label="Acceptă doar cookie-urile esențiale"
              >
                Doar esențiale
              </button>
              <button 
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-nexar-accent text-white rounded-lg font-medium hover:bg-nexar-gold transition-colors text-sm"
                aria-label="Acceptă toate cookie-urile"
              >
                Accept toate
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <Cookie className="h-5 w-5 text-nexar-accent" />
              <h3 className="text-lg font-semibold text-gray-900">Preferințe Cookie-uri</h3>
            </div>
            <button 
              onClick={() => setShowPreferences(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Închide panoul de preferințe"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            {/* Cookie-uri Esențiale */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">Cookie-uri Esențiale</h4>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Necesare</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Necesare pentru funcționarea de bază a site-ului</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600 font-medium">Întotdeauna Active</span>
                <div className="w-10 h-5 bg-green-500 rounded-full flex items-center justify-end px-0.5">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Cookie-uri de Analiză */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Cookie-uri de Analiză</h4>
                <p className="text-sm text-gray-600 mt-1">Ne ajută să înțelegem cum utilizezi site-ul</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('analytics')}
                className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                  preferences.analytics ? 'bg-nexar-accent justify-end' : 'bg-gray-300 justify-start'
                } px-0.5`}
                aria-label={preferences.analytics ? 'Dezactivează cookie-uri de analiză' : 'Activează cookie-uri de analiză'}
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
            
            {/* Cookie-uri de Marketing */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Cookie-uri de Marketing</h4>
                <p className="text-sm text-gray-600 mt-1">Pentru personalizarea reclamelor și conținutului</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('marketing')}
                className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                  preferences.marketing ? 'bg-nexar-accent justify-end' : 'bg-gray-300 justify-start'
                } px-0.5`}
                aria-label={preferences.marketing ? 'Dezactivează cookie-uri de marketing' : 'Activează cookie-uri de marketing'}
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
            
            {/* Cookie-uri Funcționale */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Cookie-uri Funcționale</h4>
                <p className="text-sm text-gray-600 mt-1">Pentru funcții avansate și personalizare</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('functional')}
                className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                  preferences.functional ? 'bg-nexar-accent justify-end' : 'bg-gray-300 justify-start'
                } px-0.5`}
                aria-label={preferences.functional ? 'Dezactivează cookie-uri funcționale' : 'Activează cookie-uri funcționale'}
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={handleRejectAll}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm flex items-center justify-center"
              aria-label="Acceptă doar cookie-urile esențiale"
            >
              <X className="h-4 w-4 mr-2" />
              Doar esențiale
            </button>
            <button 
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm flex items-center justify-center"
              aria-label="Acceptă toate cookie-urile"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept toate
            </button>
            <button 
              onClick={handleSavePreferences}
              className="px-4 py-2 bg-nexar-accent text-white rounded-lg font-medium hover:bg-nexar-gold transition-colors text-sm"
              aria-label="Salvează preferințele pentru cookie-uri"
            >
              Salvează preferințele
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsentBanner;