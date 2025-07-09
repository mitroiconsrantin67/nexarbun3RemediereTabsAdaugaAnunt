import React, { useState, useEffect } from 'react';
import { X, Check, Settings, Info, Cookie, Shield, BarChart3, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Întotdeauna true, nu poate fi dezactivat
    analytics: false,
    marketing: false,
    functional: false
  });

  // Verifică dacă utilizatorul a setat deja preferințele
  useEffect(() => {
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      // Arătăm banner-ul după o scurtă întârziere pentru o experiență mai bună
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      // Încarcă preferințele salvate
      try {
        const savedPreferences = localStorage.getItem('cookiePreferences');
        if (savedPreferences) {
          setPreferences({
            ...JSON.parse(savedPreferences),
            essential: true // Întotdeauna true
          });
        }
      } catch (e) {
        console.error('Eroare la încărcarea preferințelor cookie:', e);
      }
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
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    setPreferences(essentialOnly);
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return; // Nu permitem modificarea cookie-urilor esențiale
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleOpenPreferences = () => {
    setShowPreferences(true);
  };

  const handleClosePreferences = () => {
    setShowPreferences(false);
  };

  // Funcție pentru a deschide din nou banner-ul (pentru footer)
  const openCookieSettings = () => {
    setIsVisible(true);
  };

  // Expunem funcția global pentru a putea fi accesată din alte componente
  useEffect(() => {
    (window as any).openCookieSettings = openCookieSettings;
    
    return () => {
      // Curățăm funcția globală la demontarea componentei
      delete (window as any).openCookieSettings;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white shadow-lg border-t border-gray-200 animate-slide-up">
      {!showPreferences ? (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acest site folosește cookie-uri</h3>
              <p className="text-gray-600 text-sm">
                Folosim cookie-uri pentru a îmbunătăți experiența ta pe site. Unele sunt necesare pentru funcționarea site-ului, 
                în timp ce altele ne ajută să înțelegem cum este utilizat site-ul.{' '}
                <Link to="/cookies" className="text-nexar-accent hover:underline">
                  Află mai multe despre cookie-uri
                </Link>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={handleOpenPreferences}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferințe
              </button>
              
              <button 
                onClick={handleAcceptEssential}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Doar esențiale
              </button>
              
              <button 
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-nexar-accent text-white rounded-lg font-medium hover:bg-nexar-gold transition-colors"
              >
                Accept toate
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Preferințe Cookie-uri</h3>
            <button 
              onClick={handleClosePreferences}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cookie-uri Esențiale</h4>
                    <p className="text-sm text-gray-600">Necesare pentru funcționarea site-ului</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-green-600 mr-2">Întotdeauna active</span>
                <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cookie-uri Analitice</h4>
                    <p className="text-sm text-gray-600">Ne ajută să înțelegem cum folosești site-ul</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange('analytics')}
                className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                  preferences.analytics 
                    ? 'bg-nexar-accent justify-end' 
                    : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cookie-uri Marketing</h4>
                    <p className="text-sm text-gray-600">Pentru reclame personalizate</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange('marketing')}
                className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                  preferences.marketing 
                    ? 'bg-nexar-accent justify-end' 
                    : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <Settings className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cookie-uri Funcționale</h4>
                    <p className="text-sm text-gray-600">Pentru funcționalități avansate și personalizare</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange('functional')}
                className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                  preferences.functional 
                    ? 'bg-nexar-accent justify-end' 
                    : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button 
              onClick={handleAcceptEssential}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Doar esențiale
            </button>
            
            <button 
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Accept toate
            </button>
            
            <button 
              onClick={handleSavePreferences}
              className="px-4 py-2 bg-nexar-accent text-white rounded-lg font-medium hover:bg-nexar-gold transition-colors"
            >
              Salvează preferințele
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsent;