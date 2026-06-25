'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam ? 'Link de redefinição inválido ou expirado.' : null,
  );
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Token de redefinição não encontrado.');
      return;
    }

    if (password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas informadas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Não foi possível redefinir a senha.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
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

        <h1 className="text-[26px] font-semibold text-[#071b33]">Definir nova senha</h1>
        <p className="mt-[8px] text-[14px] leading-[1.65] text-[#5c6b7a]">
          Cadastre uma nova senha para acessar o ProntoEscala.
        </p>

        {success ? (
          <div className="mt-[24px] rounded-[8px] border border-emerald-200 bg-emerald-50 p-[16px] text-[14px] leading-[1.65] text-emerald-800">
            Senha redefinida com sucesso. Você já pode voltar para o login e acessar o sistema.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-[24px] space-y-[16px]">
            <label className="block text-[13px] font-medium text-[#31445c]">
              Nova senha
              <div className="mt-[7px] flex h-[46px] items-center rounded-[6px] border border-[#cbd6e3] bg-white px-[12px] transition focus-within:border-[#002d6b] focus-within:ring-2 focus-within:ring-[#002d6b]/10">
                <Lock className="mr-[10px] h-[17px] w-[17px] text-[#7890a8]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  className="h-full flex-1 bg-transparent text-[15px] text-[#071b33] outline-none placeholder:text-[#9aa8b6]"
                />
              </div>
            </label>

            <label className="block text-[13px] font-medium text-[#31445c]">
              Confirmar senha
              <div className="mt-[7px] flex h-[46px] items-center rounded-[6px] border border-[#cbd6e3] bg-white px-[12px] transition focus-within:border-[#002d6b] focus-within:ring-2 focus-within:ring-[#002d6b]/10">
                <Lock className="mr-[10px] h-[17px] w-[17px] text-[#7890a8]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="h-full flex-1 bg-transparent text-[15px] text-[#071b33] outline-none placeholder:text-[#9aa8b6]"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-[8px] border border-red-200 bg-red-50 px-[12px] py-[10px] text-[14px] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="h-[48px] w-full rounded-[7px] bg-[#002d6b] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#012653] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
