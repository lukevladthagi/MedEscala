"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import MedicoDialog from "@/components/MedicoDialog";

interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidade: string | null;
  telefone: string | null;
  telegram_id: string | null;
  is_ativo: number;
  unidade_hospitalar: string | null;
  setor: string | null;
  tipo_vinculo: string | null;
  foto_url: string | null;
  coordenador_responsavel: string | null;
  email: string | null;
}

export default function Medicos() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [filteredMedicos, setFilteredMedicos] = useState<Medico[]>([]);
  const [search, setSearch] = useState("");
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>("");
  const [setorFilter, setSetorFilter] = useState<string>("");
  const [ativoFilter, setAtivoFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [setores, setSetores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicos();
    fetchEspecialidades();
    fetchSetores();
  }, []);

  useEffect(() => {
    filterMedicos();
  }, [medicos, search, especialidadeFilter, setorFilter, ativoFilter]);

  const fetchMedicos = async () => {
    try {
      const response = await fetch("/api/medicos");
      const data = await response.json();
      setMedicos(data);
    } catch (error) {
      console.error("Error fetching medicos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const response = await fetch("/api/especialidades");
      const data = await response.json();
      setEspecialidades(data.map((e: any) => e.especialidade));
    } catch (error) {
      console.error("Error fetching especialidades:", error);
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

  const filterMedicos = () => {
    let filtered = [...medicos];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.nome.toLowerCase().includes(searchLower) ||
          m.crm.toLowerCase().includes(searchLower) ||
          m.email?.toLowerCase().includes(searchLower)
      );
    }

    if (especialidadeFilter) {
      filtered = filtered.filter((m) => m.especialidade === especialidadeFilter);
    }

    if (setorFilter) {
      filtered = filtered.filter((m) => m.setor === setorFilter);
    }

    if (ativoFilter !== "all") {
      const isAtivo = ativoFilter === "true" ? 1 : 0;
      filtered = filtered.filter((m) => m.is_ativo === isAtivo);
    }

    setFilteredMedicos(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este médico?")) return;

    try {
      await fetch(`/api/medicos/${id}`, { method: "DELETE" });
      fetchMedicos();
    } catch (error) {
      console.error("Error deleting medico:", error);
    }
  };

  const handleEdit = (medico: Medico) => {
    setEditingMedico(medico);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingMedico(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setEditingMedico(null);
    if (refresh) {
      fetchMedicos();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Médicos</h1>
          <p className="text-muted-foreground mt-1">
            Cadastro e controle completo da equipe médica
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Médico
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{medicos.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-3xl font-bold">
                {medicos.filter((m) => m.is_ativo === 1).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-3xl font-bold">
                {medicos.filter((m) => m.is_ativo === 0).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{especialidades.length}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, CRM ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={especialidadeFilter} onValueChange={setEspecialidadeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todas</SelectItem>
                {especialidades.map((esp) => (
                  <SelectItem key={esp} value={esp}>
                    {esp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select value={ativoFilter} onValueChange={setAtivoFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CRM</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum médico encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicos.map((medico) => (
                    <TableRow key={medico.id}>
                      <TableCell className="font-medium">{medico.nome}</TableCell>
                      <TableCell>{medico.crm}</TableCell>
                      <TableCell>{medico.especialidade || "-"}</TableCell>
                      <TableCell>{medico.setor || "-"}</TableCell>
                      <TableCell>{medico.tipo_vinculo || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={medico.is_ativo === 1 ? "default" : "secondary"}>
                          {medico.is_ativo === 1 ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(medico)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(medico.id)}
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

      <MedicoDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        medico={editingMedico}
      />
    </div>
  );
}
