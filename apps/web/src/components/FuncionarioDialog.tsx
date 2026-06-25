"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, RefreshCw, Plus, Upload, X } from "lucide-react";

interface Funcionario {
  id: number;
  nome: string;
  cpf: string | null;
  crm: string | null;
  cargo: string | null;
  tipo_funcionario: string;
  especialidade: string | null;
  telefone: string | null;
  email: string | null;
  telegram_id: string | null;
  is_ativo: number;
  unidade_hospitalar: string | null;
  setor: string | null;
  tipo_vinculo: string | null;
  data_admissao: string | null;
  data_nascimento: string | null;
  foto_url: string | null;
  coordenador_responsavel: string | null;
  jornada_id: number | null;
  jornada_codigo?: string | null;
  jornada_nome?: string | null;
  jornada_flexivel?: number | null;
  jornada_tipo_escala?: string | null;
}

interface JornadaTrabalho {
  id: number;
  codigo: string;
  nome: string;
  flexivel: number;
  tipo_escala: string;
}

interface FuncionarioDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  funcionario: Funcionario | null;
}

export default function FuncionarioDialog({ open, onClose, funcionario }: FuncionarioDialogProps) {
  const defaultTipoFuncionarioOptions = [
    { value: "medico", label: "Médico" },
    { value: "enfermagem", label: "Enfermagem" },
    { value: "tecnico", label: "Técnico" },
    { value: "administrativo", label: "Administrativo" },
    { value: "apoio", label: "Apoio" },
  ];
  const defaultTipoVinculoOptions = ["CLT", "PJ", "Plantonista", "Autônomo", "Temporário"];
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    crm: "",
    cargo: "",
    tipo_funcionario: "medico",
    especialidade: "",
    telefone: "",
    email: "",
    telegram_id: "",
    is_ativo: true,
    unidade_hospitalar: "",
    setor: "",
    tipo_vinculo: "",
    data_admissao: "",
    data_nascimento: "",
    foto_url: "",
    coordenador_responsavel: "",
    jornada_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [cargosList, setCargosList] = useState<any[]>([]);
  const [jornadasList, setJornadasList] = useState<JornadaTrabalho[]>([]);
  const [jornadaSearch, setJornadaSearch] = useState("");
  const [especialidadesList, setEspecialidadesList] = useState<string[]>([]);
  const [setoresList, setSetoresList] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [customOptions, setCustomOptions] = useState({
    tiposFuncionario: [] as { value: string; label: string }[],
    especialidades: [] as string[],
    setores: [] as string[],
    tiposVinculo: [] as string[],
  });

  useEffect(() => {
    if (open) {
      fetchCargos();
      fetchJornadas();
      fetchEspecialidades();
      fetchSetores();
      fetchCustomOptions();
    }
    
    if (funcionario) {
      setFormData({
        nome: funcionario.nome,
        cpf: funcionario.cpf || "",
        crm: funcionario.crm || "",
        cargo: funcionario.cargo || "",
        tipo_funcionario: funcionario.tipo_funcionario || "medico",
        especialidade: funcionario.especialidade || "",
        telefone: funcionario.telefone || "",
        email: funcionario.email || "",
        telegram_id: funcionario.telegram_id || "",
        is_ativo: funcionario.is_ativo === 1,
        unidade_hospitalar: funcionario.unidade_hospitalar || "",
        setor: funcionario.setor || "",
        tipo_vinculo: funcionario.tipo_vinculo || "",
        data_admissao: funcionario.data_admissao || "",
        data_nascimento: funcionario.data_nascimento || "",
        foto_url: funcionario.foto_url || "",
        coordenador_responsavel: funcionario.coordenador_responsavel || "",
        jornada_id: funcionario.jornada_id?.toString() || "",
      });
    } else {
      setFormData({
        nome: "",
        cpf: "",
        crm: "",
        cargo: "",
        tipo_funcionario: "medico",
        especialidade: "",
        telefone: "",
        email: "",
        telegram_id: "",
        is_ativo: true,
        unidade_hospitalar: "",
        setor: "",
        tipo_vinculo: "",
        data_admissao: "",
        data_nascimento: "",
        foto_url: "",
        coordenador_responsavel: "",
        jornada_id: "",
      });
    }
  }, [funcionario, open]);

  useEffect(() => {
    if (!open) {
      stopCamera();
    }
  }, [open]);

  const startCamera = useCallback(async () => {
    setPhotoError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 960, height: 720 },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (error) {
      console.error("Error opening camera:", error);
      setPhotoError("Não foi possível acessar a câmera. Verifique a permissão do navegador.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  const captureFuncionarioPhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    setPhotoUploading(true);
    setPhotoError(null);

    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const photoBlob = await (await fetch(dataUrl)).blob();
      const uploadForm = new FormData();
      uploadForm.append("file", photoBlob, `funcionario_${Date.now()}.jpg`);

      const uploadRes = await fetch("/api/funcionario-photo", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) throw new Error("Falha no upload da foto");

      const { foto_url } = await uploadRes.json();
      setFormData((current) => ({ ...current, foto_url }));
      stopCamera();
    } catch (error) {
      console.error("Error uploading employee photo:", error);
      setPhotoError("Não foi possível salvar a foto. Tente novamente.");
    } finally {
      setPhotoUploading(false);
    }
  }, [stopCamera]);

  const fetchCargos = async () => {
    try {
      const response = await fetch("/api/cargos-funcoes?ativo=true");
      const data = await response.json();
      setCargosList(data);
    } catch (error) {
      console.error("Error fetching cargos:", error);
    }
  };

  const fetchJornadas = async () => {
    try {
      const response = await fetch("/api/jornadas-trabalho?ativo=true");
      const data = await response.json();
      setJornadasList(data);
    } catch (error) {
      console.error("Error fetching jornadas:", error);
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const response = await fetch("/api/especialidades");
      const data = await response.json();
      setEspecialidadesList(data.map((item: any) => item.especialidade).filter(Boolean));
    } catch (error) {
      console.error("Error fetching especialidades:", error);
    }
  };

  const fetchSetores = async () => {
    try {
      const response = await fetch("/api/setores");
      const data = await response.json();
      setSetoresList(data.map((item: any) => item.setor).filter(Boolean));
    } catch (error) {
      console.error("Error fetching setores:", error);
    }
  };

  const fetchCustomOptions = async () => {
    try {
      const response = await fetch("/api/opcoes-cadastro");
      const data = await response.json();
      setCustomOptions({
        tiposFuncionario: data
          .filter((item: any) => item.tipo === "tipo_funcionario")
          .map((item: any) => ({ value: item.valor, label: item.rotulo })),
        especialidades: data
          .filter((item: any) => item.tipo === "especialidade")
          .map((item: any) => item.rotulo),
        setores: data
          .filter((item: any) => item.tipo === "setor")
          .map((item: any) => item.rotulo),
        tiposVinculo: data
          .filter((item: any) => item.tipo === "tipo_vinculo")
          .map((item: any) => item.rotulo),
      });
    } catch (error) {
      console.error("Error fetching custom options:", error);
    }
  };

  const saveOption = async (tipo: string, valor: string, rotulo = valor) => {
    const response = await fetch("/api/opcoes-cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, valor, rotulo }),
    });
    if (!response.ok) throw new Error("Erro ao salvar opção");
  };

  const normalizeOptionValue = (value: string) =>
    value
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const addTipoFuncionario = async () => {
    const label = window.prompt("Digite o novo tipo de funcionário:");
    if (!label?.trim()) return;
    const value = normalizeOptionValue(label);
    if (!value) return;
    try {
      await saveOption("tipo_funcionario", value, label.trim());
      await fetchCustomOptions();
      setFormData({ ...formData, tipo_funcionario: value });
    } catch (error) {
      console.error("Error creating tipo_funcionario:", error);
      window.alert("Não foi possível criar o tipo de funcionário.");
    }
  };

  const addCargo = async () => {
    const nome = window.prompt("Digite o novo cargo/função:");
    if (!nome?.trim()) return;
    try {
      const response = await fetch("/api/cargos-funcoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), is_ativo: 1 }),
      });
      if (!response.ok) throw new Error("Erro ao criar cargo");
      await fetchCargos();
      setFormData({ ...formData, cargo: nome.trim() });
    } catch (error) {
      console.error("Error creating cargo:", error);
      window.alert("Não foi possível criar o cargo/função.");
    }
  };

  const addTextOption = async (
    key: "especialidades" | "setores" | "tiposVinculo",
    field: "especialidade" | "setor" | "tipo_vinculo",
    message: string,
  ) => {
    const value = window.prompt(message);
    if (!value?.trim()) return;
    const trimmed = value.trim();
    const typeMap = {
      especialidades: "especialidade",
      setores: "setor",
      tiposVinculo: "tipo_vinculo",
    };
    try {
      await saveOption(typeMap[key], trimmed, trimmed);
      await fetchCustomOptions();
      setFormData({ ...formData, [field]: trimmed });
    } catch (error) {
      console.error("Error creating option:", error);
      window.alert("Não foi possível criar a opção.");
    }
  };

  const tipoFuncionarioOptions = [...defaultTipoFuncionarioOptions, ...customOptions.tiposFuncionario];
  const especialidadeOptions = Array.from(new Set([...especialidadesList, ...customOptions.especialidades])).sort();
  const setorOptions = Array.from(new Set([...setoresList, ...customOptions.setores])).sort();
  const tipoVinculoOptions = Array.from(new Set([...defaultTipoVinculoOptions, ...customOptions.tiposVinculo]));
  const filteredJornadas = jornadasList.filter((jornada) => {
    const query = jornadaSearch.trim().toLowerCase();
    if (!query) return true;
    return [jornada.codigo, jornada.nome, jornada.tipo_escala]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const addJornada = async () => {
    const codigo = window.prompt("Digite o código da nova jornada:");
    if (!codigo?.trim()) return;

    const nome = window.prompt("Digite o nome/horário da jornada:");
    if (!nome?.trim()) return;

    const flexivelResposta = window.prompt("A jornada é flexível? Digite Sim ou Não:", "Não");
    const tipoEscala = window.prompt(
      "Digite o tipo da escala:",
      "4 - Jornada com horário diário fixo e folga fixa (no domingo)",
    );
    if (!tipoEscala?.trim()) return;

    try {
      const response = await fetch("/api/jornadas-trabalho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: codigo.trim(),
          nome: nome.trim(),
          flexivel: (flexivelResposta || "").trim().toLowerCase().startsWith("s"),
          tipo_escala: tipoEscala.trim(),
          is_ativo: 1,
        }),
      });
      if (!response.ok) throw new Error("Erro ao criar jornada");

      const jornada = await response.json();
      await fetchJornadas();
      setFormData({ ...formData, jornada_id: jornada.id.toString() });
      setJornadaSearch("");
    } catch (error) {
      console.error("Error creating jornada:", error);
      window.alert("Não foi possível criar a jornada.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveError(null);

    try {
      const payload = {
        ...formData,
        is_ativo: formData.is_ativo ? 1 : 0,
        jornada_id: formData.jornada_id ? parseInt(formData.jornada_id, 10) : null,
      };

      if (funcionario) {
        const response = await fetch(`/api/funcionarios/${funcionario.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Erro ao atualizar funcionário");
      } else {
        const response = await fetch("/api/funcionarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Erro ao criar funcionário");
      }

      onClose(true);
    } catch (error) {
      console.error("Error saving funcionario:", error);
      setSaveError("Não foi possível salvar o funcionário. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {funcionario ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="pessoal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="profissional">Dados Profissionais</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
            </TabsList>

            <TabsContent value="pessoal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 md:col-span-2 rounded-2xl border bg-muted/20 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-white">
                      {formData.foto_url ? (
                        <img src={formData.foto_url} alt="Foto do funcionário" className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label>Foto do Funcionário</Label>
                        <p className="text-sm text-muted-foreground">
                          Use esta foto como referência visual do cadastro e base futura para validação facial.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={startCamera}>
                          <Camera className="mr-2 h-4 w-4" />
                          Tirar foto
                        </Button>
                        {formData.foto_url && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData({ ...formData, foto_url: "" })}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        )}
                      </div>
                      {photoError && <p className="text-sm text-red-600">{photoError}</p>}
                    </div>
                  </div>

                  {cameraOpen && (
                    <div className="space-y-3 rounded-2xl border bg-white p-3">
                      <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full rounded-xl bg-black object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="outline" onClick={stopCamera} disabled={photoUploading}>
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                        <Button type="button" variant="outline" onClick={startCamera} disabled={photoUploading}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reiniciar câmera
                        </Button>
                        <Button type="button" onClick={captureFuncionarioPhoto} disabled={photoUploading}>
                          <Upload className="mr-2 h-4 w-4" />
                          {photoUploading ? "Salvando..." : "Usar esta foto"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foto_url">URL da Foto</Label>
                  <Input
                    id="foto_url"
                    value={formData.foto_url}
                    onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2 flex items-center justify-between">
                  <Label htmlFor="is_ativo">Funcionário Ativo</Label>
                  <Switch
                    id="is_ativo"
                    checked={formData.is_ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_ativo: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profissional" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="tipo_funcionario">Tipo de Funcionário *</Label>
                    <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={addTipoFuncionario}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select
                    value={formData.tipo_funcionario}
                    onValueChange={(value) => setFormData({ ...formData, tipo_funcionario: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoFuncionarioOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="cargo">Cargo/Função</Label>
                    <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={addCargo}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select
                    value={formData.cargo || "_none"}
                    onValueChange={(value) => setFormData({ ...formData, cargo: value === "_none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhum</SelectItem>
                      {cargosList.map((cargo) => (
                        <SelectItem key={cargo.id} value={cargo.nome}>
                          {cargo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Configure cargos em Cargos e Funções
                  </p>
                </div>

                {formData.tipo_funcionario === "medico" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="crm">CRM</Label>
                      <Input
                        id="crm"
                        value={formData.crm}
                        onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                        placeholder="CRM/UF 12345"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="especialidade">Especialidade</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => addTextOption("especialidades", "especialidade", "Digite a nova especialidade:")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Select
                        value={formData.especialidade || "_none"}
                        onValueChange={(value) => setFormData({ ...formData, especialidade: value === "_none" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma especialidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Nenhuma</SelectItem>
                          {especialidadeOptions.map((especialidade) => (
                            <SelectItem key={especialidade} value={especialidade}>
                              {especialidade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="setor">Setor</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => addTextOption("setores", "setor", "Digite o novo setor:")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select
                    value={formData.setor || "_none"}
                    onValueChange={(value) => setFormData({ ...formData, setor: value === "_none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhum</SelectItem>
                      {setorOptions.map((setor) => (
                        <SelectItem key={setor} value={setor}>
                          {setor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade_hospitalar">Unidade Hospitalar</Label>
                  <Input
                    id="unidade_hospitalar"
                    value={formData.unidade_hospitalar}
                    onChange={(e) => setFormData({ ...formData, unidade_hospitalar: e.target.value })}
                    placeholder="Ex: Hospital Central"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="tipo_vinculo">Tipo de Vínculo</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => addTextOption("tiposVinculo", "tipo_vinculo", "Digite o novo tipo de vínculo:")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select
                    value={formData.tipo_vinculo || "_none"}
                    onValueChange={(value) => setFormData({ ...formData, tipo_vinculo: value === "_none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhum</SelectItem>
                      {tipoVinculoOptions.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="jornada_id">Jornada de Trabalho</Label>
                    <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={addJornada}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={jornadaSearch}
                    onChange={(event) => setJornadaSearch(event.target.value)}
                    placeholder="Pesquisar por código, horário ou tipo de escala"
                  />
                  <Select
                    value={formData.jornada_id || "_none"}
                    onValueChange={(value) => setFormData({ ...formData, jornada_id: value === "_none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a jornada do funcionário" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="_none">Nenhuma jornada definida</SelectItem>
                      {filteredJornadas.map((jornada) => (
                        <SelectItem key={jornada.id} value={jornada.id.toString()}>
                          {jornada.codigo} - {jornada.nome} {jornada.flexivel === 1 ? "(flexível)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.jornada_id && (
                    <p className="text-xs text-muted-foreground">
                      {jornadasList.find((jornada) => jornada.id.toString() === formData.jornada_id)?.tipo_escala}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_admissao">Data de Admissão</Label>
                  <Input
                    id="data_admissao"
                    type="date"
                    value={formData.data_admissao}
                    onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="coordenador_responsavel">Coordenador Responsável</Label>
                  <Input
                    id="coordenador_responsavel"
                    value={formData.coordenador_responsavel}
                    onChange={(e) => setFormData({ ...formData, coordenador_responsavel: e.target.value })}
                    placeholder="Nome do coordenador"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="funcionario@hospital.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="telegram_id">Telegram ID</Label>
                  <Input
                    id="telegram_id"
                    value={formData.telegram_id}
                    onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                    placeholder="@usuario ou ID numérico"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            {saveError && (
              <p className="mr-auto max-w-sm text-sm text-red-600">
                {saveError}
              </p>
            )}
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : funcionario ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


