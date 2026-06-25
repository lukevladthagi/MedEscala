/**
 * Auth page contract:
 * Keep <form onSubmit>, preventDefault, authClient.signIn.email and the
 * callbackUrl redirect. The mobile WebView and web auth flow depend on it.
 */
'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CalendarCheck, Clock3, Lock, Mail, ShieldCheck, UsersRound } from 'lucide-react';
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
    <main className="grid min-h-screen w-full bg-white text-[#071b33] lg:grid-cols-[1.12fr_1fr]">
      <section className="relative flex min-h-[44vh] flex-col overflow-hidden border-b border-[#d8e0ea] bg-[#edf2f7] px-[24px] py-[26px] lg:min-h-screen lg:border-b-0 lg:border-r lg:px-[44px] lg:py-[36px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,45,107,0.13),transparent_30%),radial-gradient(circle_at_82%_76%,rgba(132,142,148,0.16),transparent_34%)]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex h-[120px] w-[280px] items-center justify-center rounded-[4px] bg-white p-[18px] shadow-sm ring-1 ring-[#dbe3ec] sm:w-[330px]">
            <img src="/prontoescala-logo.png" alt="ProntoEscala" className="h-full w-full object-contain" />
          </div>

          <div className="mt-auto max-w-[680px] pb-[26px] pt-[72px] lg:pb-[72px]">
            <p className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.34em] text-[#607184]">
              Gestão de escalas e plantões
            </p>
            <h1 className="max-w-[640px] text-[42px] font-semibold leading-[1.08] text-[#002d6b] lg:text-[54px]">
              Organizar jornadas, plantões, presença e indicadores.
            </h1>
            <p className="mt-[22px] max-w-[650px] text-[16px] leading-[1.7] text-[#40536a]">
              Controle operacional para equipes assistenciais e administrativas acompanharem escalas, check-ins,
              treinamentos e rotinas de presença com rastreabilidade.
            </p>
          </div>

          <div className="grid gap-[10px] sm:grid-cols-3">
            {[
              { icon: CalendarCheck, label: 'Escalas por setor' },
              { icon: Clock3, label: 'Check-in e checkout' },
              { icon: ShieldCheck, label: 'Registro rastreável' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex h-[54px] items-center gap-[10px] rounded-[8px] border border-[#d6e0ea] bg-white/72 px-[14px] text-[13px] font-medium text-[#31445c] shadow-sm"
              >
                <item.icon className="h-[17px] w-[17px] text-[#002d6b]" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-[56vh] items-center justify-center px-[24px] py-[42px] lg:min-h-screen lg:px-[48px]">
        <form
          onSubmit={(e) => {
            void onSubmit(e);
          }}
          className="w-full max-w-[430px]"
        >
          <div className="mb-[34px]">
            <div className="mb-[16px] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#e7eef7] text-[#002d6b]">
              <UsersRound className="h-[22px] w-[22px]" />
            </div>
            <h2 className="text-[28px] font-semibold text-[#071b33]">Entrar no painel</h2>
            <p className="mt-[8px] text-[14px] leading-[1.6] text-[#5c6b7a]">
              Acesso para gestores, coordenação e equipes autorizadas.
            </p>
          </div>

          <div className="space-y-[16px]">
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

            <label className="block text-[13px] font-medium text-[#31445c]">
              <span className="flex items-center justify-between">
                Senha
                <a href="/account/forgot-password" className="text-[12px] font-semibold text-[#002d6b] hover:underline">
                  Esqueci a senha
                </a>
              </span>
              <div className="mt-[7px] flex h-[46px] items-center rounded-[6px] border border-[#cbd6e3] bg-white px-[12px] transition focus-within:border-[#002d6b] focus-within:ring-2 focus-within:ring-[#002d6b]/10">
                <Lock className="mr-[10px] h-[17px] w-[17px] text-[#7890a8]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="h-full flex-1 bg-transparent text-[15px] text-[#071b33] outline-none placeholder:text-[#9aa8b6]"
                />
              </div>
            </label>
          </div>

          {error && (
            <div className="mt-[16px] rounded-[8px] border border-red-200 bg-red-50 px-[12px] py-[10px] text-[14px] text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-[18px] flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[7px] bg-[#002d6b] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#012653] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
            <ArrowRight className="h-[17px] w-[17px]" />
          </button>

          <div className="mt-[24px] rounded-[8px] border border-[#d8e0ea] bg-[#f8fafc] p-[16px]">
            <div className="flex items-start gap-[10px]">
              <ShieldCheck className="mt-[2px] h-[18px] w-[18px] text-[#002d6b]" />
              <div>
                <p className="text-[13px] font-semibold text-[#152b45]">Controle interno de escala</p>
                <p className="mt-[5px] text-[13px] leading-[1.55] text-[#5f6f80]">
                  O acesso é reservado para acompanhamento das rotinas cadastradas no ProntoEscala.
                </p>
              </div>
            </div>
          </div>

          <a
            href={`/account/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="mt-[18px] block text-center text-[13px] font-medium text-[#66788c] hover:text-[#002d6b] hover:underline"
          >
            Criar acesso interno
          </a>
        </form>
      </section>
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
