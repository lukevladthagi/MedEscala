"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, UserCheck, UserX, Users } from "lucide-react";

interface Participante {
  id: number;
  medico_id: number;
  medico_nome: string;
  medico_crm: string;
  status_confirmacao: string;
  is_presente: number | null;
  metodo_presenca: string | null;
  data_hora_presenca: string | null;
  observacoes: string | null;
}

interface Medico {
  id: number;
  nome: string;
  crm: string;
}

interface ParticipantesDialogProps {
  open: boolean;
  onClose: () => void;
  type: "treinamento" | "reuniao";
  eventId: number;
  eventTitle: string;
}

export default function ParticipantesDialog({ open, onClose, type, eventId, eventTitle }: ParticipantesDialogProps) {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedMedico, setSelectedMedico] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    status_confirmacao: "",
    is_presente: null as number | null,
    observacoes: "",
  });

  useEffect(() => {
    if (open && eventId) {
      fetchParticipantes();
      fetchMedicos();
    }
  }, [open, eventId]);

  const participanteEndpoint = (participanteId: number) =>
    type === "treinamento"
      ? `/api/treinamentos-participantes/${participanteId}`
      : `/api/reunioes-participantes/${participanteId}`;

  const eventEndpoint =
    type === "treinamento" ? `/api/treinamentos/${eventId}/participantes` : `/api/reunioes/${eventId}/participantes`;

  const fetchParticipantes = async () => {
    try {
      const response = await fetch(eventEndpoint);
      const data = await response.json();
      setParticipantes(data);
    } catch (error) {
      console.error("Error fetching participantes:", error);
    }
  };

  const fetchMedicos = async () => {
    try {
      const response = await fetch("/api/medicos?ativo=true");
      const data = await response.json();
      setMedicos(data);
    } catch (error) {
      console.error("Error fetching medicos:", error);
    }
  };

  const handleAdd = async () => {
    if (!selectedMedico) return;

    try {
      await fetch(eventEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medico_id: parseInt(selectedMedico, 10),
          status_confirmacao: "pendente",
        }),
      });

      setSelectedMedico("");
      fetchParticipantes();
    } catch (error) {
      console.error("Error adding participante:", error);
    }
  };

  const handleUpdate = async (participanteId: number) => {
    try {
      await fetch(participanteEndpoint(participanteId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editData,
          metodo_presenca: editData.is_presente === null ? null : "lista_manual",
          data_hora_presenca: editData.is_presente === null ? null : new Date().toISOString(),
        }),
      });

      setEditingId(null);
      fetchParticipantes();
    } catch (error) {
      console.error("Error updating participante:", error);
    }
  };

  const handlePresence = async (participante: Participante, isPresente: number) => {
    try {
      await fetch(participanteEndpoint(participante.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_confirmacao: "confirmado",
          is_presente: isPresente,
          metodo_presenca: "lista_manual",
          data_hora_presenca: new Date().toISOString(),
          observacoes: participante.observacoes || null,
        }),
      });

      fetchParticipantes();
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  };

  const handleDelete = async (participanteId: number) => {
    if (!confirm("Remover este participante?")) return;

    try {
      await fetch(participanteEndpoint(participanteId), { method: "DELETE" });
      fetchParticipantes();
    } catch (error) {
      console.error("Error deleting participante:", error);
    }
  };

  const startEdit = (participante: Participante) => {
    setEditingId(participante.id);
    setEditData({
      status_confirmacao: participante.status_confirmacao,
      is_presente: participante.is_presente,
      observacoes: participante.observacoes || "",
    });
  };

  const formatPresenceTime = (value: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const presentes = participantes.filter((p) => p.is_presente === 1).length;
  const ausentes = participantes.filter((p) => p.is_presente === 0).length;
  const confirmados = participantes.filter((p) => p.status_confirmacao === "confirmado").length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lista de presenca - {eventTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{participantes.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <UserCheck className="h-8 w-8 text-sky-500" />
              <div>
                <div className="text-2xl font-bold">{confirmados}</div>
                <div className="text-sm text-muted-foreground">Confirmados</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{presentes}</div>
                <div className="text-sm text-muted-foreground">Presentes</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <UserX className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{ausentes}</div>
                <div className="text-sm text-muted-foreground">Ausentes</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedMedico} onValueChange={setSelectedMedico}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um medico" />
              </SelectTrigger>
              <SelectContent>
                {medicos
                  .filter((m) => !participantes.some((p) => p.medico_id === m.id))
                  .map((medico) => (
                    <SelectItem key={medico.id} value={medico.id.toString()}>
                      {medico.nome} - {medico.crm}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={!selectedMedico}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medico</TableHead>
                  <TableHead>Confirmacao</TableHead>
                  <TableHead>Presenca</TableHead>
                  <TableHead>Registrado em</TableHead>
                  <TableHead>Observacoes</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Nenhum participante cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  participantes.map((participante) => (
                    <TableRow key={participante.id}>
                      {editingId === participante.id ? (
                        <>
                          <TableCell className="font-medium">
                            <div>{participante.medico_nome}</div>
                            <div className="text-xs text-muted-foreground">{participante.medico_crm}</div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editData.status_confirmacao}
                              onValueChange={(value) => setEditData({ ...editData, status_confirmacao: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="confirmado">Confirmado</SelectItem>
                                <SelectItem value="recusado">Recusado</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editData.is_presente?.toString() || "null"}
                              onValueChange={(value) =>
                                setEditData({
                                  ...editData,
                                  is_presente: value === "null" ? null : parseInt(value, 10),
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="null">Pendente</SelectItem>
                                <SelectItem value="1">Presente</SelectItem>
                                <SelectItem value="0">Ausente</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatPresenceTime(participante.data_hora_presenca)}</TableCell>
                          <TableCell>
                            <Textarea
                              value={editData.observacoes}
                              onChange={(e) => setEditData({ ...editData, observacoes: e.target.value })}
                              rows={1}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => handleUpdate(participante.id)}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                Cancelar
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            <div>{participante.medico_nome}</div>
                            <div className="text-xs text-muted-foreground">{participante.medico_crm}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                participante.status_confirmacao === "confirmado"
                                  ? "default"
                                  : participante.status_confirmacao === "recusado"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {participante.status_confirmacao}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {participante.is_presente === null ? (
                              <Badge variant="secondary">Pendente</Badge>
                            ) : participante.is_presente === 1 ? (
                              <Badge className="bg-green-500">
                                <UserCheck className="mr-1 h-3 w-3" />
                                Presente
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <UserX className="mr-1 h-3 w-3" />
                                Ausente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatPresenceTime(participante.data_hora_presenca)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{participante.observacoes || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant={participante.is_presente === 1 ? "default" : "outline"}
                                onClick={() => handlePresence(participante, 1)}
                              >
                                Presente
                              </Button>
                              <Button
                                size="sm"
                                variant={participante.is_presente === 0 ? "destructive" : "outline"}
                                onClick={() => handlePresence(participante, 0)}
                              >
                                Ausente
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => startEdit(participante)}>
                                Editar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(participante.id)}>
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
