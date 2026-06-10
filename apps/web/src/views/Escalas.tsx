"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, List, Edit, Trash2, Clock, Grid3x3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EscalaDialog from "@/components/EscalaDialog";
import EscalaCalendar from "@/components/EscalaCalendar";
import EscalaGridView from "@/components/EscalaGridView";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Escala {
  id: number;
  medico_id: number;
  medico_nome: string;
  medico_crm: string;
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

export default function Escalas() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [filteredEscalas, setFilteredEscalas] = useState<Escala[]>([]);
  const [setorFilter, setSetorFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ativa");
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null);
  const [setores, setSetores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEscalas();
    fetchSetores();
  }, []);

  useEffect(() => {
    filterEscalas();
  }, [escalas, setorFilter, statusFilter, tipoFilter]);

  const fetchEscalas = async () => {
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      
      const response = await fetch(`/api/escalas?data_inicio=${start}&data_fim=${end}`);
      const data = await response.json();
      setEscalas(data);
    } catch (error) {
      console.error("Error fetching escalas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSetores = async () => {
    try {
      const response = await fetch("/api/setores");
      const data = await response.json();
      setSetores(data.map((s: any) => s.setor));
    } catch (error) {
      console.error("Error fetching setores:", error);
    }
  };

  const filterEscalas = () => {
    let filtered = [...escalas];

    if (setorFilter) {
      filtered = filtered.filter((e) => e.setor === setorFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    if (tipoFilter) {
      filtered = filtered.filter((e) => e.tipo === tipoFilter);
    }

    setFilteredEscalas(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta escala?")) return;

    try {
      await fetch(`/api/escalas/${id}`, { method: "DELETE" });
      fetchEscalas();
    } catch (error) {
      console.error("Error deleting escala:", error);
    }
  };

  const handleEdit = (escala: Escala) => {
    setEditingEscala(escala);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingEscala(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setEditingEscala(null);
    if (refresh) {
      fetchEscalas();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeEscalas = escalas.filter((e) => e.status === "ativa");
  const totalHours = activeEscalas.reduce((sum, e) => sum + (e.carga_horaria || 0), 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Escalas</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie plantões e escalas médicas
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Escala
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Escalas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{escalas.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-3xl font-bold">{activeEscalas.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Horas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{totalHours}h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Setores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">
              {new Set(escalas.map((e) => e.setor)).size}
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="grid" className="gap-2">
            <Grid3x3 className="w-4 h-4" />
            Grade Mensal
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="w-4 h-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EscalaCalendar escalas={filteredEscalas} currentMonth={currentMonth} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visualização em grade - {filteredEscalas.length} escalas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                      setTimeout(fetchEscalas, 100);
                    }}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentMonth(new Date());
                      setTimeout(fetchEscalas, 100);
                    }}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                      setTimeout(fetchEscalas, 100);
                    }}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EscalaGridView escalas={filteredEscalas} currentMonth={currentMonth} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={setorFilter} onValueChange={setSetorFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos</SelectItem>
                    {setores.map((setor) => (
                      <SelectItem key={setor} value={setor}>
                        {setor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos</SelectItem>
                    <SelectItem value="Plantão">Plantão</SelectItem>
                    <SelectItem value="Sobreaviso">Sobreaviso</SelectItem>
                    <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
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
                      <TableHead>Data/Hora Início</TableHead>
                      <TableHead>Data/Hora Fim</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Plantão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEscalas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Nenhuma escala encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEscalas.map((escala) => (
                        <TableRow key={escala.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{escala.medico_nome}</div>
                              <div className="text-xs text-muted-foreground">
                                {escala.medico_crm}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{escala.tipo}</TableCell>
                          <TableCell>
                            {format(new Date(escala.data_inicio), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(escala.data_fim), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>{escala.setor || "-"}</TableCell>
                          <TableCell>{escala.tipo_plantao || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                escala.status === "ativa"
                                  ? "default"
                                  : escala.status === "concluida"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {escala.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(escala)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(escala.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
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

      <EscalaDialog open={dialogOpen} onClose={handleDialogClose} escala={editingEscala} />
    </div>
  );
}
