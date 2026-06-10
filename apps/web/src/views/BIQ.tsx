"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Award } from "lucide-react";

export default function BIQ() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">BIQ - Bonificação por Indicadores de Qualidade</h1>
        <p className="text-muted-foreground mt-1">
          Sistema de bonificação baseado em indicadores de qualidade
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Bonificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 24.500</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Funcionários Elegíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">38</div>
            <p className="text-xs text-muted-foreground mt-1">De 45 totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Média de Bonificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 645</div>
            <p className="text-xs text-muted-foreground mt-1">Por funcionário</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Taxa de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground mt-1">+3% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critérios de Bonificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Presença Pontual</h3>
                <p className="text-sm text-muted-foreground">Check-in dentro do horário estabelecido</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">100%</div>
                <div className="text-xs text-muted-foreground">Peso: 30%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Cumprimento de Escalas</h3>
                <p className="text-sm text-muted-foreground">Participação em todas as escalas designadas</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">95%</div>
                <div className="text-xs text-muted-foreground">Peso: 40%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Participação em Treinamentos</h3>
                <p className="text-sm text-muted-foreground">Presença em treinamentos obrigatórios</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-600">85%</div>
                <div className="text-xs text-muted-foreground">Peso: 20%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Avaliação de Performance</h3>
                <p className="text-sm text-muted-foreground">Avaliação geral do coordenador</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">92%</div>
                <div className="text-xs text-muted-foreground">Peso: 10%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
