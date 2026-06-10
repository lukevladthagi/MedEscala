"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckinDialog from "@/components/CheckinDialog";
import CheckinMap from "@/components/CheckinMap";
import { format } from "date-fns";

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
  is_valido: number;
  is_no_prazo: number;
  observacoes: string | null;
}

export default function Checkins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [filteredCheckins, setFilteredCheckins] = useState<Checkin[]>([]);
  const [validoFilter, setValidoFilter] = useState<string>("all");
  const [prazoFilter, setPrazoFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckins();
  }, []);

  useEffect(() => {
    filterCheckins();
  }, [checkins, validoFilter, prazoFilter]);

  const fetchCheckins = async () => {
    try {
      const response = await fetch("/api/checkins");
      const data = await response.json();
      setCheckins(data);
    } catch (error) {
      console.error("Error fetching checkins:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCheckins = () => {
    let filtered = [...checkins];

    if (validoFilter !== "all") {
      const isValido = validoFilter === "true" ? 1 : 0;
      filtered = filtered.filter((c) => c.is_valido === isValido);
    }

    if (prazoFilter !== "all") {
      const isNoPrazo = prazoFilter === "true" ? 1 : 0;
      filtered = filtered.filter((c) => c.is_no_prazo === isNoPrazo);
    }

    setFilteredCheckins(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este check-in?")) return;

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
    if (refresh) {
      fetchCheckins();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const validCheckins = checkins.filter((c) => c.is_valido === 1);
  const onTimeCheckins = checkins.filter((c) => c.is_no_prazo === 1);
  const lateCheckins = checkins.filter((c) => c.is_no_prazo === 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoramento de Check-ins</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento em tempo real de presenças e validações GPS
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Registrar Check-in
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{checkins.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Válidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{validCheckins.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">No Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{onTimeCheckins.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold">{lateCheckins.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map" className="gap-2">
            <MapPin className="w-4 h-4" />
            Mapa
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Localização dos Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckinMap checkins={filteredCheckins} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
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
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Distância (m)</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Validação GPS</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCheckins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Nenhum check-in encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCheckins.map((checkin) => (
                        <TableRow key={checkin.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{checkin.medico_nome}</div>
                              <div className="text-xs text-muted-foreground">
                                {checkin.medico_crm}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(checkin.data_hora), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>{checkin.setor || "-"}</TableCell>
                          <TableCell>
                            {checkin.distancia_hospital
                              ? `${checkin.distancia_hospital.toFixed(0)}m`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{checkin.metodo_checkin}</Badge>
                          </TableCell>
                          <TableCell>
                            {checkin.is_valido === 1 ? (
                              <Badge className="gap-1 bg-green-500">
                                <CheckCircle className="w-3 h-3" />
                                Válido
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="w-3 h-3" />
                                Inválido
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {checkin.is_no_prazo === 1 ? (
                              <Badge className="gap-1 bg-blue-500">
                                <Clock className="w-3 h-3" />
                                No Prazo
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Atrasado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(checkin.id)}
                            >
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
      </Tabs>

      <CheckinDialog open={dialogOpen} onClose={handleDialogClose} checkin={editingCheckin} />
    </div>
  );
}
