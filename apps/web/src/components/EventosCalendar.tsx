"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, GraduationCap, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ParticipantesDialog from "./ParticipantesDialog";

interface Treinamento {
  id: number;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  local?: string | null;
  instrutor?: string | null;
  categoria?: string | null;
}

interface Reuniao {
  id: number;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  local?: string | null;
  organizador?: string | null;
  tipo?: string | null;
}

type EventType = "treinamento" | "reuniao";

interface CalendarEvent {
  id: number;
  type: EventType;
  title: string;
  start: Date;
  end: Date;
  status: string;
  local?: string | null;
  owner?: string | null;
  category?: string | null;
}

interface EventosCalendarProps {
  treinamentos: Treinamento[];
  reunioes: Reuniao[];
}

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const eventStyle = {
  treinamento: {
    label: "Treinamento",
    icon: GraduationCap,
    dot: "bg-emerald-500",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    badge: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  },
  reuniao: {
    label: "Reuniao",
    icon: Users,
    dot: "bg-sky-500",
    chip: "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
    badge: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  },
};

function safeDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatHour(date: Date) {
  return format(date, "HH:mm", { locale: ptBR });
}

function normalizeStatus(status: string) {
  return status
    .replace("agendada", "Agendada")
    .replace("agendado", "Agendado")
    .replace("realizada", "Realizada")
    .replace("realizado", "Realizado")
    .replace("cancelada", "Cancelada")
    .replace("cancelado", "Cancelado");
}

export default function EventosCalendar({ treinamentos, reunioes }: EventosCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events = useMemo<CalendarEvent[]>(() => {
    const trainingEvents = treinamentos.flatMap((treinamento) => {
      const start = safeDate(treinamento.data_inicio);
      const end = safeDate(treinamento.data_fim);
      if (!start || !end) return [];

      return [
        {
          id: treinamento.id,
          type: "treinamento" as const,
          title: treinamento.titulo,
          start,
          end,
          status: treinamento.status,
          local: treinamento.local,
          owner: treinamento.instrutor,
          category: treinamento.categoria,
        },
      ];
    });

    const meetingEvents = reunioes.flatMap((reuniao) => {
      const start = safeDate(reuniao.data_inicio);
      const end = safeDate(reuniao.data_fim);
      if (!start || !end) return [];

      return [
        {
          id: reuniao.id,
          type: "reuniao" as const,
          title: reuniao.titulo,
          start,
          end,
          status: reuniao.status,
          local: reuniao.local,
          owner: reuniao.organizador,
          category: reuniao.tipo,
        },
      ];
    });

    return [...trainingEvents, ...meetingEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [treinamentos, reunioes]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);

    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    });
  }, [currentMonth]);

  const eventsByDay = (day: Date) => events.filter((event) => isSameDay(event.start, day));
  const selectedDayEvents = eventsByDay(selectedDay);
  const monthEvents = events.filter((event) => isSameMonth(event.start, currentMonth));

  const openPresence = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays className="h-5 w-5 text-primary" />
            Agenda de treinamentos e reunioes
          </h2>
          <p className="text-sm text-muted-foreground">
            Veja os eventos por mes e abra a lista de presenca direto pelo calendario.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setCurrentMonth(today);
              setSelectedDay(today);
            }}
          >
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Proximo
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between border-b">
            <div>
              <CardTitle className="text-2xl capitalize">{format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
              <p className="text-sm text-muted-foreground">{monthEvents.length} evento(s) no mes</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className={cn("h-2.5 w-2.5 rounded-full", eventStyle.treinamento.dot)} />
                Treinamento
              </span>
              <span className="flex items-center gap-1">
                <span className={cn("h-2.5 w-2.5 rounded-full", eventStyle.reuniao.dot)} />
                Reuniao
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b bg-muted/50">
              {weekDays.map((day) => (
                <div key={day} className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const dayEvents = eventsByDay(day);
                const selected = isSameDay(day, selectedDay);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "min-h-32 border-b border-r p-2 text-left transition hover:bg-muted/40",
                      !isSameMonth(day, currentMonth) && "bg-muted/20 text-muted-foreground",
                      selected && "bg-primary/5 ring-2 ring-inset ring-primary/40",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                        isToday(day) && "bg-primary text-primary-foreground",
                        selected && !isToday(day) && "bg-primary/10 text-primary",
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const style = eventStyle[event.type];
                        return (
                          <span
                            key={`${event.type}-${event.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openPresence(event);
                            }}
                            className={cn(
                              "block truncate rounded-md border px-2 py-1 text-xs font-medium shadow-sm",
                              style.chip,
                            )}
                            title={event.title}
                          >
                            {formatHour(event.start)} {event.title}
                          </span>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="block text-xs font-medium text-muted-foreground">+{dayEvents.length - 3} evento(s)</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}</CardTitle>
            <p className="text-sm text-muted-foreground">{selectedDayEvents.length} evento(s) selecionado(s)</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhum treinamento ou reuniao nesta data.
              </div>
            ) : (
              selectedDayEvents.map((event) => {
                const style = eventStyle[event.type];
                const Icon = style.icon;

                return (
                  <div key={`${event.type}-${event.id}`} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold leading-tight">{event.title}</h3>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <Badge className={style.badge}>{style.label}</Badge>
                            <Badge variant="outline">{normalizeStatus(event.status)}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatHour(event.start)} as {formatHour(event.end)}
                      </div>
                      {event.local && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.local}
                        </div>
                      )}
                      {event.owner && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {event.owner}
                        </div>
                      )}
                    </div>

                    <Button className="mt-4 w-full" variant="outline" onClick={() => openPresence(event)}>
                      Abrir lista de presenca
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <ParticipantesDialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        type={selectedEvent?.type || "treinamento"}
        eventId={selectedEvent?.id || 0}
        eventTitle={selectedEvent?.title || ""}
      />
    </div>
  );
}
