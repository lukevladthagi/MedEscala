"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import ReuniaoDialog from "./ReuniaoDialog";
import ParticipantesDialog from "./ParticipantesDialog";

interface Reuniao {
  id: number;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  local: string | null;
  organizador: string | null;
  tipo: string | null;
  is_obrigatoria: number;
  status: string;
}

interface ReunioesListProps {
  onRefresh: () => void;
}

export default function ReunioesList({ onRefresh }: ReunioesListProps) {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [filteredReunioes, setFilteredReunioes] = useState<Reuniao[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [participantesDialogOpen, setParticipantesDialogOpen] = useState(false);
  const [selectedReuniao, setSelectedReuniao] = useState<Reuniao | null>(null);

  useEffect(() => {
    fetchReunioes();
  }, []);

  useEffect(() => {
    filterReunioes();
  }, [reunioes, statusFilter]);

  const fetchReunioes = async () => {
    try {
      const response = await fetch("/api/reunioes");
      const data = await response.json();
      setReunioes(data);
    } catch (error) {
      console.error("Error fetching reunioes:", error);
    }
  };

  const filterReunioes = () => {
    let filtered = [...reunioes];

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    setFilteredReunioes(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;

    try {
      await fetch(`/api/reunioes/${id}`, { method: "DELETE" });
      fetchReunioes();
      onRefresh();
    } catch (error) {
      console.error("Error deleting reuniao:", error);
    }
  };

  const handleEdit = (reuniao: Reuniao) => {
    setSelectedReuniao(reuniao);
    setEditDialogOpen(true);
  };

  const handleParticipantes = (reuniao: Reuniao) => {
    setSelectedReuniao(reuniao);
    setParticipantesDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Reuniões</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="agendada">Agendadas</SelectItem>
                <SelectItem value="realizada">Realizadas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Organizador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReunioes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma reunião encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReunioes.map((reuniao) => (
                    <TableRow key={reuniao.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{reuniao.titulo}</div>
                          {reuniao.is_obrigatoria === 1 && (
                            <Badge variant="destructive" className="mt-1">
                              Obrigatória
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(reuniao.data_inicio), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{reuniao.local || "-"}</TableCell>
                      <TableCell>{reuniao.organizador || "-"}</TableCell>
                      <TableCell>
                        {reuniao.tipo ? <Badge variant="outline">{reuniao.tipo}</Badge> : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            reuniao.status === "agendada"
                              ? "bg-blue-500"
                              : reuniao.status === "realizada"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }
                        >
                          {reuniao.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleParticipantes(reuniao)}
                          >
                            Participantes
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(reuniao)}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(reuniao.id)}>
                            Excluir
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

      <ReuniaoDialog
        open={editDialogOpen}
        onClose={(refresh) => {
          setEditDialogOpen(false);
          setSelectedReuniao(null);
          if (refresh) {
            fetchReunioes();
            onRefresh();
          }
        }}
        reuniao={selectedReuniao}
      />

      <ParticipantesDialog
        open={participantesDialogOpen}
        onClose={() => {
          setParticipantesDialogOpen(false);
          setSelectedReuniao(null);
        }}
        type="reuniao"
        eventId={selectedReuniao?.id || 0}
        eventTitle={selectedReuniao?.titulo || ""}
      />
    </>
  );
}
