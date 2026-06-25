"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, LogIn, LogOut, MapPin, Monitor, Plus, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckinDialog from "@/components/CheckinDialog";
import CheckinMap from "@/components/CheckinMap";

interface Checkin {
  id: number;
  medico_id: number;
  medico_nome: string;
  medico_crm: string;
  escala_id: number | null;
  escala_inicio: string | null;
  escala_fim: string | null;
  setor: string | null;
  data_hora: string;
  latitude: number | null;
  longitude: number | null;
  distancia_hospital: number | null;
  metodo_checkin: string;
  tipo_registro?: "entrada" | "saida";
  status_biometria?: string | null;
  origem_dispositivo?: string | null;
  foto_url?: string | null;
  is_valido: number;
  is_no_prazo: number;
  observacoes: string | null;
}

export default function Checkins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [filteredCheckins, setFilteredCheckins] = useState<Checkin[]>([]);
  const [validoFilter, setValidoFilter] = useState("all");
  const [prazoFilter, setPrazoFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckins();
  }, []);

  useEffect(() => {
    let filtered = [...checkins];

    if (validoFilter !== "all") {
      filtered = filtered.filter((c) => c.is_valido === (validoFilter === "true" ? 1 : 0));
    }

    if (prazoFilter !== "all") {
      filtered = filtered.filter((c) => c.is_no_prazo === (prazoFilter === "true" ? 1 : 0));
    }

    setFilteredCheckins(filtered);
  }, [checkins, validoFilter, prazoFilter]);

  const fetchCheckins = async () => {
    try {
      const response = await fetch("/api/checkins");
      const data = await response.json();
      setCheckins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching checkins:", error);
      setCheckins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      await fetch(`/api/checkins/${id}`, { method: "DELETE" });
      fetchCheckins();
    } catch (error) {
      console.error("Error deleting checkin:", error);
    }
  };

  const handleAdd = () => {
    setEditingCheckin(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setEditingCheckin(null);
    if (refresh) fetchCheckins();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const entradas = checkins.filter((c) => (c.tipo_registro || "entrada") === "entrada");
  const saidas = checkins.filter((c) => c.tipo_registro === "saida");
  const lateCheckins = checkins.filter((c) => c.is_no_prazo === 0);
  const pendingFace = checkins.filter((c) => c.status_biometria === "pendente");

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoramento de Check-ins</h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhamento de entradas, saídas, selfies e validações dos plantões
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/tablet-checkin";
            }}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            Abrir Totem
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Registro Manual
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Registros Totais" value={checkins.length} icon={<MapPin className="h-8 w-8 text-primary" />} />
        <MetricCard title="Entradas" value={entradas.length} icon={<LogIn className="h-8 w-8 text-green-500" />} />
        <MetricCard title="Saídas" value={saidas.length} icon={<LogOut className="h-8 w-8 text-blue-500" />} />
        <MetricCard title="Biometria Pendente" value={pendingFace.length} icon={<ShieldCheck className="h-8 w-8 text-orange-500" />} />
      </div>

      {lateCheckins.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            <span>{lateCheckins.length} registro(s) fora do prazo precisam de revisão.</span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <MapPin className="h-4 w-4" />
            Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row">
                <Select value={validoFilter} onValueChange={setValidoFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Validação GPS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Válidos</SelectItem>
                    <SelectItem value="false">Inválidos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={prazoFilter} onValueChange={setPrazoFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">No Prazo</SelectItem>
                    <SelectItem value="false">Atrasados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Médico</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Distância</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Biometria</TableHead>
                      <TableHead>GPS</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCheckins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCheckins.map((checkin) => (
                        <TableRow key={checkin.id}>
                          <TableCell className="font-medium">
                            <div>{checkin.medico_nome}</div>
                            <div className="text-xs text-muted-foreground">{checkin.medico_crm}</div>
                          </TableCell>
                          <TableCell>
                            {(checkin.tipo_registro || "entrada") === "saida" ? (
                              <Badge variant="outline" className="gap-1 border-blue-200 text-blue-700">
                                <LogOut className="h-3 w-3" />
                                Saída
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 border-green-200 text-green-700">
                                <LogIn className="h-3 w-3" />
                                Entrada
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{format(new Date(checkin.data_hora), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell>{checkin.setor || "-"}</TableCell>
                          <TableCell>
                            {checkin.distancia_hospital ? `${Number(checkin.distancia_hospital).toFixed(0)}m` : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{checkin.metodo_checkin}</Badge>
                          </TableCell>
                          <TableCell>{renderBiometria(checkin)}</TableCell>
                          <TableCell>{renderGps(checkin)}</TableCell>
                          <TableCell>{renderPrazo(checkin)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(checkin.id)}>
                              Excluir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Localização dos Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckinMap checkins={filteredCheckins} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CheckinDialog open={dialogOpen} onClose={handleDialogClose} checkin={editingCheckin} />
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-3xl font-bold">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function renderBiometria(checkin: Checkin) {
  if (!checkin.foto_url && checkin.metodo_checkin === "manual") {
    return <Badge variant="outline">Manual</Badge>;
  }

  if (checkin.status_biometria === "aprovada") {
    return <Badge className="bg-green-500">Aprovada</Badge>;
  }

  if (checkin.status_biometria === "reprovada") {
    return <Badge variant="destructive">Reprovada</Badge>;
  }

  return <Badge variant="outline" className="border-orange-200 text-orange-700">Pendente</Badge>;
}

function renderGps(checkin: Checkin) {
  return checkin.is_valido === 1 ? (
    <Badge className="gap-1 bg-green-500">
      <CheckCircle className="h-3 w-3" />
      Válido
    </Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" />
      Inválido
    </Badge>
  );
}

function renderPrazo(checkin: Checkin) {
  return checkin.is_no_prazo === 1 ? (
    <Badge className="gap-1 bg-blue-500">
      <Clock className="h-3 w-3" />
      No Prazo
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <AlertCircle className="h-3 w-3" />
      Atrasado
    </Badge>
  );
}
