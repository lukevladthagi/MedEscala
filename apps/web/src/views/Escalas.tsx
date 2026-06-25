"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Calendar, ChevronLeft, ChevronRight, Clock, Edit, Grid3x3, List, MapPin, Plus, Printer, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import EscalaCalendar from "@/components/EscalaCalendar";
import EscalaDialog from "@/components/EscalaDialog";
import EscalaGridView from "@/components/EscalaGridView";

interface Escala {
  id: number;
  medico_id: number | null;
  medico_nome: string | null;
  medico_crm: string | null;
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

interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidade: string | null;
}

interface FuncionarioEscala {
  id: number;
  nome: string;
  cargo: string | null;
  tipo_funcionario: string;
  setor: string | null;
  jornada_id: number | null;
  jornada_codigo: string | null;
  jornada_nome: string | null;
  jornada_flexivel: number | null;
  jornada_tipo_escala: string | null;
  is_ativo: number;
}

interface SlotDraft {
  id?: number;
  medico_id: string;
  tipo: string;
  tipo_plantao: string;
  data_inicio: string;
  data_fim: string;
  setor: string;
  especialidade: string;
  carga_horaria: string;
  observacoes: string;
  status: string;
}

const SHIFTS = [
  { label: "MANHÃ", value: "Manhã", start: "07:00", end: "13:00", hours: 6 },
  { label: "TARDE", value: "Tarde", start: "13:00", end: "19:00", hours: 6 },
  { label: "NOITE", value: "Noite", start: "19:00", end: "07:00", hours: 12, nextDayEnd: true },
];

const DEFAULT_SETORES = ["PA Cardiologia", "Emergência", "UTI", "Centro Cirúrgico"];

export default function Escalas() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [filteredEscalas, setFilteredEscalas] = useState<Escala[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioEscala[]>([]);
  const [selectedMedicoId, setSelectedMedicoId] = useState("");
  const [setorFilter, setSetorFilter] = useState("_all");
  const [statusFilter, setStatusFilter] = useState("ativa");
  const [tipoFilter, setTipoFilter] = useState("_all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null);
  const [setores, setSetores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [savingSlot, setSavingSlot] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotDraft, setSlotDraft] = useState<SlotDraft | null>(null);

  useEffect(() => {
    fetchEscalas();
    fetchSetores();
    fetchMedicos();
    fetchFuncionarios();
  }, []);

  useEffect(() => {
    fetchEscalas();
  }, [currentMonth]);

  useEffect(() => {
    filterEscalas();
  }, [escalas, setorFilter, statusFilter, tipoFilter]);

  const fetchEscalas = async () => {
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      const response = await fetch(`/api/escalas?data_inicio=${start}&data_fim=${end}`);
      const data = await response.json();
      setEscalas(Array.isArray(data) ? data : []);
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
      setSetores(Array.isArray(data) ? data.map((s: any) => s.setor).filter(Boolean) : []);
    } catch (error) {
      console.error("Error fetching setores:", error);
    }
  };

  const fetchMedicos = async () => {
    try {
      const response = await fetch("/api/medicos?ativo=true");
      const data = await response.json();
      setMedicos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching medicos:", error);
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch("/api/funcionarios?ativo=true");
      const data = await response.json();
      setFuncionarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching funcionarios:", error);
    }
  };

  const filterEscalas = () => {
    let filtered = [...escalas];

    if (setorFilter !== "_all") {
      filtered = filtered.filter((e) => e.setor === setorFilter);
    }

    if (statusFilter !== "_all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    if (tipoFilter !== "_all") {
      filtered = filtered.filter((e) => e.tipo === tipoFilter);
    }

    setFilteredEscalas(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este plantão?")) return;

    try {
      await fetch(`/api/escalas/${id}`, { method: "DELETE" });
      await fetchEscalas();
    } catch (error) {
      console.error("Error deleting escala:", error);
    }
  };

  const handleClaim = async (escala: Escala) => {
    if (!selectedMedicoId) {
      alert("Selecione o médico que vai assumir a vaga.");
      return;
    }

    setClaimingId(escala.id);
    try {
      const response = await fetch(`/api/escalas/${escala.id}/assumir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medico_id: Number(selectedMedicoId) }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Não foi possível assumir esta vaga.");
        return;
      }

      setSlotModalOpen(false);
      await fetchEscalas();
    } catch (error) {
      console.error("Error claiming escala:", error);
      alert("Não foi possível assumir esta vaga.");
    } finally {
      setClaimingId(null);
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

  const openEmptySlot = (setor: string, day: Date, shift: (typeof SHIFTS)[number]) => {
    const start = combineDateAndTime(day, shift.start);
    const end = combineDateAndTime(shift.nextDayEnd ? addDays(day, 1) : day, shift.end);

    setSlotDraft({
      medico_id: "",
      tipo: "Plantão",
      tipo_plantao: shift.value,
      data_inicio: toDateTimeLocal(start),
      data_fim: toDateTimeLocal(end),
      setor,
      especialidade: "",
      carga_horaria: String(shift.hours),
      observacoes: "",
      status: "ativa",
    });
    setSlotModalOpen(true);
  };

  const openExistingSlot = (escala: Escala) => {
    setSlotDraft({
      id: escala.id,
      medico_id: escala.medico_id?.toString() || "",
      tipo: escala.tipo || "Plantão",
      tipo_plantao: escala.tipo_plantao || "",
      data_inicio: escala.data_inicio.slice(0, 16),
      data_fim: escala.data_fim.slice(0, 16),
      setor: escala.setor || "",
      especialidade: escala.especialidade || "",
      carga_horaria: escala.carga_horaria?.toString() || "",
      observacoes: escala.observacoes || "",
      status: escala.status || "ativa",
    });
    setSlotModalOpen(true);
  };

  const saveSlotDraft = async () => {
    if (!slotDraft) return;
    setSavingSlot(true);

    try {
      const payload = {
        medico_id: slotDraft.medico_id ? Number(slotDraft.medico_id) : null,
        tipo: slotDraft.tipo,
        tipo_plantao: slotDraft.tipo_plantao || null,
        data_inicio: slotDraft.data_inicio,
        data_fim: slotDraft.data_fim,
        setor: slotDraft.setor || null,
        especialidade: slotDraft.especialidade || null,
        carga_horaria: slotDraft.carga_horaria ? Number(slotDraft.carga_horaria) : null,
        observacoes: slotDraft.observacoes || null,
        status: slotDraft.status,
      };

      const response = await fetch(slotDraft.id ? `/api/escalas/${slotDraft.id}` : "/api/escalas", {
        method: slotDraft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        alert("Não foi possível salvar o plantão.");
        return;
      }

      setSlotModalOpen(false);
      await fetchEscalas();
    } catch (error) {
      console.error("Error saving slot:", error);
      alert("Não foi possível salvar o plantão.");
    } finally {
      setSavingSlot(false);
    }
  };

  const formatDateTime = (value: string) => format(new Date(value), "dd/MM/yyyy HH:mm");
  const formatTime = (value: string) => format(new Date(value), "HH:mm");

  const getStatusLabel = (escala: Escala) => {
    if (escala.status === "cancelada") return "Cancelada";
    if (escala.status === "concluida") return "Concluída";
    return escala.medico_id ? "Ocupada" : "Disponível";
  };

  const getStatusVariant = (escala: Escala) => {
    if (escala.status === "cancelada") return "destructive";
    if (escala.medico_id) return "secondary";
    return "default";
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const activeEscalas = escalas.filter((e) => e.status === "ativa");
  const openSlots = activeEscalas.filter((e) => !e.medico_id);
  const occupiedSlots = activeEscalas.filter((e) => e.medico_id);
  const totalOpenHours = openSlots.reduce((sum, e) => sum + (e.carga_horaria || 0), 0);
  const selectedMedico = medicos.find((m) => m.id.toString() === selectedMedicoId);
  const boardSetores = useMemo(() => {
    if (setorFilter !== "_all") return [setorFilter];
    const fromDb = setores.length ? setores : DEFAULT_SETORES;
    const fromEscalas = activeEscalas.map((e) => e.setor).filter(Boolean) as string[];
    return Array.from(new Set([...fromDb, ...fromEscalas])).sort();
  }, [setorFilter, setores, activeEscalas]);

  const getSlotForCell = (setor: string, day: Date, shift: (typeof SHIFTS)[number]) =>
    activeEscalas.find((escala) => {
      if ((escala.setor || "") !== setor) return false;
      if (tipoFilter !== "_all" && escala.tipo !== tipoFilter) return false;
      const startDate = new Date(escala.data_inicio);
      const matchesDay = isSameDay(startDate, day);
      const matchesShift = (escala.tipo_plantao || "").toLowerCase() === shift.value.toLowerCase();
      const matchesStart = format(startDate, "HH:mm") === shift.start;
      return matchesDay && (matchesShift || matchesStart);
    });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Vagas da Escala</h1>
          <p className="mt-1 text-muted-foreground">
            Clique no dia e no horário para abrir, editar ou assumir um plantão.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 w-full lg:w-auto">
          <Plus className="h-4 w-4" />
          Nova Vaga
        </Button>
      </div>

      <Card className="border-blue-100 bg-blue-50/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="font-semibold text-blue-950">Médico para assumir vaga</div>
              <p className="text-sm text-blue-800">
                Selecione o médico e clique em um plantão livre na grade semanal.
              </p>
            </div>
            <Select value={selectedMedicoId || "_none"} onValueChange={(value) => setSelectedMedicoId(value === "_none" ? "" : value)}>
              <SelectTrigger className="w-full bg-white lg:w-[360px]">
                <SelectValue placeholder="Selecione o médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Selecione o médico</SelectItem>
                {medicos.map((medico) => (
                  <SelectItem key={medico.id} value={medico.id.toString()}>
                    {medico.nome} - {medico.crm || "sem CRM"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedMedico && (
            <div className="mt-3 text-sm text-blue-900">
              Médico selecionado: <strong>{selectedMedico.nome}</strong>
              {selectedMedico.especialidade ? ` • ${selectedMedico.especialidade}` : ""}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Vagas no mês" value={escalas.length} icon={<Calendar className="h-8 w-8 text-primary" />} />
        <MetricCard title="Disponíveis" value={openSlots.length} icon={<UserPlus className="h-8 w-8 text-green-600" />} />
        <MetricCard title="Ocupadas" value={occupiedSlots.length} icon={<div className="h-3 w-3 rounded-full bg-blue-500" />} />
        <MetricCard title="Horas abertas" value={`${totalOpenHours}h`} icon={<Clock className="h-8 w-8 text-primary" />} />
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board" className="gap-2">
            <MapPin className="h-4 w-4" />
            Quadro da Escala
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="grid" className="gap-2">
            <Grid3x3 className="h-4 w-4" />
            Grade Mensal
          </TabsTrigger>
          <TabsTrigger value="funcionarios" className="gap-2">
            <Grid3x3 className="h-4 w-4" />
            Funcionários
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Administração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle>Minha escala</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Grade semanal por local, dia e período. Células vazias também podem ser clicadas para criar vaga.
                  </p>
                </div>
                <ScheduleFilters
                  setorFilter={setorFilter}
                  setSetorFilter={setSetorFilter}
                  tipoFilter={tipoFilter}
                  setTipoFilter={setTipoFilter}
                  setores={setores.length ? setores : DEFAULT_SETORES}
                />
              </div>

              <div className="flex flex-col gap-3 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[260px] text-center font-semibold text-primary">
                    {format(weekStart, "dd 'de' MMM", { locale: ptBR })} a {format(weekEnd, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
                  Semana atual
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-[1180px] w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="sticky left-0 z-20 w-[220px] border-r bg-muted px-4 py-3 text-left text-sm font-semibold">
                        Local / período
                      </th>
                      {weekDays.map((day) => (
                        <th key={day.toISOString()} className="min-w-[150px] border-r px-3 py-3 text-center text-sm font-semibold">
                          <div className="capitalize">{format(day, "EEEE", { locale: ptBR })}</div>
                          <div className="text-base text-primary">{format(day, "dd/MM")}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {boardSetores.map((setor) =>
                      SHIFTS.map((shift, index) => (
                        <tr key={`${setor}-${shift.value}`} className="align-top">
                          <td className="sticky left-0 z-10 border-r border-t bg-background px-4 py-3">
                            {index === 0 && (
                              <div className="mb-3 flex items-center gap-2 font-semibold">
                                <MapPin className="h-4 w-4 text-primary" />
                                {setor}
                              </div>
                            )}
                            <div className="text-xs font-bold">{shift.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {shift.start}/{shift.end}
                            </div>
                          </td>
                          {weekDays.map((day) => {
                            const escala = getSlotForCell(setor, day, shift);
                            return (
                              <td key={`${setor}-${shift.value}-${day.toISOString()}`} className="h-[74px] border-r border-t p-1.5">
                                {escala ? (
                                  <ScheduleCell escala={escala} onOpen={openExistingSlot} formatTime={formatTime} />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openEmptySlot(setor, day, shift)}
                                    className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-white text-xs text-muted-foreground transition hover:border-primary hover:bg-blue-50 hover:text-primary"
                                  >
                                    + Abrir vaga
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <MonthHeader currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
            </CardHeader>
            <CardContent>
              <EscalaCalendar escalas={filteredEscalas as any} currentMonth={currentMonth} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <Card>
            <CardHeader>
              <MonthHeader currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
            </CardHeader>
            <CardContent>
              <EscalaGridView escalas={filteredEscalas as any} currentMonth={currentMonth} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionarios" className="space-y-4">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle>Escala automática por setor</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Veja a cobertura mensal de cada setor a partir das jornadas cadastradas nos funcionários.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <MonthHeader currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
                  <Select value={setorFilter} onValueChange={setSetorFilter}>
                    <SelectTrigger className="w-full md:w-[220px]">
                      <SelectValue placeholder="Setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">Todos os setores</SelectItem>
                      {(setores.length ? setores : DEFAULT_SETORES).map((setor) => (
                        <SelectItem key={setor} value={setor}>
                          {setor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SetorJornadaGrid
                funcionarios={funcionarios}
                currentMonth={currentMonth}
                setorFilter={setorFilter}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row">
                <ScheduleFilters
                  setorFilter={setorFilter}
                  setSetorFilter={setSetorFilter}
                  tipoFilter={tipoFilter}
                  setTipoFilter={setTipoFilter}
                  setores={setores.length ? setores : DEFAULT_SETORES}
                />
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
              <div className="overflow-x-auto rounded-md border">
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
                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                          Nenhuma vaga encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEscalas.map((escala) => (
                        <TableRow key={escala.id}>
                          <TableCell className="font-medium">
                            {escala.medico_id ? (
                              <div>
                                <div>{escala.medico_nome}</div>
                                <div className="text-xs text-muted-foreground">{escala.medico_crm}</div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-green-700">
                                <AlertTriangle className="h-4 w-4" />
                                Vaga aberta
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{escala.tipo}</TableCell>
                          <TableCell>{formatDateTime(escala.data_inicio)}</TableCell>
                          <TableCell>{formatDateTime(escala.data_fim)}</TableCell>
                          <TableCell>{escala.setor || "-"}</TableCell>
                          <TableCell>{escala.tipo_plantao || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(escala) as any}>{getStatusLabel(escala)}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!escala.medico_id && escala.status === "ativa" && (
                                <Button variant="outline" size="sm" onClick={() => handleClaim(escala)}>
                                  Assumir
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(escala)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(escala.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
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
      <PlantaoModal
        open={slotModalOpen}
        onOpenChange={setSlotModalOpen}
        draft={slotDraft}
        setDraft={setSlotDraft}
        medicos={medicos}
        setores={setores.length ? setores : DEFAULT_SETORES}
        saving={savingSlot}
        claimingId={claimingId}
        onSave={saveSlotDraft}
        onDelete={handleDelete}
        onClaim={(draft) => {
          const escala = escalas.find((item) => item.id === draft.id);
          if (escala) handleClaim(escala);
        }}
      />
    </div>
  );
}

function ScheduleCell({
  escala,
  onOpen,
  formatTime,
}: {
  escala: Escala;
  onOpen: (escala: Escala) => void;
  formatTime: (value: string) => string;
}) {
  const isOpen = !escala.medico_id;

  return (
    <button
      type="button"
      onClick={() => onOpen(escala)}
      className={`h-full w-full rounded-md border px-2 py-1.5 text-left text-xs transition ${
        isOpen
          ? "border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100"
          : "border-slate-300 bg-slate-100 hover:border-slate-400"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">
          {formatTime(escala.data_inicio)}-{formatTime(escala.data_fim)}
        </span>
        <span className={isOpen ? "text-green-700" : "text-slate-600"}>{isOpen ? "Livre" : "Ocupado"}</span>
      </div>
      <div className="mt-1 truncate font-medium">{isOpen ? "Clique para entrar" : escala.medico_nome}</div>
      {escala.especialidade && <div className="truncate text-muted-foreground">{escala.especialidade}</div>}
    </button>
  );
}

function SetorJornadaGrid({
  funcionarios,
  currentMonth,
  setorFilter,
}: {
  funcionarios: FuncionarioEscala[];
  currentMonth: Date;
  setorFilter: string;
}) {
  const [viewMode, setViewMode] = useState<"horario" | "sigla">("horario");

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const employeesWithJourney = useMemo(() => {
    return funcionarios
      .filter((func) => func.tipo_funcionario !== "medico")
      .filter((func) => func.jornada_id)
      .filter((func) => setorFilter === "_all" || func.setor === setorFilter)
      .sort((a, b) => {
        const sectorCompare = (a.setor || "Sem setor").localeCompare(b.setor || "Sem setor");
        return sectorCompare || a.nome.localeCompare(b.nome);
      });
  }, [funcionarios, setorFilter]);

  const groupedBySector = useMemo(() => {
    const groups = new Map<string, FuncionarioEscala[]>();
    employeesWithJourney.forEach((func) => {
      const sector = func.setor || "Sem setor";
      groups.set(sector, [...(groups.get(sector) || []), func]);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [employeesWithJourney]);

  const missingJourney = useMemo(
    () => funcionarios.filter((func) => func.tipo_funcionario !== "medico" && !func.jornada_id).length,
    [funcionarios],
  );

  const extractTimes = (text: string) => {
    return Array.from(text.matchAll(/\b\d{1,2}:\d{2}\b/g)).map((match) => match[0]);
  };

  const formatJourneyHours = (func: FuncionarioEscala) => {
    const name = func.jornada_nome || "";
    const times = extractTimes(name);

    if (times.length >= 4) return `${times[0]}-${times[1]} / ${times[2]}-${times[3]}`;
    if (times.length >= 2) return `${times[0]}-${times[1]}`;
    return func.jornada_codigo || "Jornada";
  };

  const getShiftInfo = (func: FuncionarioEscala, day: Date) => {
    const tipo = (func.jornada_tipo_escala || "").toLowerCase();
    const jornada = `${func.jornada_nome || ""} ${func.jornada_codigo || ""}`.toLowerCase();
    const times = extractTimes(jornada);
    const isSunday = day.getDay() === 0;

    if (tipo.includes("12 x 36") || tipo.includes("12x36")) {
      const works = day.getDate() % 2 === 1;
      if (!works) return { code: "FO", label: "Folga 36h", value: "FO", tone: "off" as const };
    }

    if (isSunday && tipo.includes("folga fixa")) {
      return { code: "FO", label: "Folga", value: viewMode === "sigla" ? "FO" : "FO", tone: "off" as const };
    }

    const firstHour = times[0] ? Number(times[0].split(":")[0]) : null;
    const lastHour = times.length ? Number(times[times.length - 1].split(":")[0]) : null;
    const hours = formatJourneyHours(func);

    if (jornada.includes("19:") || jornada.includes("noite") || jornada.includes("noturno") || (firstHour !== null && firstHour >= 18) || (lastHour !== null && lastHour <= 7)) {
      return { code: "N", label: "Noturno", value: viewMode === "sigla" ? "N" : hours, tone: "night" as const };
    }

    if (firstHour !== null && firstHour >= 12) {
      return { code: "T", label: "Tarde", value: viewMode === "sigla" ? "T" : hours, tone: "evening" as const };
    }

    if (firstHour !== null && lastHour !== null && firstHour < 12 && lastHour <= 14) {
      return { code: "M", label: "Manhã", value: viewMode === "sigla" ? "M" : hours, tone: "morning" as const };
    }

    return { code: "D", label: "Diurno", value: viewMode === "sigla" ? "D" : hours, tone: "day" as const };
  };

  const getCellClass = (tone: "morning" | "day" | "evening" | "night" | "off") => {
    const classes = {
      morning: "bg-amber-50 text-amber-900 border-amber-200",
      day: "bg-blue-50 text-blue-950 border-blue-200",
      evening: "bg-orange-50 text-orange-900 border-orange-200",
      night: "bg-indigo-50 text-indigo-950 border-indigo-200",
      off: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return classes[tone];
  };

  return (
    <div className="space-y-4" id="escala-setores-print">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between print:hidden">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:min-w-[680px]">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-muted-foreground">Setores com escala</div>
            <div className="text-2xl font-bold">{groupedBySector.length}</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-muted-foreground">Funcionários escalados</div>
            <div className="text-2xl font-bold">{employeesWithJourney.length}</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-muted-foreground">Sem jornada definida</div>
            <div className="text-2xl font-bold text-amber-600">{missingJourney}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-md border bg-white p-1">
            <Button size="sm" variant={viewMode === "horario" ? "default" : "ghost"} onClick={() => setViewMode("horario")}>Horário</Button>
            <Button size="sm" variant={viewMode === "sigla" ? "default" : "ghost"} onClick={() => setViewMode("sigla")}>Sigla</Button>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Imprimir escala
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-3 print:border-0 print:p-0">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs print:text-[10px]">
          <span className="font-semibold text-slate-700">Legenda:</span>
          <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-semibold text-amber-900">M Manhã</span>
          <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 font-semibold text-blue-950">D Diurno</span>
          <span className="rounded border border-orange-200 bg-orange-50 px-2 py-1 font-semibold text-orange-900">T Tarde</span>
          <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 font-semibold text-indigo-950">N Noturno</span>
          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 font-semibold text-slate-600">FO Folga</span>
        </div>

        <div className="mb-3 hidden print:block">
          <h2 className="text-lg font-bold">Escala por setor</h2>
          <p className="text-xs text-slate-600">{format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>

        <div className="overflow-x-auto rounded-lg border print:overflow-visible print:rounded-none">
          <table className="min-w-full border-collapse text-xs print:text-[8px]">
            <thead>
              <tr className="bg-slate-200 text-slate-800">
                <th className="sticky left-0 z-30 min-w-[78px] border border-slate-300 px-2 py-2 text-left print:static print:min-w-0 print:px-1">Reg.</th>
                <th className="sticky left-[78px] z-30 min-w-[220px] border border-slate-300 px-2 py-2 text-left print:static print:min-w-0 print:px-1">Funcionário</th>
                <th className="sticky left-[298px] z-30 min-w-[210px] border border-slate-300 px-2 py-2 text-left print:static print:min-w-0 print:px-1">Função</th>
                {daysInMonth.map((day) => (
                  <th key={day.toISOString()} className="min-w-[82px] border border-slate-300 px-1 py-1 text-center print:min-w-0">
                    <div className="font-semibold lowercase">{format(day, "EEE", { locale: ptBR }).slice(0, 3)}</div>
                    <div className="font-bold">{format(day, "dd")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedBySector.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth.length + 3} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum funcionário com jornada definida para este filtro.
                  </td>
                </tr>
              ) : (
                groupedBySector.map(([sector, employees]) => (
                  <Fragment key={sector}>
                    <tr className="bg-emerald-100 text-emerald-950">
                      <td className="border border-emerald-200 px-2 py-1 font-bold">SETOR</td>
                      <td colSpan={daysInMonth.length + 2} className="border border-emerald-200 px-2 py-1 font-bold uppercase">
                        {sector} <span className="font-normal">({employees.length} funcionários)</span>
                      </td>
                    </tr>
                    {employees.map((func) => (
                      <tr key={func.id} className="odd:bg-white even:bg-slate-50 hover:bg-blue-50">
                        <td className="sticky left-0 z-20 border border-slate-200 bg-inherit px-2 py-1 font-mono text-[11px] print:static print:px-1 print:text-[8px]">{func.id}</td>
                        <td className="sticky left-[78px] z-20 border border-slate-200 bg-inherit px-2 py-1 font-medium print:static print:px-1">{func.nome}</td>
                        <td className="sticky left-[298px] z-20 border border-slate-200 bg-inherit px-2 py-1 text-slate-600 print:static print:px-1">{func.cargo || func.tipo_funcionario || "-"}</td>
                        {daysInMonth.map((day) => {
                          const shift = getShiftInfo(func, day);
                          return (
                            <td key={day.toISOString()} className={`border px-1 py-1 text-center font-semibold ${getCellClass(shift.tone)}`} title={`${shift.label} - ${formatJourneyHours(func)}`}>
                              {shift.value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground print:hidden">
        Esta visão é gerada por setor a partir da jornada vinculada ao funcionário. Use o seletor para alternar entre horário completo e siglas da escala.
      </p>
    </div>
  );
}
function PlantaoModal({
  open,
  onOpenChange,
  draft,
  setDraft,
  medicos,
  setores,
  saving,
  claimingId,
  onSave,
  onDelete,
  onClaim,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: SlotDraft | null;
  setDraft: (draft: SlotDraft | null) => void;
  medicos: Medico[];
  setores: string[];
  saving: boolean;
  claimingId: number | null;
  onSave: () => void;
  onDelete: (id: number) => void;
  onClaim: (draft: SlotDraft) => void;
}) {
  const [activeTab, setActiveTab] = useState<"editar" | "anunciar" | "valores">("editar");
  const [announcement, setAnnouncement] = useState("");
  const [payType, setPayType] = useState<"nenhum" | "hora" | "alocacao">("nenhum");
  const [payValue, setPayValue] = useState("");
  const [payScope, setPayScope] = useState("turno");

  if (!draft) return null;

  const selectedDoctor = medicos.find((medico) => medico.id.toString() === draft.medico_id);
  const isExisting = Boolean(draft.id);
  const isOpenSlot = isExisting && !draft.medico_id;
  const formattedDate = draft.data_inicio ? format(new Date(draft.data_inicio), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "-";
  const formattedPeriod = `${draft.data_inicio ? format(new Date(draft.data_inicio), "HH:mm") : "--:--"} às ${draft.data_fim ? format(new Date(draft.data_fim), "HH:mm") : "--:--"}`;
  const announceTargets = Array.from(new Set([draft.setor, ...setores].filter(Boolean))).slice(0, 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isExisting ? "Editar plantão" : "Novo plantão"}</DialogTitle>
        </DialogHeader>

        <div className="flex border-b text-sm font-medium">
          <button type="button" onClick={() => setActiveTab("editar")} className={`px-4 py-3 ${activeTab === "editar" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Editar plantão</button>
          <button type="button" onClick={() => setActiveTab("anunciar")} className={`px-4 py-3 ${activeTab === "anunciar" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Anunciar plantão</button>
          <button type="button" onClick={() => setActiveTab("valores")} className={`px-4 py-3 ${activeTab === "valores" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Valores do plantão</button>
        </div>

        {activeTab === "editar" && (
          <>
        {isExisting && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Alterações neste plantão atualizam o quadro da escala imediatamente.
          </div>
        )}

        <div className="rounded-lg border p-4">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="Status" value={draft.status === "ativa" ? "Ativa" : draft.status} />
            <InfoRow label="Local" value={draft.setor || "-"} />
            <InfoRow label="Data" value={draft.data_inicio ? format(new Date(draft.data_inicio), "dd/MM/yyyy") : "-"} />
            <InfoRow label="Horário" value={`${draft.data_inicio ? format(new Date(draft.data_inicio), "HH:mm") : "--:--"} às ${draft.data_fim ? format(new Date(draft.data_fim), "HH:mm") : "--:--"}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Profissional</Label>
            <Select value={draft.medico_id || "_open"} onValueChange={(value) => setDraft({ ...draft, medico_id: value === "_open" ? "" : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Vaga aberta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_open">Vaga aberta</SelectItem>
                {medicos.map((medico) => (
                  <SelectItem key={medico.id} value={medico.id.toString()}>
                    {medico.nome} - {medico.crm || "sem CRM"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDoctor && <p className="text-xs text-muted-foreground">{selectedDoctor.especialidade || "Sem especialidade informada"}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={draft.tipo} onValueChange={(value) => setDraft({ ...draft, tipo: value })}>
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
            <Label>Período</Label>
            <Select value={draft.tipo_plantao || "_none"} onValueChange={(value) => setDraft({ ...draft, tipo_plantao: value === "_none" ? "" : value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Não definido</SelectItem>
                {SHIFTS.map((shift) => (
                  <SelectItem key={shift.value} value={shift.value}>
                    {shift.label} - {shift.start}/{shift.end}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Local</Label>
            <Select value={draft.setor || "_none"} onValueChange={(value) => setDraft({ ...draft, setor: value === "_none" ? "" : value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Não definido</SelectItem>
                {setores.map((setor) => (
                  <SelectItem key={setor} value={setor}>
                    {setor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Início</Label>
            <Input type="datetime-local" value={draft.data_inicio} onChange={(event) => setDraft({ ...draft, data_inicio: event.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Fim</Label>
            <Input type="datetime-local" value={draft.data_fim} onChange={(event) => setDraft({ ...draft, data_fim: event.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Especialidade</Label>
            <Input value={draft.especialidade} onChange={(event) => setDraft({ ...draft, especialidade: event.target.value })} placeholder="Ex.: Cardiologia" />
          </div>

          <div className="space-y-2">
            <Label>Carga horária</Label>
            <Input type="number" step="0.5" value={draft.carga_horaria} onChange={(event) => setDraft({ ...draft, carga_horaria: event.target.value })} />
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-3 font-semibold">Repetir turno</div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="rounded-full border px-3 py-1">Não repetir</span>
            <span className="rounded-full border px-3 py-1">Mensal</span>
            <span className="rounded-full border border-primary bg-blue-50 px-3 py-1 text-primary">Semanal</span>
            <span className="rounded-full border px-3 py-1">Diário</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
              <div key={day} className="rounded-full border px-2 py-1">
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Observação</Label>
          <Textarea value={draft.observacoes} onChange={(event) => setDraft({ ...draft, observacoes: event.target.value })} rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={draft.status} onValueChange={(value) => setDraft({ ...draft, status: value })}>
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

        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-between">
          <div>
            {draft.id && (
              <Button variant="outline" onClick={() => onDelete(draft.id!)}>
                Excluir plantão
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {isOpenSlot && (
              <Button variant="outline" onClick={() => onClaim(draft)} disabled={claimingId === draft.id}>
                Assumir plantão
              </Button>
            )}
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
          </>
        )}

        {activeTab === "anunciar" && (
          <div className="space-y-6">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Digite abaixo o seu anúncio, que será enviado a todos os profissionais das escalas selecionadas.
            </div>

            <div>
              <h3 className="font-semibold capitalize">Equipe: {formattedDate}</h3>
              <p className="text-xs text-muted-foreground">Regra definida para {draft.setor || "escala selecionada"} no período {formattedPeriod}</p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold uppercase">Anunciar para</Label>
              <div className="rounded-lg border p-3">
                <div className="flex flex-wrap gap-2">
                  {announceTargets.map((target) => (
                    <Badge key={target} variant="secondary" className="gap-1 rounded-sm bg-blue-100 px-3 py-1 text-blue-950">
                      {target}
                      <span className="text-muted-foreground">×</span>
                    </Badge>
                  ))}
                </div>
                <Input className="mt-3 border-0 px-0 shadow-none focus-visible:ring-0" placeholder="Busque uma escala" />
              </div>
            </div>

            <div className="space-y-2 border-t pt-6">
              <Label>Anúncio</Label>
              <Textarea
                value={announcement}
                onChange={(event) => setAnnouncement(event.target.value)}
                rows={6}
                placeholder="Ex.: Plantao disponivel para terca-feira, das 07:00 as 13:00. Interessados podem assumir pelo ProntoEscala."
              />
            </div>

            <div className="flex justify-center border-t pt-5">
              <Button
                className="min-w-[160px]"
                onClick={() => alert("Anúncio preparado. Na próxima etapa podemos integrar o envio por Telegram, e-mail ou notificação interna.")}
              >
                Anunciar
              </Button>
            </div>
          </div>
        )}

        {activeTab === "valores" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold capitalize">{formattedDate}</h3>
              <p className="text-sm text-muted-foreground">Regra definida para {draft.setor || "escala selecionada"}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
              <div>
                <div className="text-muted-foreground">Profissional</div>
                <div>{selectedDoctor?.nome || "Vaga aberta"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Horário do período</div>
                <div>{formattedPeriod}</div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground">Tipo</Label>
              <div className="flex flex-wrap gap-5">
                {[
                  ["nenhum", "Nenhum"],
                  ["hora", "Valor por hora"],
                  ["alocacao", "Valor por alocação"],
                ].map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2">
                    <input type="radio" name="payType" checked={payType === value} onChange={() => setPayType(value as typeof payType)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {payType !== "nenhum" && (
              <div className="max-w-xs space-y-2">
                <Label>Valor</Label>
                <Input value={payValue} onChange={(event) => setPayValue(event.target.value)} placeholder="R$ 0,00" />
              </div>
            )}

            <button type="button" className="font-semibold text-red-600" onClick={() => { setPayType("nenhum"); setPayValue(""); }}>
              Remover valores
            </button>

            <div className="space-y-3">
              <Label className="text-muted-foreground">Repetição</Label>
              <div className="space-y-3">
                {[
                  ["turno", "Aplicar somente a esse turno"],
                  ["futuros", "Aplicar a este turno e os futuros da regra de repetição"],
                  ["todos", "Aplicar a todos da regra de repetição"],
                ].map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2">
                    <input type="radio" name="payScope" checked={payScope === value} onChange={() => setPayScope(value)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Dica para organizar: valores específicos sobrepõem valores gerais na seguinte ordem de prioridade: valor do plantão, valor do profissional, valor da equipe e valor da escala.
            </div>

            <div className="flex justify-center gap-6 border-t pt-5">
              <Button variant="outline" onClick={() => setActiveTab("editar")}>Cancelar</Button>
              <Button onClick={() => alert("Valores preparados. Na próxima etapa podemos salvar estes dados no banco da escala.")}>Salvar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function ScheduleFilters({
  setorFilter,
  setSetorFilter,
  tipoFilter,
  setTipoFilter,
  setores,
}: {
  setorFilter: string;
  setSetorFilter: (value: string) => void;
  tipoFilter: string;
  setTipoFilter: (value: string) => void;
  setores: string[];
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <Select value={setorFilter} onValueChange={setSetorFilter}>
        <SelectTrigger className="w-full md:w-[220px]">
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Todos os setores</SelectItem>
          {setores.map((setor) => (
            <SelectItem key={setor} value={setor}>
              {setor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tipoFilter} onValueChange={setTipoFilter}>
        <SelectTrigger className="w-full md:w-[220px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Todos os tipos</SelectItem>
          <SelectItem value="Plantão">Plantão</SelectItem>
          <SelectItem value="Sobreaviso">Sobreaviso</SelectItem>
          <SelectItem value="Cirurgia">Cirurgia</SelectItem>
          <SelectItem value="Consultório">Consultório</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: ReactNode }) {
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

function MonthHeader({
  currentMonth,
  setCurrentMonth,
}: {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
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
        <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
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
  );
}

function combineDateAndTime(day: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(day);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function toDateTimeLocal(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}


