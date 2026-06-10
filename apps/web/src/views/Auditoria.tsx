"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function Auditoria() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("_all");

  const logs = [
    {
      id: 1,
      tipo: "Criação",
      entidade: "Funcionário",
      usuario: "Admin",
      acao: "Criou funcionário Dr. Carlos Silva",
      data: "2024-05-19 16:30:00",
      status: "sucesso"
    },
    {
      id: 2,
      tipo: "Edição",
      entidade: "Escala",
      usuario: "Admin",
      acao: "Atualizou escala #245 do setor UTI",
      data: "2024-05-19 15:45:00",
      status: "sucesso"
    },
    {
      id: 3,
      tipo: "Exclusão",
      entidade: "Check-in",
      usuario: "Admin",
      acao: "Removeu check-in #892",
      data: "2024-05-19 14:20:00",
      status: "alerta"
    },
    {
      id: 4,
      tipo: "Criação",
      entidade: "Treinamento",
      usuario: "Admin",
      acao: "Criou treinamento 'RCP Avançado'",
      data: "2024-05-19 13:10:00",
      status: "sucesso"
    },
    {
      id: 5,
      tipo: "Edição",
      entidade: "Funcionário",
      usuario: "Admin",
      acao: "Atualizou status de Dr. João Costa para inativo",
      data: "2024-05-19 12:05:00",
      status: "sucesso"
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auditoria e Logs do Sistema</h1>
        <p className="text-muted-foreground mt-1">
          Registro completo de todas as operações realizadas no sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total de Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.284</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Operações Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">1.251</div>
            <p className="text-xs text-muted-foreground mt-1">97.4%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">33</div>
            <p className="text-xs text-muted-foreground mt-1">2.6%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">Com acesso ao sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por ação ou usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo de Operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todas</SelectItem>
                <SelectItem value="criacao">Criação</SelectItem>
                <SelectItem value="edicao">Edição</SelectItem>
                <SelectItem value="exclusao">Exclusão</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.data}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.tipo}</Badge>
                    </TableCell>
                    <TableCell>{log.entidade}</TableCell>
                    <TableCell>{log.usuario}</TableCell>
                    <TableCell className="max-w-md truncate">{log.acao}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "sucesso" ? "default" : "secondary"}>
                        {log.status === "sucesso" ? "Sucesso" : "Alerta"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
