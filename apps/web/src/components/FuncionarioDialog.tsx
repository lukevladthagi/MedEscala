"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

interface FuncionarioDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  funcionario: Funcionario | null;
}

export default function FuncionarioDialog({ open, onClose, funcionario }: FuncionarioDialogProps) {
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
    coordenador_responsavel: ""
  });
  const [loading, setLoading] = useState(false);
  const [cargosList, setCargosList] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchCargos();
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
        coordenador_responsavel: funcionario.coordenador_responsavel || ""
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
        coordenador_responsavel: ""
      });
    }
  }, [funcionario, open]);

  const fetchCargos = async () => {
    try {
      const response = await fetch("/api/cargos-funcoes?ativo=true");
      const data = await response.json();
      setCargosList(data);
    } catch (error) {
      console.error("Error fetching cargos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        is_ativo: formData.is_ativo ? 1 : 0
      };

      if (funcionario) {
        await fetch(`/api/funcionarios/${funcionario.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/funcionarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      onClose(true);
    } catch (error) {
      console.error("Error saving funcionario:", error);
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
                  <Label htmlFor="tipo_funcionario">Tipo de Funcionário *</Label>
                  <Select
                    value={formData.tipo_funcionario}
                    onValueChange={(value) => setFormData({ ...formData, tipo_funcionario: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="enfermagem">Enfermagem</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="apoio">Apoio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo/Função</Label>
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
                      <Label htmlFor="especialidade">Especialidade</Label>
                      <Input
                        id="especialidade"
                        value={formData.especialidade}
                        onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                        placeholder="Ex: Cardiologia"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="setor">Setor</Label>
                  <Input
                    id="setor"
                    value={formData.setor}
                    onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    placeholder="Ex: Emergência, UTI"
                  />
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
                  <Label htmlFor="tipo_vinculo">Tipo de Vínculo</Label>
                  <Select
                    value={formData.tipo_vinculo || "_none"}
                    onValueChange={(value) => setFormData({ ...formData, tipo_vinculo: value === "_none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhum</SelectItem>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="Plantonista">Plantonista</SelectItem>
                      <SelectItem value="Autônomo">Autônomo</SelectItem>
                      <SelectItem value="Temporário">Temporário</SelectItem>
                    </SelectContent>
                  </Select>
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
