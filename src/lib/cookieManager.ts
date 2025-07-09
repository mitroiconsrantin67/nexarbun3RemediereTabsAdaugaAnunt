/**
 * Utilitar pentru gestionarea cookie-urilor în aplicația Nexar
 */

// Tipuri pentru preferințele cookie-urilor
export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

// Funcție pentru a seta un cookie
export const setCookie = (name: string, value: string, days: number = 365): void => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

// Funcție pentru a obține valoarea unui cookie
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  
  return null;
};

// Funcție pentru a șterge un cookie
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Funcție pentru a salva preferințele cookie-urilor
export const savePreferences = (preferences: CookiePreferences): void => {
  localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
  localStorage.setItem('cookieConsentGiven', 'true');
  
  // Setăm cookie-urile conform preferințelor
  setCookie('essential', 'true', 365); // Esențiale sunt întotdeauna true
  
  if (preferences.analytics) {
    setCookie('analytics', 'true', 365);
  } else {
    deleteCookie('analytics');
  }
  
  if (preferences.marketing) {
    setCookie('marketing', 'true', 365);
  } else {
    deleteCookie('marketing');
  }
  
  if (preferences.functional) {
    setCookie('functional', 'true', 365);
  } else {
    deleteCookie('functional');
  }
};

// Funcție pentru a încărca preferințele cookie-urilor
export const loadPreferences = (): CookiePreferences => {
  const savedPreferences = localStorage.getItem('cookiePreferences');
  
  if (savedPreferences) {
    try {
      const preferences = JSON.parse(savedPreferences) as CookiePreferences;
      return {
        ...preferences,
        essential: true // Esențiale sunt întotdeauna true
      };
    } catch (error) {
      console.error('Eroare la parsarea preferințelor cookie:', error);
    }
  }
  
  // Preferințe implicite dacă nu există nimic salvat
  return {
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  };
};

// Funcție pentru a verifica dacă utilizatorul a dat consimțământul
export const hasConsent = (): boolean => {
  return localStorage.getItem('cookieConsentGiven') === 'true';
};

// Funcție pentru a verifica dacă un anumit tip de cookie este permis
export const isCookieAllowed = (type: keyof CookiePreferences): boolean => {
  if (type === 'essential') return true; // Esențiale sunt întotdeauna permise
  
  const preferences = loadPreferences();
  return preferences[type] === true;
};

// Funcție pentru a activa scripturile de tracking în funcție de preferințe
export const activateTracking = (preferences: CookiePreferences): void => {
  // Aici ai putea implementa logica pentru activarea scripturilor de tracking
  // în funcție de preferințele utilizatorului
  
  if (preferences.analytics) {
    // Activează Google Analytics
    console.log('Activare Google Analytics');
    // window.gtag('consent', 'update', { analytics_storage: 'granted' });
  }
  
  if (preferences.marketing) {
    // Activează Facebook Pixel
    console.log('Activare Facebook Pixel');
    // window.fbq('consent', 'grant');
  }
  
  if (preferences.functional) {
    // Activează alte scripturi funcționale
    console.log('Activare scripturi funcționale');
  }
};