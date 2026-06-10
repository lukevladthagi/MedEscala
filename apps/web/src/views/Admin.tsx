"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Users, Database, Bell, Lock, Globe } from "lucide-react";

export default function Admin() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração do Sistema</h1>
        <p className="text-muted-foreground mt-1">
          Configurações gerais e gerenciamento do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_hospital">Nome do Hospital</Label>
              <Input id="nome_hospital" defaultValue="Hospital MEDSCALE" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" defaultValue="00.000.000/0001-00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" defaultValue="Rua Principal, 123" />
            </div>
            <Button className="w-full">Salvar Configurações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email de Check-in</Label>
                <p className="text-sm text-muted-foreground">Enviar emails de confirmação</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Telegram Automático</Label>
                <p className="text-sm text-muted-foreground">Notificações via Telegram</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Atraso</Label>
                <p className="text-sm text-muted-foreground">Notificar coordenadores</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatórios Semanais</Label>
                <p className="text-sm text-muted-foreground">Email com resumo semanal</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Administrador</p>
                  <p className="text-sm text-muted-foreground">admin@medscale.com</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Adicionar Novo Usuário
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de 2 Fatores</Label>
                <p className="text-sm text-muted-foreground">Requer código adicional</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sessão Automática</Label>
                <p className="text-sm text-muted-foreground">Logout após inatividade</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Tempo de Sessão (minutos)</Label>
              <Input type="number" defaultValue="30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Backup e Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">Diário às 03:00</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline" className="w-full">
              Fazer Backup Agora
            </Button>
            <Button variant="outline" className="w-full">
              Exportar Dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Integração Telegram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram_token">Token do Bot</Label>
              <Input id="telegram_token" type="password" placeholder="123456:ABC-DEF..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram_grupo">ID do Grupo</Label>
              <Input id="telegram_grupo" placeholder="-1001234567890" />
            </div>
            <Button className="w-full">Testar Conexão</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
