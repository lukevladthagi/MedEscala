"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import KPICard from "@/components/KPICard";
import {
  Users,
  Clock,
  Calendar,
  GraduationCap,
  Users2,
  AlertCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

const presencaSetor = [
  { setor: "UTI", presente: 12, total: 15 },
  { setor: "Emergência", presente: 8, total: 10 },
  { setor: "Cirurgia", presente: 10, total: 12 },
  { setor: "Pediatria", presente: 6, total: 8 },
  { setor: "Cardiologia", presente: 5, total: 6 },
];

const presencaEspecialidade = [
  { name: "Clínico Geral", value: 25 },
  { name: "Cirurgião", value: 18 },
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
  { posicao: 2, nome: "Dra. Maria Santos", crm: "23456", score: 96, setor: "Emergência" },
  { posicao: 3, nome: "Dr. João Costa", crm: "34567", score: 94, setor: "Cirurgia" },
  { posicao: 4, nome: "Dra. Ana Oliveira", crm: "45678", score: 92, setor: "Pediatria" },
  { posicao: 5, nome: "Dr. Pedro Souza", crm: "56789", score: 90, setor: "Cardiologia" },
];

const ultimosCheckins = [
  { medico: "Dr. Carlos Silva", crm: "12345", setor: "UTI", hora: "07:45", status: "No prazo" },
  { medico: "Dra. Maria Santos", crm: "23456", setor: "Emergência", hora: "07:50", status: "No prazo" },
  { medico: "Dr. João Costa", crm: "34567", setor: "Cirurgia", hora: "08:15", status: "Atrasado" },
  { medico: "Dra. Ana Oliveira", crm: "45678", setor: "Pediatria", hora: "07:30", status: "No prazo" },
  { medico: "Dr. Pedro Souza", crm: "56789", setor: "Cardiologia", hora: "08:30", status: "Inconsistência" },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
        <p className="text-muted-foreground mt-1">Visão geral operacional em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Médicos Presentes Hoje"
          value="41"
          subtitle="de 51 escalados"
          icon={Users}
          trend="up"
          trendValue="+5"
          variant="success"
        />
        <KPICard
          title="Plantões Ativos"
          value="18"
          subtitle="em andamento"
          icon={Clock}
          variant="default"
        />
        <KPICard
          title="Escalas do Dia"
          value="51"
          subtitle="distribuídas"
          icon={Calendar}
          variant="default"
        />
        <KPICard
          title="Taxa de Presença"
          value="94%"
          subtitle="média mensal"
          icon={TrendingUp}
          trend="up"
          trendValue="+2%"
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Treinamentos"
          value="12"
          subtitle="participações este mês"
          icon={GraduationCap}
          variant="default"
        />
        <KPICard
          title="Reuniões"
          value="8"
          subtitle="participações este mês"
          icon={Users2}
          variant="default"
        />
        <KPICard
          title="Pendências Check-in"
          value="3"
          subtitle="aguardando"
          icon={AlertCircle}
          variant="warning"
        />
        <KPICard
          title="Indicador Adesão"
          value="96%"
          subtitle="score médio BIQ"
          icon={Award}
          trend="up"
          trendValue="+3%"
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Presença por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={presencaSetor}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="setor" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="presente" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="total" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Especialidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={presencaEspecialidade}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.value}`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {presencaEspecialidade.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal - Taxa de Presença</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line type="monotone" dataKey="taxa" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking de Participação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rankingParticipacao.map((item) => (
                <div key={item.posicao} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {item.posicao}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">CRM {item.crm} • {item.setor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{item.score}</p>
                    <p className="text-xs text-muted-foreground">score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médico</TableHead>
                <TableHead>CRM</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Horário</TableHead>
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
