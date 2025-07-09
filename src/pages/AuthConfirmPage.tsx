import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthConfirmPage = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email_change',
      });
    }

    window.scrollTo(0, 0);
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/Nexar - logo_black & red.png"
              alt="Nexar Logo"
              className="h-24 w-auto"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src.includes('Nexar - logo_black & red.png')) {
                  target.src = '/nexar-logo.png';
                } else if (target.src.includes('nexar-logo.png')) {
                  target.src = '/image.png';
                } else {
                  target.style.display = 'none';
                }
              }}
            />
          </div>

          {/* Mesaj de succes */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Felicitări! Ai fost autentificat cu succes!
          </h2>
        </div>
      </div>
    </div>
  );
};

export default AuthConfirmPage;
