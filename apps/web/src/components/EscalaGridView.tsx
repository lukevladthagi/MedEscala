"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, parseISO } from "date-fns";
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
  tipo_plantao: string | null;
  status: string;
}

interface EscalaGridViewProps {
  escalas: Escala[];
  currentMonth: Date;
}

export default function EscalaGridView({ escalas, currentMonth }: EscalaGridViewProps) {
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const doctorSchedules = useMemo(() => {
    const scheduleMap = new Map<number, { nome: string; crm: string; setor: string; days: Map<string, string[]> }>();

    escalas.forEach((escala) => {
      if (!scheduleMap.has(escala.medico_id)) {
        scheduleMap.set(escala.medico_id, {
          nome: escala.medico_nome,
          crm: escala.medico_crm,
          setor: escala.setor || "-",
          days: new Map()
        });
      }

      const doctor = scheduleMap.get(escala.medico_id)!;
      const startDate = parseISO(escala.data_inicio);
      const endDate = parseISO(escala.data_fim);

      daysInMonth.forEach((day) => {
        if (day >= startDate && day <= endDate) {
          const dayKey = format(day, "yyyy-MM-dd");
          if (!doctor.days.has(dayKey)) {
            doctor.days.set(dayKey, []);
          }
          
          const code = escala.tipo_plantao || escala.tipo.substring(0, 3).toUpperCase();
          doctor.days.get(dayKey)!.push(code);
        }
      });
    });

    return Array.from(scheduleMap.entries()).map(([id, data]) => ({ id, ...data }));
  }, [escalas, daysInMonth]);

  const getCellClass = (codes: string[]) => {
    if (codes.length === 0) return "bg-white";
    if (codes.some(c => c.includes("FER") || c.includes("FO"))) return "bg-pink-100";
    if (codes.some(c => c.includes("LIAT"))) return "bg-purple-100";
    return "bg-gray-50";
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="sticky left-0 z-20 bg-blue-50 px-3 py-2 text-left text-xs font-semibold text-gray-900 border-r-2 border-gray-300 min-w-[180px]">
                Nome
              </th>
              <th className="sticky left-[180px] z-20 bg-blue-50 px-3 py-2 text-left text-xs font-semibold text-gray-900 border-r-2 border-gray-300 min-w-[100px]">
                CRM
              </th>
              <th className="sticky left-[280px] z-20 bg-blue-50 px-3 py-2 text-left text-xs font-semibold text-gray-900 border-r-2 border-gray-300 min-w-[120px]">
                Setor
              </th>
              {daysInMonth.map((day) => (
                <th
                  key={day.toISOString()}
                  className="px-2 py-2 text-center text-xs font-semibold text-gray-900 border-r border-gray-200 min-w-[70px]"
                >
                  <div>{format(day, "EEE", { locale: ptBR }).substring(0, 3)}</div>
                  <div className="text-lg font-bold">{format(day, "dd")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {doctorSchedules.length === 0 ? (
              <tr>
                <td
                  colSpan={daysInMonth.length + 3}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  Nenhuma escala encontrada para este mês
                </td>
              </tr>
            ) : (
              doctorSchedules.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm font-medium text-gray-900 border-r-2 border-gray-300">
                    {doctor.nome}
                  </td>
                  <td className="sticky left-[180px] z-10 bg-white px-3 py-2 text-sm text-gray-600 border-r-2 border-gray-300">
                    {doctor.crm}
                  </td>
                  <td className="sticky left-[280px] z-10 bg-white px-3 py-2 text-sm text-gray-600 border-r-2 border-gray-300">
                    {doctor.setor}
                  </td>
                  {daysInMonth.map((day) => {
                    const dayKey = format(day, "yyyy-MM-dd");
                    const codes = doctor.days.get(dayKey) || [];
                    return (
                      <td
                        key={day.toISOString()}
                        className={`px-1 py-2 text-center text-xs font-semibold border-r border-gray-200 ${getCellClass(codes)}`}
                      >
                        {codes.map((code, idx) => (
                          <div key={idx} className="truncate">
                            {code}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
