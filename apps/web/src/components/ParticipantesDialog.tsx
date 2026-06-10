"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UserCheck, UserX, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Participante {
  id: number;
  medico_id: number;
  medico_nome: string;
  medico_crm: string;
  status_confirmacao: string;
  is_presente: number | null;
  metodo_presenca: string | null;
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

export default function ParticipantesDialog({
  open,
  onClose,
  type,
  eventId,
  eventTitle,
}: ParticipantesDialogProps) {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedMedico, setSelectedMedico] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    status_confirmacao: "",
    is_presente: null as number | null,
    observacoes: ""
  });

  useEffect(() => {
    if (open && eventId) {
      fetchParticipantes();
      fetchMedicos();
    }
  }, [open, eventId]);

  const fetchParticipantes = async () => {
    try {
      const endpoint =
        type === "treinamento"
          ? `/api/treinamentos/${eventId}/participantes`
          : `/api/reunioes/${eventId}/participantes`;
      const response = await fetch(endpoint);
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
      const endpoint =
        type === "treinamento"
          ? `/api/treinamentos/${eventId}/participantes`
          : `/api/reunioes/${eventId}/participantes`;

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medico_id: parseInt(selectedMedico),
          status_confirmacao: "pendente"
        })
      });

      setSelectedMedico("");
      fetchParticipantes();
    } catch (error) {
      console.error("Error adding participante:", error);
    }
  };

  const handleUpdate = async (participanteId: number) => {
    try {
      const endpoint =
        type === "treinamento"
          ? `/api/treinamentos-participantes/${participanteId}`
          : `/api/reunioes-participantes/${participanteId}`;

      await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });

      setEditingId(null);
      fetchParticipantes();
    } catch (error) {
      console.error("Error updating participante:", error);
    }
  };

  const handleDelete = async (participanteId: number) => {
    if (!confirm("Remover este participante?")) return;

    try {
      const endpoint =
        type === "treinamento"
          ? `/api/treinamentos-participantes/${participanteId}`
          : `/api/reunioes-participantes/${participanteId}`;

      await fetch(endpoint, { method: "DELETE" });
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
      observacoes: participante.observacoes || ""
    });
  };

  const presentes = participantes.filter((p) => p.is_presente === 1).length;
  const confirmados = participantes.filter((p) => p.status_confirmacao === "confirmado").length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Participantes - {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{participantes.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{confirmados}</div>
                <div className="text-sm text-muted-foreground">Confirmados</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <UserCheck className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{presentes}</div>
                <div className="text-sm text-muted-foreground">Presentes</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedMedico} onValueChange={setSelectedMedico}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um médico" />
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
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médico</TableHead>
                  <TableHead>Confirmação</TableHead>
                  <TableHead>Presença</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum participante cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  participantes.map((participante) => (
                    <TableRow key={participante.id}>
                      {editingId === participante.id ? (
                        <>
                          <TableCell className="font-medium">
                            <div>
                              <div>{participante.medico_nome}</div>
                              <div className="text-xs text-muted-foreground">
                                {participante.medico_crm}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editData.status_confirmacao}
                              onValueChange={(value) =>
                                setEditData({ ...editData, status_confirmacao: value })
                              }
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
                                  is_presente: value === "null" ? null : parseInt(value)
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="null">-</SelectItem>
                                <SelectItem value="1">Presente</SelectItem>
                                <SelectItem value="0">Ausente</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Textarea
                              value={editData.observacoes}
                              onChange={(e) =>
                                setEditData({ ...editData, observacoes: e.target.value })
                              }
                              rows={1}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdate(participante.id)}
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            <div>
                              <div>{participante.medico_nome}</div>
                              <div className="text-xs text-muted-foreground">
                                {participante.medico_crm}
                              </div>
                            </div>
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
                              "-"
                            ) : participante.is_presente === 1 ? (
                              <Badge className="bg-green-500">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Presente
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <UserX className="w-3 h-3 mr-1" />
                                Ausente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {participante.observacoes || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(participante)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(participante.id)}
                              >
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

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
