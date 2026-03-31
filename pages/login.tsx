import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPageWithLayout } from './_app';
import Image from 'next/image';
import Head from 'next/head';

const Login: NextPageWithLayout = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    fetch('/api/auth/me').then((r) => {
      if (r.ok) router.replace('/');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar sesión');
      } else {
        router.replace('/');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Iniciar Sesión – Lobato Tours</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-[#060818] dark:to-[#1b2e4b] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-[#1b2e4b] rounded-2xl shadow-xl overflow-hidden">
            {/* Header strip */}
            <div className="bg-primary px-8 py-8 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white rounded-xl p-2 shadow">
                  <Image
                    src="/assets/images/logos/logo-lobato-2.jpg"
                    alt="Lobato Tours"
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
              <h1 className="text-white text-2xl font-bold mt-2">Lobato Tours</h1>
              <p className="text-sky-100 text-sm mt-1">Sistema de Cotizaciones</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-1">
                  Usuario o Email
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-[#253a5e] dark:border-[#253a5e] dark:text-white"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary pr-10 dark:bg-[#253a5e] dark:border-[#253a5e] dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-[#5c6f8a] dark:hover:text-white"
                  >
                    {showPwd ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div className="px-8 pb-6 text-center text-xs text-gray-400 dark:text-[#5c6f8a]">
              Lobato Tours © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Skip the DefaultLayout for the login page (full-screen form)
Login.getLayout = (page) => page;

export default Login;
