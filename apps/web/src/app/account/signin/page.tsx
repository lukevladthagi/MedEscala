/**
 * ⚠ ANYTHING PLATFORM — DO NOT REWRITE THIS FILE ⚠
 *
 * Shipped v2 auth scaffolding. Same contract as signup/page.tsx: <form
 * onSubmit>, e.preventDefault(), and window.location.href redirect are all
 * load-bearing for the mobile WebView. DO NOT replace <form onSubmit> with
 * <button onClick> — that broke signin platform-wide in a prior AI rewrite.
 *
 *   Safe:   restyle, rewrite copy, add form fields.
 *   Unsafe: replacing <form>, removing preventDefault, bypassing
 *           authClient.signIn.email, changing the callbackUrl redirect.
 */
'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message ?? 'Não foi possível entrar');
      setLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.href = callbackUrl;
    } else {
      console.warn('signin: window is undefined; cannot redirect to callbackUrl');
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#f4f7fb] via-white to-[#e8edf3] p-[16px]">
      <form
        onSubmit={(e) => { void onSubmit(e); }}
        className="flex w-full max-w-[420px] flex-col gap-[16px] rounded-[12px] border border-[#d7dde3] bg-white p-[24px] shadow"
      >
        <img src="/prontoescala-logo.png" alt="ProntoEscala" className="mx-auto h-[76px] w-full object-contain" />
        <h1 className="text-[24px] font-semibold text-[#002d6b]">Entrar</h1>
        <p className="text-[14px] text-[#5f676c]">Use seu e-mail e senha cadastrados no sistema.</p>

        <label className="flex flex-col gap-[4px] text-[14px]">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[8px] border border-gray-300 p-[10px] text-[16px] outline-none focus:border-[#002d6b]"
          />
        </label>

        <label className="flex flex-col gap-[4px] text-[14px]">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[8px] border border-gray-300 p-[10px] text-[16px] outline-none focus:border-[#002d6b]"
          />
        </label>

        {error && (
          <div className="rounded-[8px] bg-red-50 p-[10px] text-[14px] text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-[8px] bg-[#002d6b] p-[12px] text-[16px] font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <a
          href={`/account/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-center text-[14px] text-[#002d6b] hover:underline"
        >
          Ainda não tem conta? Criar cadastro
        </a>
      </form>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
