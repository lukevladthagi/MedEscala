"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Camera, Check, Clock, LogIn, LogOut, MapPin, Search, ShieldCheck, User, UserPlus, X } from "lucide-react";

interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  cargo: string;
  setor: string;
  foto_url: string;
  tipo_funcionario: string;
}

type Step = "search" | "camera" | "confirm" | "success";
type RegistroTipo = "entrada" | "saida";

export default function TabletCheckin() {
  const [step, setStep] = useState<Step>("search");
  const [registroTipo, setRegistroTipo] = useState<RegistroTipo>("entrada");
  const [searchTerm, setSearchTerm] = useState("");
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const requestLocation = useCallback(() => {
    setLocationError(null);

    if (!navigator.geolocation) {
      const message = "Localizacao nao suportada neste dispositivo.";
      setLocationStatus("error");
      setLocationError(message);
      return Promise.reject(new Error(message));
    }

    setLocationStatus("loading");

    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          setLocationStatus("ready");
          setLocationError(null);
          resolve(coords);
        },
        (err) => {
          const message =
            err.code === err.PERMISSION_DENIED
              ? "Permita o acesso a localizacao no navegador para registrar o check-in."
              : "Nao foi possivel obter a localizacao. Verifique GPS/Wi-Fi e tente novamente.";
          console.log("Geolocation error:", err);
          setLocationStatus("error");
          setLocationError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
      );
    });
  }, []);

  useEffect(() => {
    requestLocation().catch(() => {
      // The confirmation screen shows the actionable error and retry button.
    });
  }, [requestLocation]);

  useEffect(() => {
    const handleFocus = () => {
      if (!location) requestLocation().catch(() => {});
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [location, requestLocation]);

  const searchFuncionarios = async (term: string) => {
    if (term.length < 2) {
      setFuncionarios([]);
      return;
    }

    try {
      const res = await fetch("/api/funcionarios?ativo=true");
      const data = await res.json();
      const filtered = (Array.isArray(data) ? data : []).filter((f: Funcionario) =>
        f.nome?.toLowerCase().includes(term.toLowerCase()) || f.cpf?.includes(term),
      );
      setFuncionarios(filtered);
    } catch (err) {
      console.error("Error searching:", err);
      setFuncionarios([]);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => searchFuncionarios(searchTerm), 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 960, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera. Verifique as permissões do tablet.");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
    setStep("confirm");
  }, [stopCamera]);

  const handleSelectFuncionario = (func: Funcionario) => {
    setSelectedFuncionario(func);
    setStep("camera");
    setTimeout(startCamera, 100);
  };

  const resetFlow = () => {
    stopCamera();
    setStep("search");
    setRegistroTipo("entrada");
    setSearchTerm("");
    setSelectedFuncionario(null);
    setCapturedPhoto(null);
    setFuncionarios([]);
    setError(null);
  };

  const submitCheckin = async () => {
    if (!selectedFuncionario || !capturedPhoto) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentLocation = location ?? (await requestLocation());
      const photoBlob = await (await fetch(capturedPhoto)).blob();
      const formData = new FormData();
      formData.append("file", photoBlob, `checkin_${selectedFuncionario.id}_${Date.now()}.jpg`);
      formData.append("funcionario_id", selectedFuncionario.id.toString());

      const uploadRes = await fetch("/api/checkin-photo", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Erro ao enviar foto");

      const { foto_url } = await uploadRes.json();
      const checkinRes = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medico_id: selectedFuncionario.id,
          data_hora: new Date().toISOString(),
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          metodo_checkin: "tablet_foto",
          foto_url,
          tipo_registro: registroTipo,
          status_biometria: "pendente",
          origem_dispositivo: "tablet_setor",
          is_valido: 1,
          is_no_prazo: 1,
          observacoes: `Registro de ${registroTipo} por tablet com selfie. Validação facial pendente.`,
        }),
      });

      if (!checkinRes.ok) throw new Error(`Erro ao registrar ${registroTipo}`);

      setStep("success");
      setTimeout(resetFlow, 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erro ao registrar ${registroTipo}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setStep("camera");
    setTimeout(startCamera, 100);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const actionLabel = registroTipo === "entrada" ? "Entrada" : "Saída";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#001f4d] via-[#002d6b] to-[#5f676c]">
      <header className="border-b border-white/20 bg-white/10 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-48 items-center justify-center rounded-md bg-white px-3">
              <img src="/prontoescala-logo.png" alt="ProntoEscala" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ProntoEscala Totem</h1>
              <p className="text-sm text-blue-100">Entrada, saida e validacao por selfie</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 font-mono text-4xl font-bold text-white">
              <Clock className="h-8 w-8 text-blue-300" />
              {formatTime(currentTime)}
            </div>
            <p className="capitalize text-blue-200">{formatDate(currentTime)}</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur">
          {step === "search" && (
            <div className="p-8">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-10 w-10 text-blue-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Registrar Presença</h2>
                <p className="mt-2 text-gray-500">Escolha o tipo de registro e identifique o profissional.</p>
                <p className="mt-1 text-sm text-gray-400">
                  O botão Entrada/Saída define o tipo. Para continuar, selecione um funcionário encontrado na busca.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegistroTipo("entrada")}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    registroTipo === "entrada" ? "border-green-500 bg-green-50 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <LogIn className={`mb-3 h-7 w-7 ${registroTipo === "entrada" ? "text-green-600" : "text-gray-500"}`} />
                  <p className="text-lg font-bold text-gray-900">Entrada</p>
                  <p className="text-sm text-gray-500">Início do plantão</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRegistroTipo("saida")}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    registroTipo === "saida" ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <LogOut className={`mb-3 h-7 w-7 ${registroTipo === "saida" ? "text-blue-600" : "text-gray-500"}`} />
                  <p className="text-lg font-bold text-gray-900">Saída</p>
                  <p className="text-sm text-gray-500">Fim do plantão</p>
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border-2 border-gray-200 py-6 pl-12 text-lg focus:border-blue-500"
                  autoFocus
                />
              </div>

              {funcionarios.length > 0 && (
                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {funcionarios.map((func) => (
                    <button
                      key={func.id}
                      type="button"
                      onClick={() => handleSelectFuncionario(func)}
                      className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-gray-50 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        {func.foto_url ? (
                          <img src={func.foto_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                        ) : (
                          <User className="h-7 w-7 text-blue-700" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-lg font-semibold text-gray-900">{func.nome}</p>
                        <p className="text-sm text-gray-500">{func.cargo || func.tipo_funcionario} - {func.setor || "Sem setor"}</p>
                      </div>
                      <Camera className="h-6 w-6 text-blue-500" />
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.length >= 2 && funcionarios.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
                  <UserPlus className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                  <p className="font-semibold text-gray-800">Nenhum funcionário ativo encontrado</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Cadastre o profissional em Funcionários e deixe o cadastro ativo para liberar o check-in no totem.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      window.location.href = "/funcionarios";
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Abrir cadastro de funcionários
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "camera" && selectedFuncionario && (
            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">Olá, {selectedFuncionario.nome.split(" ")[0]}!</h2>
                <p className="text-gray-500">Posicione seu rosto na câmera para registrar a {registroTipo}.</p>
              </div>

              <div className="relative mb-6 overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 m-8 rounded-2xl border-4 border-dashed border-white/30" />
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-center text-red-600">{error}</div>}

              <div className="flex gap-4">
                <Button variant="outline" onClick={resetFlow} className="flex-1 rounded-xl py-6 text-lg">
                  <X className="mr-2 h-5 w-5" />
                  Cancelar
                </Button>
                <Button onClick={capturePhoto} className="flex-1 rounded-xl bg-blue-700 py-6 text-lg hover:bg-blue-800">
                  <Camera className="mr-2 h-5 w-5" />
                  Fotografar
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && selectedFuncionario && capturedPhoto && (
            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">Confirmar {actionLabel}</h2>
                <p className="text-gray-500">Verifique a foto antes de concluir.</p>
              </div>

              <div className="mb-6 overflow-hidden rounded-2xl">
                <img src={capturedPhoto} alt="Foto capturada" className="aspect-[4/3] w-full object-cover" />
              </div>

              <div className="mb-6 rounded-xl bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{selectedFuncionario.nome}</span>
                </div>
                <div className="mb-2 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">{formatTime(currentTime)}</span>
                </div>
                <div className="mb-2 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Selfie registrada para validação facial</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className={location ? "text-green-700" : "text-amber-700"}>
                    {location
                      ? `Localizacao registrada (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})`
                      : locationStatus === "loading"
                        ? "Obtendo localizacao..."
                        : "Localizacao pendente"}
                  </span>
                </div>
              </div>

              {locationError && (
                <div className="mb-4 rounded-xl bg-amber-50 p-4 text-center text-amber-700">
                  <p>{locationError}</p>
                  <Button type="button" variant="outline" className="mt-3" onClick={() => requestLocation().catch(() => {})}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Tentar localizar novamente
                  </Button>
                </div>
              )}

              {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-center text-red-600">{error}</div>}

              <div className="flex gap-4">
                <Button variant="outline" onClick={handleRetake} disabled={isLoading} className="flex-1 rounded-xl py-6 text-lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Refazer
                </Button>
                <Button onClick={submitCheckin} disabled={isLoading} className="flex-1 rounded-xl bg-green-600 py-6 text-lg hover:bg-green-700">
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Confirmar {actionLabel}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "success" && selectedFuncionario && (
            <div className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-green-100">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {registroTipo === "entrada" ? "Entrada Registrada!" : "Saída Registrada!"}
              </h2>
              <p className="mb-4 text-lg text-gray-500">{selectedFuncionario.nome.split(" ")[0]}, seu registro foi confirmado.</p>
              <div className="font-mono text-4xl font-bold text-green-600">{formatTime(currentTime)}</div>
            </div>
          )}
        </Card>
      </main>

      <footer className="border-t border-white/10 bg-white/5 px-6 py-3">
        <p className="text-center text-sm text-blue-100">ProntoEscala - Gestao de escalas e plantoes</p>
      </footer>
    </div>
  );
}
