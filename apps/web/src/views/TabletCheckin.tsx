"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Camera, Check, X, Search, Clock, MapPin, User } from "lucide-react";

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

export default function TabletCheckin() {
  const [step, setStep] = useState<Step>("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get current time
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geolocation error:", err)
      );
    }
  }, []);

  // Search funcionarios
  const searchFuncionarios = async (term: string) => {
    if (term.length < 2) {
      setFuncionarios([]);
      return;
    }

    try {
      const res = await fetch(`/api/funcionarios?ativo=true`);
      const data = await res.json();
      const filtered = data.filter((f: Funcionario) => 
        f.nome?.toLowerCase().includes(term.toLowerCase()) ||
        f.cpf?.includes(term)
      );
      setFuncionarios(filtered);
    } catch (err) {
      console.error("Error searching:", err);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => searchFuncionarios(searchTerm), 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
      console.error("Camera error:", err);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedPhoto(dataUrl);
        stopCamera();
        setStep("confirm");
      }
    }
  }, [stopCamera]);

  // Handle select funcionario
  const handleSelectFuncionario = (func: Funcionario) => {
    setSelectedFuncionario(func);
    setStep("camera");
    setTimeout(startCamera, 100);
  };

  // Submit check-in
  const submitCheckin = async () => {
    if (!selectedFuncionario || !capturedPhoto) return;

    setIsLoading(true);
    setError(null);

    try {
      // Upload photo
      const photoBlob = await (await fetch(capturedPhoto)).blob();
      const formData = new FormData();
      formData.append("file", photoBlob, `checkin_${selectedFuncionario.id}_${Date.now()}.jpg`);
      formData.append("funcionario_id", selectedFuncionario.id.toString());

      const uploadRes = await fetch("/api/checkin-photo", {
        method: "POST",
        body: formData
      });

      if (!uploadRes.ok) throw new Error("Erro ao enviar foto");

      const { foto_url } = await uploadRes.json();

      // Create check-in
      const checkinRes = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medico_id: selectedFuncionario.id,
          data_hora: new Date().toISOString(),
          latitude: location?.lat,
          longitude: location?.lng,
          metodo_checkin: "tablet_foto",
          foto_url,
          is_valido: 1,
          is_no_prazo: 1
        })
      });

      if (!checkinRes.ok) throw new Error("Erro ao registrar check-in");

      setStep("success");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStep("search");
        setSearchTerm("");
        setSelectedFuncionario(null);
        setCapturedPhoto(null);
        setFuncionarios([]);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar check-in");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel and go back
  const handleCancel = () => {
    stopCamera();
    setCapturedPhoto(null);
    setSelectedFuncionario(null);
    setStep("search");
    setError(null);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    setStep("camera");
    setTimeout(startCamera, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">EP</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">EscalaPronto</h1>
              <p className="text-blue-200 text-sm">Sistema de Check-in</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-4xl font-mono font-bold flex items-center gap-2">
              <Clock className="w-8 h-8 text-blue-300" />
              {formatTime(currentTime)}
            </div>
            <p className="text-blue-200 capitalize">{formatDate(currentTime)}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur shadow-2xl rounded-3xl overflow-hidden">
          {/* Search step */}
          {step === "search" && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Registrar Presença</h2>
                <p className="text-gray-500 mt-2">Digite seu nome ou CPF para identificação</p>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500"
                  autoFocus
                />
              </div>

              {funcionarios.length > 0 && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {funcionarios.map((func) => (
                    <button
                      key={func.id}
                      onClick={() => handleSelectFuncionario(func)}
                      className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all"
                    >
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {func.foto_url ? (
                          <img src={func.foto_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-blue-600" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{func.nome}</p>
                        <p className="text-gray-500 text-sm">
                          {func.cargo || func.tipo_funcionario} • {func.setor || "Sem setor"}
                        </p>
                      </div>
                      <div className="text-blue-500">
                        <Camera className="w-6 h-6" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.length >= 2 && funcionarios.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum funcionário encontrado</p>
                </div>
              )}
            </div>
          )}

          {/* Camera step */}
          {step === "camera" && selectedFuncionario && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Olá, {selectedFuncionario.nome.split(" ")[0]}!
                </h2>
                <p className="text-gray-500">Posicione seu rosto na câmera e clique para fotografar</p>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 border-4 border-dashed border-white/30 rounded-2xl m-8 pointer-events-none" />
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 py-6 text-lg rounded-xl"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 py-6 text-lg rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Fotografar
                </Button>
              </div>
            </div>
          )}

          {/* Confirm step */}
          {step === "confirm" && selectedFuncionario && capturedPhoto && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Confirmar Check-in</h2>
                <p className="text-gray-500">Verifique se a foto ficou boa</p>
              </div>

              <div className="rounded-2xl overflow-hidden mb-6">
                <img src={capturedPhoto} alt="Foto capturada" className="w-full aspect-[4/3] object-cover" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-800">{selectedFuncionario.nome}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{formatTime(currentTime)}</span>
                </div>
                {location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Localização registrada</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  disabled={isLoading}
                  className="flex-1 py-6 text-lg rounded-xl"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Refazer
                </Button>
                <Button
                  onClick={submitCheckin}
                  disabled={isLoading}
                  className="flex-1 py-6 text-lg rounded-xl bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Confirmar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success step */}
          {step === "success" && selectedFuncionario && (
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Check-in Registrado!</h2>
              <p className="text-gray-500 text-lg mb-4">
                {selectedFuncionario.nome.split(" ")[0]}, sua presença foi confirmada.
              </p>
              <div className="text-4xl font-mono font-bold text-green-600">
                {formatTime(currentTime)}
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 border-t border-white/10 px-6 py-3">
        <p className="text-center text-blue-200 text-sm">
          Sistema de Gestão Hospitalar • EscalaPronto
        </p>
      </footer>
    </div>
  );
}
