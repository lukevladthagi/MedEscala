"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Briefcase, Clock, AlertTriangle } from "lucide-react";
import CargoDialog from "@/components/CargoDialog";

interface Cargo {
  id: number;
  nome: string;
  tipo_vinculo: string | null;
  descricao: string | null;
  horas_diarias_max: number | null;
  horas_semanais_max: number | null;
  horas_mensais_max: number | null;
  dias_consecutivos_max: number | null;
  horas_descanso_minimo: number | null;
  permite_sobreaviso: number;
  permite_hora_extra: number;
  limite_hora_extra_mensal: number | null;
  intervalo_intrajornada_minimo: number | null;
  dias_folga_semana: number;
  observacoes: string | null;
  is_ativo: number;
}

export default function Cargos() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [filteredCargos, setFilteredCargos] = useState<Cargo[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCargos();
  }, []);

  useEffect(() => {
    filterCargos();
  }, [cargos, search]);

  const fetchCargos = async () => {
    try {
      const response = await fetch("/api/cargos-funcoes");
      const data = await response.json();
      setCargos(data);
    } catch (error) {
      console.error("Error fetching cargos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCargos = () => {
    let filtered = [...cargos];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchLower) ||
          c.descricao?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCargos(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cargo?")) return;

    try {
      await fetch(`/api/cargos-funcoes/${id}`, { method: "DELETE" });
      fetchCargos();
    } catch (error) {
      console.error("Error deleting cargo:", error);
    }
  };

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCargo(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setEditingCargo(null);
    if (refresh) {
      fetchCargos();
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
          <h1 className="text-3xl font-bold tracking-tight">Cargos e Funções</h1>
          <p className="text-muted-foreground mt-1">
            Configure carga horária e limites trabalhistas por cargo
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cargo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Cargos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{cargos.length}</span>
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
                {cargos.filter((c) => c.is_ativo === 1).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">CLT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">
                {cargos.filter((c) => c.tipo_vinculo === "CLT").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plantonista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold">
                {cargos.filter((c) => c.tipo_vinculo === "Plantonista").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Horas Diárias</TableHead>
                  <TableHead>Horas Semanais</TableHead>
                  <TableHead>Descanso Min.</TableHead>
                  <TableHead>Dias Consecutivos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCargos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum cargo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCargos.map((cargo) => (
                    <TableRow key={cargo.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cargo.nome}</div>
                          {cargo.descricao && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {cargo.descricao}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cargo.tipo_vinculo || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        {cargo.horas_diarias_max ? `${cargo.horas_diarias_max}h` : "-"}
                      </TableCell>
                      <TableCell>
                        {cargo.horas_semanais_max ? `${cargo.horas_semanais_max}h` : "-"}
                      </TableCell>
                      <TableCell>
                        {cargo.horas_descanso_minimo ? `${cargo.horas_descanso_minimo}h` : "-"}
                      </TableCell>
                      <TableCell>
                        {cargo.dias_consecutivos_max ? `${cargo.dias_consecutivos_max} dias` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cargo.is_ativo === 1 ? "default" : "secondary"}>
                          {cargo.is_ativo === 1 ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cargo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cargo.id)}
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

      <CargoDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        cargo={editingCargo}
      />
    </div>
  );
}
