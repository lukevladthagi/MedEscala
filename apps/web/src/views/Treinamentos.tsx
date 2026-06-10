"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, GraduationCap, Users as UsersIcon } from "lucide-react";
import TreinamentosList from "@/components/TreinamentosList";
import ReunioesList from "@/components/ReunioesList";
import TreinamentoDialog from "@/components/TreinamentoDialog";
import ReuniaoDialog from "@/components/ReuniaoDialog";

interface Treinamento {
  id: number;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  status: string;
}

interface Reuniao {
  id: number;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  status: string;
}

export default function Treinamentos() {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [treinamentoDialogOpen, setTreinamentoDialogOpen] = useState(false);
  const [reuniaoDialogOpen, setReuniaoDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [treinamentosRes, reunioesRes] = await Promise.all([
        fetch("/api/treinamentos"),
        fetch("/api/reunioes"),
      ]);

      const treinamentosData = await treinamentosRes.json();
      const reunioesData = await reunioesRes.json();

      setTreinamentos(treinamentosData);
      setReunioes(reunioesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const agendadosTreinamentos = treinamentos.filter((t) => t.status === "agendado");
  const realizadosTreinamentos = treinamentos.filter((t) => t.status === "realizado");
  const agendadasReunioes = reunioes.filter((r) => r.status === "agendada");
  const realizadasReunioes = reunioes.filter((r) => r.status === "realizada");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Treinamentos e Reuniões</h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa de eventos, presença e participação
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Treinamentos Agendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{agendadosTreinamentos.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Treinamentos Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{realizadosTreinamentos.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reuniões Agendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold">{agendadasReunioes.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reuniões Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold">{realizadasReunioes.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="treinamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="treinamentos" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Treinamentos
          </TabsTrigger>
          <TabsTrigger value="reunioes" className="gap-2">
            <UsersIcon className="w-4 h-4" />
            Reuniões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="treinamentos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setTreinamentoDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Treinamento
            </Button>
          </div>
          <TreinamentosList onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="reunioes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setReuniaoDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Reunião
            </Button>
          </div>
          <ReunioesList onRefresh={fetchData} />
        </TabsContent>
      </Tabs>

      <TreinamentoDialog
        open={treinamentoDialogOpen}
        onClose={(refresh) => {
          setTreinamentoDialogOpen(false);
          if (refresh) fetchData();
        }}
        treinamento={null}
      />

      <ReuniaoDialog
        open={reuniaoDialogOpen}
        onClose={(refresh) => {
          setReuniaoDialogOpen(false);
          if (refresh) fetchData();
        }}
        reuniao={null}
      />
    </div>
  );
}
