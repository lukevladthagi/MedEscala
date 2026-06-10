"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidade: string | null;
  telefone: string | null;
  telegram_id: string | null;
  is_ativo: number;
  unidade_hospitalar: string | null;
  setor: string | null;
  tipo_vinculo: string | null;
  foto_url: string | null;
  coordenador_responsavel: string | null;
  email: string | null;
}

interface MedicoDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  medico: Medico | null;
}

const especialidades = [
  "Clínico Geral",
  "Cirurgião Geral",
  "Cirurgião Cardíaco",
  "Anestesista",
  "Pediatra",
  "Cardiologista",
  "Ortopedista",
  "Neurologista",
  "Oncologista",
  "Intensivista"
];

const setores = [
  "UTI",
  "Emergência",
  "Cirurgia",
  "Pediatria",
  "Cardiologia",
  "Ortopedia",
  "Neurologia",
  "Oncologia"
];

const tiposVinculo = ["CLT", "PJ", "Cooperado", "Plantonista"];

export default function MedicoDialog({ open, onClose, medico }: MedicoDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    crm: "",
    especialidade: "",
    telefone: "",
    telegram_id: "",
    is_ativo: true,
    unidade_hospitalar: "Unidade Central",
    setor: "",
    tipo_vinculo: "",
    email: "",
    coordenador_responsavel: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medico) {
      setFormData({
        nome: medico.nome,
        crm: medico.crm,
        especialidade: medico.especialidade || "",
        telefone: medico.telefone || "",
        telegram_id: medico.telegram_id || "",
        is_ativo: medico.is_ativo === 1,
        unidade_hospitalar: medico.unidade_hospitalar || "Unidade Central",
        setor: medico.setor || "",
        tipo_vinculo: medico.tipo_vinculo || "",
        email: medico.email || "",
        coordenador_responsavel: medico.coordenador_responsavel || ""
      });
    } else {
      setFormData({
        nome: "",
        crm: "",
        especialidade: "",
        telefone: "",
        telegram_id: "",
        is_ativo: true,
        unidade_hospitalar: "Unidade Central",
        setor: "",
        tipo_vinculo: "",
        email: "",
        coordenador_responsavel: ""
      });
    }
  }, [medico, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        is_ativo: formData.is_ativo ? 1 : 0
      };

      if (medico) {
        await fetch(`/api/medicos/${medico.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/medicos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      onClose(true);
    } catch (error) {
      console.error("Error saving medico:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medico ? "Editar Médico" : "Novo Médico"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm">CRM *</Label>
              <Input
                id="crm"
                value={formData.crm}
                onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                placeholder="12345-UF"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Select
                value={formData.especialidade}
                onValueChange={(value) => setFormData({ ...formData, especialidade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Select
                value={formData.setor}
                onValueChange={(value) => setFormData({ ...formData, setor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((setor) => (
                    <SelectItem key={setor} value={setor}>
                      {setor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="medico@hospital.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 98765-4321"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram_id">Telegram ID</Label>
              <Input
                id="telegram_id"
                value={formData.telegram_id}
                onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                placeholder="@usuario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_vinculo">Tipo de Vínculo</Label>
              <Select
                value={formData.tipo_vinculo}
                onValueChange={(value) => setFormData({ ...formData, tipo_vinculo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {tiposVinculo.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade Hospitalar</Label>
              <Input
                id="unidade"
                value={formData.unidade_hospitalar}
                onChange={(e) => setFormData({ ...formData, unidade_hospitalar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordenador">Coordenador Responsável</Label>
              <Input
                id="coordenador"
                value={formData.coordenador_responsavel}
                onChange={(e) =>
                  setFormData({ ...formData, coordenador_responsavel: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 flex items-center justify-between md:col-span-2">
              <Label htmlFor="is_ativo">Status Ativo</Label>
              <Switch
                id="is_ativo"
                checked={formData.is_ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, is_ativo: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : medico ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
