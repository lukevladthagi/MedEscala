"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Checkin {
  id: number;
  medico_id: number;
  escala_id: number | null;
  data_hora: string;
  latitude: number | null;
  longitude: number | null;
  distancia_hospital: number | null;
  metodo_checkin: string;
  is_valido: number;
  is_no_prazo: number;
  observacoes: string | null;
}

interface CheckinDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  checkin: Checkin | null;
}

interface Medico {
  id: number;
  nome: string;
  crm: string;
}

interface Escala {
  id: number;
  medico_nome: string;
  data_inicio: string;
  data_fim: string;
  setor: string;
}

export default function CheckinDialog({ open, onClose, checkin }: CheckinDialogProps) {
  const [formData, setFormData] = useState({
    medico_id: "",
    escala_id: "",
    data_hora: "",
    latitude: "",
    longitude: "",
    distancia_hospital: "",
    metodo_checkin: "manual",
    is_valido: true,
    is_no_prazo: true,
    observacoes: ""
  });

  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMedicos();
      fetchEscalas();
    }
  }, [open]);

  useEffect(() => {
    if (checkin) {
      setFormData({
        medico_id: checkin.medico_id.toString(),
        escala_id: checkin.escala_id?.toString() || "",
        data_hora: checkin.data_hora.slice(0, 16),
        latitude: checkin.latitude?.toString() || "",
        longitude: checkin.longitude?.toString() || "",
        distancia_hospital: checkin.distancia_hospital?.toString() || "",
        metodo_checkin: checkin.metodo_checkin,
        is_valido: checkin.is_valido === 1,
        is_no_prazo: checkin.is_no_prazo === 1,
        observacoes: checkin.observacoes || ""
      });
    } else {
      setFormData({
        medico_id: "",
        escala_id: "",
        data_hora: new Date().toISOString().slice(0, 16),
        latitude: "",
        longitude: "",
        distancia_hospital: "",
        metodo_checkin: "manual",
        is_valido: true,
        is_no_prazo: true,
        observacoes: ""
      });
    }
  }, [checkin, open]);

  const fetchMedicos = async () => {
    try {
      const response = await fetch("/api/medicos?ativo=true");
      const data = await response.json();
      setMedicos(data);
    } catch (error) {
      console.error("Error fetching medicos:", error);
    }
  };

  const fetchEscalas = async () => {
    try {
      const response = await fetch("/api/escalas?status=ativa");
      const data = await response.json();
      setEscalas(data);
    } catch (error) {
      console.error("Error fetching escalas:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        medico_id: parseInt(formData.medico_id),
        escala_id: formData.escala_id ? parseInt(formData.escala_id) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        distancia_hospital: formData.distancia_hospital ? parseFloat(formData.distancia_hospital) : null,
        is_valido: formData.is_valido ? 1 : 0,
        is_no_prazo: formData.is_no_prazo ? 1 : 0
      };

      if (checkin) {
        await fetch(`/api/checkins/${checkin.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      onClose(true);
    } catch (error) {
      console.error("Error saving checkin:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{checkin ? "Editar Check-in" : "Registrar Check-in"}</DialogTitle>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="escala_id">Escala (Opcional)</Label>
              <Select
                value={formData.escala_id}
                onValueChange={(value) => setFormData({ ...formData, escala_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a escala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhuma</SelectItem>
                  {escalas.map((escala) => (
                    <SelectItem key={escala.id} value={escala.id.toString()}>
                      {escala.medico_nome} - {escala.setor} ({new Date(escala.data_inicio).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="data_hora">Data/Hora *</Label>
              <Input
                id="data_hora"
                type="datetime-local"
                value={formData.data_hora}
                onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="-23.5505"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="-46.6333"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distancia_hospital">Distância Hospital (m)</Label>
              <Input
                id="distancia_hospital"
                type="number"
                step="0.1"
                value={formData.distancia_hospital}
                onChange={(e) => setFormData({ ...formData, distancia_hospital: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo_checkin">Método</Label>
              <Select
                value={formData.metodo_checkin}
                onValueChange={(value) => setFormData({ ...formData, metodo_checkin: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="app">App Mobile</SelectItem>
                  <SelectItem value="gps">GPS Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-center justify-between">
              <Label htmlFor="is_valido">Validação GPS</Label>
              <Switch
                id="is_valido"
                checked={formData.is_valido}
                onCheckedChange={(checked) => setFormData({ ...formData, is_valido: checked })}
              />
            </div>

            <div className="space-y-2 flex items-center justify-between">
              <Label htmlFor="is_no_prazo">No Prazo</Label>
              <Switch
                id="is_no_prazo"
                checked={formData.is_no_prazo}
                onCheckedChange={(checked) => setFormData({ ...formData, is_no_prazo: checked })}
              />
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
              {loading ? "Salvando..." : checkin ? "Atualizar" : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
