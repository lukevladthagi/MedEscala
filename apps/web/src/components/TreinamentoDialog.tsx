"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Treinamento {
  id: number;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  local: string | null;
  instrutor: string | null;
  categoria: string | null;
  carga_horaria: number | null;
  vagas_total: number | null;
  is_obrigatorio: number;
  status: string;
}

interface TreinamentoDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  treinamento: Treinamento | null;
}

export default function TreinamentoDialog({ open, onClose, treinamento }: TreinamentoDialogProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    local: "",
    instrutor: "",
    categoria: "",
    carga_horaria: "",
    vagas_total: "",
    is_obrigatorio: false,
    status: "agendado"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (treinamento) {
      setFormData({
        titulo: treinamento.titulo,
        descricao: treinamento.descricao || "",
        data_inicio: treinamento.data_inicio.slice(0, 16),
        data_fim: treinamento.data_fim.slice(0, 16),
        local: treinamento.local || "",
        instrutor: treinamento.instrutor || "",
        categoria: treinamento.categoria || "",
        carga_horaria: treinamento.carga_horaria?.toString() || "",
        vagas_total: treinamento.vagas_total?.toString() || "",
        is_obrigatorio: treinamento.is_obrigatorio === 1,
        status: treinamento.status
      });
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        data_inicio: "",
        data_fim: "",
        local: "",
        instrutor: "",
        categoria: "",
        carga_horaria: "",
        vagas_total: "",
        is_obrigatorio: false,
        status: "agendado"
      });
    }
  }, [treinamento, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        carga_horaria: formData.carga_horaria ? parseInt(formData.carga_horaria) : null,
        vagas_total: formData.vagas_total ? parseInt(formData.vagas_total) : null,
        is_obrigatorio: formData.is_obrigatorio ? 1 : 0
      };

      if (treinamento) {
        await fetch(`/api/treinamentos/${treinamento.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/treinamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      onClose(true);
    } catch (error) {
      console.error("Error saving treinamento:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {treinamento ? "Editar Treinamento" : "Novo Treinamento"}
          </DialogTitle>
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
                placeholder="Auditório Principal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instrutor">Instrutor</Label>
              <Input
                id="instrutor"
                value={formData.instrutor}
                onChange={(e) => setFormData({ ...formData, instrutor: e.target.value })}
                placeholder="Dr. João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhuma</SelectItem>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Segurança">Segurança</SelectItem>
                  <SelectItem value="Clínico">Clínico</SelectItem>
                  <SelectItem value="Gestão">Gestão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carga_horaria">Carga Horária (horas)</Label>
              <Input
                id="carga_horaria"
                type="number"
                value={formData.carga_horaria}
                onChange={(e) => setFormData({ ...formData, carga_horaria: e.target.value })}
                placeholder="4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vagas_total">Vagas Totais</Label>
              <Input
                id="vagas_total"
                type="number"
                value={formData.vagas_total}
                onChange={(e) => setFormData({ ...formData, vagas_total: e.target.value })}
                placeholder="30"
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
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-center justify-between md:col-span-2">
              <Label htmlFor="is_obrigatorio">Treinamento Obrigatório</Label>
              <Switch
                id="is_obrigatorio"
                checked={formData.is_obrigatorio}
                onCheckedChange={(checked) => setFormData({ ...formData, is_obrigatorio: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : treinamento ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
