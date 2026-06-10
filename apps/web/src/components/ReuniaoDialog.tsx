"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Reuniao {
  id: number;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  local: string | null;
  organizador: string | null;
  tipo: string | null;
  is_obrigatoria: number;
  status: string;
}

interface ReuniaoDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  reuniao: Reuniao | null;
}

export default function ReuniaoDialog({ open, onClose, reuniao }: ReuniaoDialogProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    local: "",
    organizador: "",
    tipo: "",
    is_obrigatoria: false,
    status: "agendada"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reuniao) {
      setFormData({
        titulo: reuniao.titulo,
        descricao: reuniao.descricao || "",
        data_inicio: reuniao.data_inicio.slice(0, 16),
        data_fim: reuniao.data_fim.slice(0, 16),
        local: reuniao.local || "",
        organizador: reuniao.organizador || "",
        tipo: reuniao.tipo || "",
        is_obrigatoria: reuniao.is_obrigatoria === 1,
        status: reuniao.status
      });
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        data_inicio: "",
        data_fim: "",
        local: "",
        organizador: "",
        tipo: "",
        is_obrigatoria: false,
        status: "agendada"
      });
    }
  }, [reuniao, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        is_obrigatoria: formData.is_obrigatoria ? 1 : 0
      };

      if (reuniao) {
        await fetch(`/api/reunioes/${reuniao.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/reunioes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      onClose(true);
    } catch (error) {
      console.error("Error saving reuniao:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reuniao ? "Editar Reunião" : "Nova Reunião"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
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
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                placeholder="Sala de Reuniões 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizador">Organizador</Label>
              <Input
                id="organizador"
                value={formData.organizador}
                onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
                placeholder="Dr. Maria Santos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhum</SelectItem>
                  <SelectItem value="Administrativa">Administrativa</SelectItem>
                  <SelectItem value="Clínica">Clínica</SelectItem>
                  <SelectItem value="Estratégica">Estratégica</SelectItem>
                  <SelectItem value="Operacional">Operacional</SelectItem>
                  <SelectItem value="Emergencial">Emergencial</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-center justify-between md:col-span-2">
              <Label htmlFor="is_obrigatoria">Reunião Obrigatória</Label>
              <Switch
                id="is_obrigatoria"
                checked={formData.is_obrigatoria}
                onCheckedChange={(checked) => setFormData({ ...formData, is_obrigatoria: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : reuniao ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
