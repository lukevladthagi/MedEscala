"use client";

import { useEffect } from "react";
import { useNavigate } from "@/lib/router-shim";
import { useAuth } from "@/lib/auth-shim";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isPending) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4f7fb] via-white to-[#e8edf3]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#002d6b]" />
          <p className="mt-4 text-[#5f676c]">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4f7fb] via-white to-[#e8edf3]">
      <Card className="mx-4 w-full max-w-lg border-[#d7dde3] shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-24 w-full max-w-sm items-center justify-center rounded-md bg-white px-4">
            <img src="/prontoescala-logo.png" alt="ProntoEscala" className="h-full w-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#002d6b]">ProntoEscala</CardTitle>
            <CardDescription className="mt-2 text-base">Gestao de escalas e plantoes</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-6 text-center text-sm text-[#5f676c]">
            Faca login com seu e-mail institucional para acessar o sistema
          </div>
          <Button onClick={redirectToLogin} className="h-12 w-full bg-[#002d6b] text-base hover:bg-[#001f4d]" size="lg">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar no sistema
          </Button>
          <div className="mt-6 text-center text-xs text-[#6f777c]">Acesso restrito a colaboradores autorizados</div>
        </CardContent>
      </Card>
    </div>
  );
}
