"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Escala {
  id: number;
  medico_nome: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  tipo_plantao: string | null;
  status: string;
}

interface EscalaCalendarProps {
  escalas: Escala[];
  currentMonth: Date;
}

export default function EscalaCalendar({ escalas, currentMonth }: EscalaCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getEscalasForDay = (day: Date) => {
    return escalas.filter((escala) => {
      const escalaDate = new Date(escala.data_inicio);
      return isSameDay(escalaDate, day);
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEscalas = getEscalasForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={`min-h-[120px] border rounded-lg p-2 ${
                !isCurrentMonth ? "bg-muted/30" : "bg-background"
              } ${isToday ? "ring-2 ring-primary" : ""}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? "text-primary font-bold"
                    : isCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-1">
                {dayEscalas.slice(0, 3).map((escala) => (
                  <div
                    key={escala.id}
                    className="text-xs p-1 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                    title={`${escala.medico_nome} - ${escala.tipo} (${format(
                      new Date(escala.data_inicio),
                      "HH:mm"
                    )} - ${format(new Date(escala.data_fim), "HH:mm")})`}
                  >
                    <div className="font-medium truncate">{escala.medico_nome}</div>
                    <div className="text-muted-foreground truncate flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                        {escala.tipo_plantao || escala.tipo}
                      </Badge>
                      <span>{format(new Date(escala.data_inicio), "HH:mm")}</span>
                    </div>
                  </div>
                ))}
                {dayEscalas.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayEscalas.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
