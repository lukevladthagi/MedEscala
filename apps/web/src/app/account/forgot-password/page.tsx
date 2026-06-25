'use client';

import { useState, type FormEvent } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/account/reset-password`,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Nao foi possivel enviar o e-mail de recuperacao');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel enviar o e-mail de recuperacao');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf2f7] px-[24px] py-[42px] text-[#071b33]">
      <section className="w-full max-w-[470px] rounded-[12px] border border-[#d8e0ea] bg-white p-[28px] shadow-sm">
        <img src="/prontoescala-logo.png" alt="ProntoEscala" className="mb-[28px] h-[78px] w-full object-contain" />

        <div className="mb-[22px] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#e7eef7] text-[#002d6b]">
          <ShieldCheck className="h-[22px] w-[22px]" />
        </div>

        <h1 className="text-[26px] font-semibold text-[#071b33]">Recuperar senha</h1>
        <p className="mt-[8px] text-[14px] leading-[1.65] text-[#5c6b7a]">
          Informe seu e-mail cadastrado para receber o link de redefinição de senha.
        </p>

        {!submitted ? (
          <form onSubmit={onSubmit} className="mt-[24px]">
            <label className="block text-[13px] font-medium text-[#31445c]">
              E-mail
              <div className="mt-[7px] flex h-[46px] items-center rounded-[6px] border border-[#cbd6e3] bg-white px-[12px] transition focus-within:border-[#002d6b] focus-within:ring-2 focus-within:ring-[#002d6b]/10">
                <Mail className="mr-[10px] h-[17px] w-[17px] text-[#7890a8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@hospital.com.br"
                  className="h-full flex-1 bg-transparent text-[15px] text-[#071b33] outline-none placeholder:text-[#9aa8b6]"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-[18px] h-[48px] w-full rounded-[7px] bg-[#002d6b] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#012653]"
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>

            {error && (
              <div className="mt-[16px] rounded-[8px] border border-red-200 bg-red-50 px-[12px] py-[10px] text-[14px] text-red-700">
                {error}
              </div>
            )}
          </form>
        ) : (
          <div className="mt-[24px] rounded-[8px] border border-[#bfd0e2] bg-[#f8fafc] p-[16px] text-[14px] leading-[1.65] text-[#40536a]">
            Se <strong className="text-[#002d6b]">{email}</strong> estiver cadastrado, o link de redefinição será
            enviado para esse e-mail em instantes.
          </div>
        )}

        <a
          href="/account/signin"
          className="mt-[22px] inline-flex items-center gap-[8px] text-[13px] font-semibold text-[#002d6b] hover:underline"
        >
          <ArrowLeft className="h-[15px] w-[15px]" />
          Voltar para o login
        </a>
      </section>
    </main>
  );
}
