"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Escala {
  id: number;
  medico_id: number;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  setor: string | null;
  especialidade: string | null;
  tipo_plantao: string | null;
  carga_horaria: number | null;
  observacoes: string | null;
  status: string;
}

interface EscalaDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  escala: Escala | null;
}

interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
}

const setores = ["UTI", "Emergência", "Cirurgia", "Pediatria", "Cardiologia", "Ortopedia", "Neurologia", "Oncologia"];
const tiposPlantao = ["Diurno", "Noturno", "24h", "12h"];

export default function EscalaDialog({ open, onClose, escala }: EscalaDialogProps) {
  const [formData, setFormData] = useState({
    medico_id: "",
    tipo: "Plantão",
    data_inicio: "",
    data_fim: "",
    setor: "",
    especialidade: "",
    tipo_plantao: "",
    carga_horaria: "",
    observacoes: "",
    status: "ativa"
  });

  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMedicos();
    }
  }, [open]);

  useEffect(() => {
    if (escala) {
      setFormData({
        medico_id: escala.medico_id.toString(),
        tipo: escala.tipo,
        data_inicio: escala.data_inicio.slice(0, 16),
        data_fim: escala.data_fim.slice(0, 16),
        setor: escala.setor || "",
        especialidade: escala.especialidade || "",
        tipo_plantao: escala.tipo_plantao || "",
        carga_horaria: escala.carga_horaria?.toString() || "",
        observacoes: escala.observacoes || "",
        status: escala.status
      });
    } else {
      setFormData({
        medico_id: "",
        tipo: "Plantão",
        data_inicio: "",
        data_fim: "",
        setor: "",
        especialidade: "",
        tipo_plantao: "",
        carga_horaria: "",
        observacoes: "",
        status: "ativa"
      });
    }
  }, [escala, open]);

  const fetchMedicos = async () => {
    try {
      const response = await fetch("/api/medicos?ativo=true");
      const data = await response.json();
      setMedicos(data);
    } catch (error) {
      console.error("Error fetching medicos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        medico_id: parseInt(formData.medico_id),
        carga_horaria: formData.carga_horaria ? parseFloat(formData.carga_horaria) : null
      };

      if (escala) {
        await fetch(`/api/escalas/${escala.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/escalas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      onClose(true);
    } catch (error) {
      console.error("Error saving escala:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{escala ? "Editar Escala" : "Nova Escala"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="medico_id">Médico *</Label>
              <Select
                value={formData.medico_id}
                onValueChange={(value) => setFormData({ ...formData, medico_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {medicos.map((medico) => (
                    <SelectItem key={medico.id} value={medico.id.toString()}>
                      {medico.nome} - {medico.crm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plantão">Plantão</SelectItem>
                  <SelectItem value="Sobreaviso">Sobreaviso</SelectItem>
                  <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                  <SelectItem value="Consultório">Consultório</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_plantao">Tipo de Plantão</Label>
              <Select
                value={formData.tipo_plantao}
                onValueChange={(value) => setFormData({ ...formData, tipo_plantao: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {tiposPlantao.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data/Hora Início *</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim">Data/Hora Fim *</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                required
              />
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
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carga_horaria">Carga Horária (horas)</Label>
              <Input
                id="carga_horaria"
                type="number"
                step="0.5"
                value={formData.carga_horaria}
                onChange={(e) => setFormData({ ...formData, carga_horaria: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : escala ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
