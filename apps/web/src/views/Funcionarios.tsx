"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, Briefcase } from "lucide-react";
import FuncionarioDialog from "@/components/FuncionarioDialog";

interface Funcionario {
  id: number;
  nome: string;
  cpf: string | null;
  crm: string | null;
  cargo: string | null;
  tipo_funcionario: string;
  especialidade: string | null;
  telefone: string | null;
  email: string | null;
  telegram_id: string | null;
  is_ativo: number;
  unidade_hospitalar: string | null;
  setor: string | null;
  tipo_vinculo: string | null;
  data_admissao: string | null;
  data_nascimento: string | null;
  foto_url: string | null;
  coordenador_responsavel: string | null;
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState<Funcionario[]>([]);
  const [search, setSearch] = useState("");
  const [cargoFilter, setCargoFilter] = useState<string>("");
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [setorFilter, setSetorFilter] = useState<string>("");
  const [ativoFilter, setAtivoFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [cargos, setCargos] = useState<string[]>([]);
  const [setores, setSetores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFuncionarios();
    fetchCargos();
    fetchSetores();
  }, []);

  useEffect(() => {
    filterFuncionarios();
  }, [funcionarios, search, cargoFilter, tipoFilter, setorFilter, ativoFilter]);

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch("/api/funcionarios");
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error("Error fetching funcionarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCargos = async () => {
    try {
      const response = await fetch("/api/cargos");
      const data = await response.json();
      setCargos(data.map((c: any) => c.cargo).filter(Boolean));
    } catch (error) {
      console.error("Error fetching cargos:", error);
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

  const filterFuncionarios = () => {
    let filtered = [...funcionarios];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.nome.toLowerCase().includes(searchLower) ||
          f.cpf?.toLowerCase().includes(searchLower) ||
          f.crm?.toLowerCase().includes(searchLower) ||
          f.email?.toLowerCase().includes(searchLower)
      );
    }

    if (cargoFilter) {
      filtered = filtered.filter((f) => f.cargo === cargoFilter);
    }

    if (tipoFilter) {
      filtered = filtered.filter((f) => f.tipo_funcionario === tipoFilter);
    }

    if (setorFilter) {
      filtered = filtered.filter((f) => f.setor === setorFilter);
    }

    if (ativoFilter !== "all") {
      const isAtivo = ativoFilter === "true" ? 1 : 0;
      filtered = filtered.filter((f) => f.is_ativo === isAtivo);
    }

    setFilteredFuncionarios(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;

    try {
      await fetch(`/api/funcionarios/${id}`, { method: "DELETE" });
      fetchFuncionarios();
    } catch (error) {
      console.error("Error deleting funcionario:", error);
    }
  };

  const handleEdit = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingFuncionario(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setEditingFuncionario(null);
    if (refresh) {
      fetchFuncionarios();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const medicos = funcionarios.filter((f) => f.tipo_funcionario === "medico");
  const enfermagem = funcionarios.filter((f) => f.tipo_funcionario === "enfermagem");
  const administrativo = funcionarios.filter((f) => f.tipo_funcionario === "administrativo");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Funcionários</h1>
          <p className="text-muted-foreground mt-1">
            Cadastro e controle completo de toda a equipe
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{funcionarios.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">
                {funcionarios.filter((f) => f.is_ativo === 1).length}
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
              <UserX className="w-8 h-8 text-gray-400" />
              <span className="text-3xl font-bold">
                {funcionarios.filter((f) => f.is_ativo === 0).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cargos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{cargos.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-blue-600">{medicos.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Enfermagem</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-purple-600">{enfermagem.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-orange-600">{administrativo.length}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, CPF, CRM ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tipoFilter || "_all"} onValueChange={(v) => setTipoFilter(v === "_all" ? "" : v)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos</SelectItem>
                <SelectItem value="medico">Médico</SelectItem>
                <SelectItem value="enfermagem">Enfermagem</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="apoio">Apoio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cargoFilter || "_all"} onValueChange={(v) => setCargoFilter(v === "_all" ? "" : v)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos</SelectItem>
                {cargos.map((cargo) => (
                  <SelectItem key={cargo} value={cargo}>
                    {cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={setorFilter || "_all"} onValueChange={(v) => setSetorFilter(v === "_all" ? "" : v)}>
              <SelectTrigger className="w-full md:w-[180px]">
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
              <SelectTrigger className="w-full md:w-[150px]">
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
                  <TableHead>CPF/CRM</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFuncionarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum funcionário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFuncionarios.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">{funcionario.nome}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {funcionario.crm && <div>CRM: {funcionario.crm}</div>}
                          {funcionario.cpf && <div className="text-muted-foreground">CPF: {funcionario.cpf}</div>}
                          {!funcionario.crm && !funcionario.cpf && "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {funcionario.tipo_funcionario || "medico"}
                        </Badge>
                      </TableCell>
                      <TableCell>{funcionario.cargo || funcionario.especialidade || "-"}</TableCell>
                      <TableCell>{funcionario.setor || "-"}</TableCell>
                      <TableCell>{funcionario.tipo_vinculo || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={funcionario.is_ativo === 1 ? "default" : "secondary"}>
                          {funcionario.is_ativo === 1 ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(funcionario)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(funcionario.id)}
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

      <FuncionarioDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        funcionario={editingFuncionario}
      />
    </div>
  );
}
