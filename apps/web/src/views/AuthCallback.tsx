"use client";

import { useEffect } from "react";
import { useNavigate } from "@/lib/router-shim";
import { useAuth } from "@/lib/auth-shim";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate("/");
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        navigate("/account/signin");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4f7fb] via-white to-[#e8edf3]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-64 items-center justify-center rounded-md bg-white px-4 shadow-sm">
          <img src="/prontoescala-logo.png" alt="ProntoEscala" className="h-full w-full object-contain" />
        </div>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#002d6b]" />
        <p className="mt-4 text-[#5f676c]">Completando login...</p>
      </div>
    </div>
  );
}
