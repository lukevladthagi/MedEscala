"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import KPICard from "@/components/KPICard";
import {
  AlertCircle,
  Award,
  Calendar,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
  Users2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const presencaSetor = [
  { setor: "UTI", presente: 12, total: 15 },
  { setor: "Emergencia", presente: 8, total: 10 },
  { setor: "Cirurgia", presente: 10, total: 12 },
  { setor: "Pediatria", presente: 6, total: 8 },
  { setor: "Cardiologia", presente: 5, total: 6 },
];

const presencaEspecialidade = [
  { name: "Clinico Geral", value: 25 },
  { name: "Cirurgiao", value: 18 },
  { name: "Anestesista", value: 12 },
  { name: "Pediatra", value: 10 },
  { name: "Cardiologista", value: 8 },
];

const evolucaoMensal = [
  { mes: "Jan", taxa: 85 },
  { mes: "Fev", taxa: 88 },
  { mes: "Mar", taxa: 90 },
  { mes: "Abr", taxa: 87 },
  { mes: "Mai", taxa: 92 },
  { mes: "Jun", taxa: 94 },
];

const rankingParticipacao = [
  { posicao: 1, nome: "Dr. Carlos Silva", crm: "12345", score: 98, setor: "UTI" },
  { posicao: 2, nome: "Dra. Maria Santos", crm: "23456", score: 96, setor: "Emergencia" },
  { posicao: 3, nome: "Dr. Joao Costa", crm: "34567", score: 94, setor: "Cirurgia" },
  { posicao: 4, nome: "Dra. Ana Oliveira", crm: "45678", score: 92, setor: "Pediatria" },
  { posicao: 5, nome: "Dr. Pedro Souza", crm: "56789", score: 90, setor: "Cardiologia" },
];

const ultimosCheckins = [
  { medico: "Dr. Carlos Silva", crm: "12345", setor: "UTI", hora: "07:45", status: "No prazo" },
  { medico: "Dra. Maria Santos", crm: "23456", setor: "Emergencia", hora: "07:50", status: "No prazo" },
  { medico: "Dr. Joao Costa", crm: "34567", setor: "Cirurgia", hora: "08:15", status: "Atrasado" },
  { medico: "Dra. Ana Oliveira", crm: "45678", setor: "Pediatria", hora: "07:30", status: "No prazo" },
  { medico: "Dr. Pedro Souza", crm: "56789", setor: "Cardiologia", hora: "08:30", status: "Inconsistencia" },
];

const COLORS = ["#002d6b", "#64748b", "#0ea5e9", "#10b981", "#f59e0b"];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  boxShadow: "0 12px 30px rgb(15 23 42 / 0.12)",
};

export default function Dashboard() {
  return (
    <div className="space-y-8 p-8">
      <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-[#002d6b] via-[#123d78] to-[#6f777c] p-6 text-white shadow-sm">
        <div className="absolute right-8 top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full border border-white/20 lg:block" />
        <div className="absolute right-20 top-1/2 hidden h-16 w-16 -translate-y-1/2 rounded-full border border-white/15 lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">ProntoEscala</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
            <p className="mt-1 text-sm text-white/75">Visao geral operacional em tempo real</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-white/12 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">94%</p>
              <p className="text-xs text-white/70">presenca</p>
            </div>
            <div className="rounded-md bg-white/12 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-white/70">pendencias</p>
            </div>
            <div className="rounded-md bg-white/12 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">51</p>
              <p className="text-xs text-white/70">escalas</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Medicos Presentes Hoje" value="41" subtitle="de 51 escalados" icon={Users} trend="up" trendValue="+5" variant="success" />
        <KPICard title="Plantoes Ativos" value="18" subtitle="em andamento" icon={Clock} variant="info" />
        <KPICard title="Escalas do Dia" value="51" subtitle="distribuidas" icon={Calendar} variant="slate" />
        <KPICard title="Taxa de Presenca" value="94%" subtitle="media mensal" icon={TrendingUp} trend="up" trendValue="+2%" variant="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Treinamentos" value="12" subtitle="participacoes este mes" icon={GraduationCap} variant="slate" />
        <KPICard title="Reunioes" value="8" subtitle="participacoes este mes" icon={Users2} variant="info" />
        <KPICard title="Pendencias Check-in" value="3" subtitle="aguardando" icon={AlertCircle} variant="warning" />
        <KPICard title="Indicador Adesao" value="96%" subtitle="score medio BIQ" icon={Award} trend="up" trendValue="+3%" variant="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Presenca por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={presencaSetor}>
                <defs>
                  <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="setor" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="presente" name="Presentes" fill="url(#presentGradient)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="total" name="Escalados" fill="url(#totalGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Distribuicao por Especialidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={presencaEspecialidade}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  label={(entry) => `${entry.value}`}
                  labelLine={false}
                  outerRadius={100}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {presencaEspecialidade.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-[#002d6b]" />
              Evolucao Mensal - Taxa de Presenca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoMensal}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="taxa"
                  stroke="#002d6b"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Ranking de Participacao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankingParticipacao.map((item) => (
                <div key={item.posicao} className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#002d6b] font-bold text-white">
                    {item.posicao}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      CRM {item.crm} - {item.setor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{item.score}</p>
                    <p className="text-xs text-muted-foreground">score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Ultimos Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medico</TableHead>
                <TableHead>CRM</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ultimosCheckins.map((checkin, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{checkin.medico}</TableCell>
                  <TableCell>{checkin.crm}</TableCell>
                  <TableCell>{checkin.setor}</TableCell>
                  <TableCell>{checkin.hora}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        checkin.status === "No prazo"
                          ? "default"
                          : checkin.status === "Atrasado"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {checkin.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
