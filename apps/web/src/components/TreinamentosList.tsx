"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import TreinamentoDialog from "./TreinamentoDialog";
import ParticipantesDialog from "./ParticipantesDialog";

interface Treinamento {
  id: number;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  local: string | null;
  instrutor: string | null;
  categoria: string | null;
  carga_horaria: number | null;
  vagas_total: number | null;
  is_obrigatorio: number;
  status: string;
}

interface TreinamentosListProps {
  onRefresh: () => void;
}

export default function TreinamentosList({ onRefresh }: TreinamentosListProps) {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [filteredTreinamentos, setFilteredTreinamentos] = useState<Treinamento[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [participantesDialogOpen, setParticipantesDialogOpen] = useState(false);
  const [selectedTreinamento, setSelectedTreinamento] = useState<Treinamento | null>(null);

  useEffect(() => {
    fetchTreinamentos();
  }, []);

  useEffect(() => {
    filterTreinamentos();
  }, [treinamentos, statusFilter]);

  const fetchTreinamentos = async () => {
    try {
      const response = await fetch("/api/treinamentos");
      const data = await response.json();
      setTreinamentos(data);
    } catch (error) {
      console.error("Error fetching treinamentos:", error);
    }
  };

  const filterTreinamentos = () => {
    let filtered = [...treinamentos];

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    setFilteredTreinamentos(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este treinamento?")) return;

    try {
      await fetch(`/api/treinamentos/${id}`, { method: "DELETE" });
      fetchTreinamentos();
      onRefresh();
    } catch (error) {
      console.error("Error deleting treinamento:", error);
    }
  };

  const handleEdit = (treinamento: Treinamento) => {
    setSelectedTreinamento(treinamento);
    setEditDialogOpen(true);
  };

  const handleParticipantes = (treinamento: Treinamento) => {
    setSelectedTreinamento(treinamento);
    setParticipantesDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Treinamentos</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="agendado">Agendados</SelectItem>
                <SelectItem value="realizado">Realizados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
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
                  <TableHead>Instrutor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTreinamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum treinamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTreinamentos.map((treinamento) => (
                    <TableRow key={treinamento.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{treinamento.titulo}</div>
                          {treinamento.is_obrigatorio === 1 && (
                            <Badge variant="destructive" className="mt-1">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(treinamento.data_inicio), "dd/MM/yyyy HH:mm")}</div>
                          {treinamento.carga_horaria && (
                            <div className="text-muted-foreground">{treinamento.carga_horaria}h</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{treinamento.local || "-"}</TableCell>
                      <TableCell>{treinamento.instrutor || "-"}</TableCell>
                      <TableCell>
                        {treinamento.categoria ? (
                          <Badge variant="outline">{treinamento.categoria}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{treinamento.vagas_total || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            treinamento.status === "agendado"
                              ? "bg-blue-500"
                              : treinamento.status === "realizado"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }
                        >
                          {treinamento.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleParticipantes(treinamento)}
                          >
                            Participantes
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(treinamento)}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(treinamento.id)}
                          >
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

      <TreinamentoDialog
        open={editDialogOpen}
        onClose={(refresh) => {
          setEditDialogOpen(false);
          setSelectedTreinamento(null);
          if (refresh) {
            fetchTreinamentos();
            onRefresh();
          }
        }}
        treinamento={selectedTreinamento}
      />

      <ParticipantesDialog
        open={participantesDialogOpen}
        onClose={() => {
          setParticipantesDialogOpen(false);
          setSelectedTreinamento(null);
        }}
        type="treinamento"
        eventId={selectedTreinamento?.id || 0}
        eventTitle={selectedTreinamento?.titulo || ""}
      />
    </>
  );
}
