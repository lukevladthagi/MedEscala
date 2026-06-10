"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";

interface Cargo {
  id: number;
  nome: string;
  tipo_vinculo: string | null;
  descricao: string | null;
  horas_diarias_max: number | null;
  horas_semanais_max: number | null;
  horas_mensais_max: number | null;
  dias_consecutivos_max: number | null;
  horas_descanso_minimo: number | null;
  permite_sobreaviso: number;
  permite_hora_extra: number;
  limite_hora_extra_mensal: number | null;
  intervalo_intrajornada_minimo: number | null;
  dias_folga_semana: number;
  observacoes: string | null;
  is_ativo: number;
}

interface CargoDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  cargo: Cargo | null;
}

export default function CargoDialog({ open, onClose, cargo }: CargoDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    tipo_vinculo: "",
    descricao: "",
    horas_diarias_max: "",
    horas_semanais_max: "",
    horas_mensais_max: "",
    dias_consecutivos_max: "",
    horas_descanso_minimo: "",
    permite_sobreaviso: false,
    permite_hora_extra: true,
    limite_hora_extra_mensal: "",
    intervalo_intrajornada_minimo: "",
    dias_folga_semana: "1",
    observacoes: "",
    is_ativo: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cargo) {
      setFormData({
        nome: cargo.nome,
        tipo_vinculo: cargo.tipo_vinculo || "",
        descricao: cargo.descricao || "",
        horas_diarias_max: cargo.horas_diarias_max?.toString() || "",
        horas_semanais_max: cargo.horas_semanais_max?.toString() || "",
        horas_mensais_max: cargo.horas_mensais_max?.toString() || "",
        dias_consecutivos_max: cargo.dias_consecutivos_max?.toString() || "",
        horas_descanso_minimo: cargo.horas_descanso_minimo?.toString() || "",
        permite_sobreaviso: cargo.permite_sobreaviso === 1,
        permite_hora_extra: cargo.permite_hora_extra === 1,
        limite_hora_extra_mensal: cargo.limite_hora_extra_mensal?.toString() || "",
        intervalo_intrajornada_minimo: cargo.intervalo_intrajornada_minimo?.toString() || "",
        dias_folga_semana: cargo.dias_folga_semana?.toString() || "1",
        observacoes: cargo.observacoes || "",
        is_ativo: cargo.is_ativo === 1
      });
    } else {
      setFormData({
        nome: "",
        tipo_vinculo: "",
        descricao: "",
        horas_diarias_max: "",
        horas_semanais_max: "",
        horas_mensais_max: "",
        dias_consecutivos_max: "",
        horas_descanso_minimo: "",
        permite_sobreaviso: false,
        permite_hora_extra: true,
        limite_hora_extra_mensal: "",
        intervalo_intrajornada_minimo: "",
        dias_folga_semana: "1",
        observacoes: "",
        is_ativo: true
      });
    }
  }, [cargo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        tipo_vinculo: formData.tipo_vinculo || null,
        descricao: formData.descricao || null,
        horas_diarias_max: formData.horas_diarias_max ? parseFloat(formData.horas_diarias_max) : null,
        horas_semanais_max: formData.horas_semanais_max ? parseFloat(formData.horas_semanais_max) : null,
        horas_mensais_max: formData.horas_mensais_max ? parseFloat(formData.horas_mensais_max) : null,
        dias_consecutivos_max: formData.dias_consecutivos_max ? parseInt(formData.dias_consecutivos_max) : null,
        horas_descanso_minimo: formData.horas_descanso_minimo ? parseFloat(formData.horas_descanso_minimo) : null,
        permite_sobreaviso: formData.permite_sobreaviso ? 1 : 0,
        permite_hora_extra: formData.permite_hora_extra ? 1 : 0,
        limite_hora_extra_mensal: formData.limite_hora_extra_mensal ? parseFloat(formData.limite_hora_extra_mensal) : null,
        intervalo_intrajornada_minimo: formData.intervalo_intrajornada_minimo ? parseFloat(formData.intervalo_intrajornada_minimo) : null,
        dias_folga_semana: formData.dias_folga_semana ? parseInt(formData.dias_folga_semana) : 1,
        observacoes: formData.observacoes || null,
        is_ativo: formData.is_ativo ? 1 : 0
      };

      if (cargo) {
        await fetch(`/api/cargos-funcoes/${cargo.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/cargos-funcoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      onClose(true);
    } catch (error) {
      console.error("Error saving cargo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cargo ? "Editar Cargo/Função" : "Novo Cargo/Função"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Configure os limites trabalhistas para evitar problemas legais nas escalas. Deixe em branco os campos que não se aplicam.
            </p>
          </div>

          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="jornada">Jornada</TabsTrigger>
              <TabsTrigger value="restricoes">Restrições</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome do Cargo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Médico Plantonista, Enfermeiro CLT"
                    required
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
                      <SelectItem value="_none">Nenhum</SelectItem>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="Plantonista">Plantonista</SelectItem>
                      <SelectItem value="Autônomo">Autônomo</SelectItem>
                      <SelectItem value="Temporário">Temporário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex items-center justify-between">
                  <Label htmlFor="is_ativo">Cargo Ativo</Label>
                  <Switch
                    id="is_ativo"
                    checked={formData.is_ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_ativo: checked })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada do cargo e suas responsabilidades"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="jornada" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horas_diarias_max">Horas Diárias Máximas</Label>
                  <Input
                    id="horas_diarias_max"
                    type="number"
                    step="0.5"
                    value={formData.horas_diarias_max}
                    onChange={(e) => setFormData({ ...formData, horas_diarias_max: e.target.value })}
                    placeholder="Ex: 6, 8, 12, 24"
                  />
                  <p className="text-xs text-muted-foreground">CLT: 8h/dia ou 44h/semana</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horas_semanais_max">Horas Semanais Máximas</Label>
                  <Input
                    id="horas_semanais_max"
                    type="number"
                    step="0.5"
                    value={formData.horas_semanais_max}
                    onChange={(e) => setFormData({ ...formData, horas_semanais_max: e.target.value })}
                    placeholder="Ex: 44, 60"
                  />
                  <p className="text-xs text-muted-foreground">CLT padrão: 44h semanais</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horas_mensais_max">Horas Mensais Máximas</Label>
                  <Input
                    id="horas_mensais_max"
                    type="number"
                    step="0.5"
                    value={formData.horas_mensais_max}
                    onChange={(e) => setFormData({ ...formData, horas_mensais_max: e.target.value })}
                    placeholder="Ex: 180, 220"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intervalo_intrajornada_minimo">Intervalo Intrajornada (horas)</Label>
                  <Input
                    id="intervalo_intrajornada_minimo"
                    type="number"
                    step="0.25"
                    value={formData.intervalo_intrajornada_minimo}
                    onChange={(e) => setFormData({ ...formData, intervalo_intrajornada_minimo: e.target.value })}
                    placeholder="Ex: 1"
                  />
                  <p className="text-xs text-muted-foreground">Intervalo dentro da jornada (almoço/descanso)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horas_descanso_minimo">Descanso Mínimo Entre Jornadas (horas)</Label>
                  <Input
                    id="horas_descanso_minimo"
                    type="number"
                    step="0.5"
                    value={formData.horas_descanso_minimo}
                    onChange={(e) => setFormData({ ...formData, horas_descanso_minimo: e.target.value })}
                    placeholder="Ex: 11"
                  />
                  <p className="text-xs text-muted-foreground">CLT: mínimo 11h entre jornadas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dias_folga_semana">Dias de Folga por Semana</Label>
                  <Input
                    id="dias_folga_semana"
                    type="number"
                    value={formData.dias_folga_semana}
                    onChange={(e) => setFormData({ ...formData, dias_folga_semana: e.target.value })}
                    placeholder="Ex: 1, 2"
                  />
                  <p className="text-xs text-muted-foreground">CLT: 1 dia de descanso semanal (DSR)</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="restricoes" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dias_consecutivos_max">Dias Consecutivos Máximos</Label>
                  <Input
                    id="dias_consecutivos_max"
                    type="number"
                    value={formData.dias_consecutivos_max}
                    onChange={(e) => setFormData({ ...formData, dias_consecutivos_max: e.target.value })}
                    placeholder="Ex: 6"
                  />
                  <p className="text-xs text-muted-foreground">Máximo de dias seguidos sem folga</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limite_hora_extra_mensal">Limite de Horas Extras Mensais</Label>
                  <Input
                    id="limite_hora_extra_mensal"
                    type="number"
                    step="0.5"
                    value={formData.limite_hora_extra_mensal}
                    onChange={(e) => setFormData({ ...formData, limite_hora_extra_mensal: e.target.value })}
                    placeholder="Ex: 20"
                    disabled={!formData.permite_hora_extra}
                  />
                  <p className="text-xs text-muted-foreground">CLT: máximo 2h/dia de hora extra</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="permite_hora_extra">Permite Hora Extra</Label>
                    <Switch
                      id="permite_hora_extra"
                      checked={formData.permite_hora_extra}
                      onCheckedChange={(checked) => setFormData({ ...formData, permite_hora_extra: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="permite_sobreaviso">Permite Sobreaviso</Label>
                    <Switch
                      id="permite_sobreaviso"
                      checked={formData.permite_sobreaviso}
                      onCheckedChange={(checked) => setFormData({ ...formData, permite_sobreaviso: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações e Regras Adicionais</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Especificidades deste cargo, acordos coletivos, ou outras regras importantes"
                    rows={3}
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
              {loading ? "Salvando..." : cargo ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
