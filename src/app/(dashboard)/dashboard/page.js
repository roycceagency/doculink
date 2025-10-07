// src/app/(dashboard)/page.js
"use client"; // Adicionar "use client" para o onClick

import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Heart, Zap, FileCheck2 } from "lucide-react";

export default function DashboardPage() {
  const userName = "Paulo Santos";

  // Conteúdo para o lado esquerdo do Header
  const headerLeftContent = <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>;

  return (
    <>
      <Header
        leftContent={headerLeftContent}
        actionButtonText="Enviar Documento"
        onActionButtonClick={() => console.log("Botão 'Enviar Documento' do Header clicado!")}
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Olá, {userName}</h2>
            <p className="text-sm text-muted-foreground mt-1">Plano Aderido Em: 12/06/2025 | Básico</p>
          </div>
          <Button className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold rounded-lg">
            Alterar plano
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total de Docs no Ciclo" value="0" icon={Heart} />
          <StatCard title="Aguardando Assinatura" value="0" icon={Zap} />
          <StatCard title="Finalizados" value="1" icon={Zap} />
          <StatCard title="Total de Docs no Ciclo" value="0" icon={Heart}>
             <p className="text-sm text-muted-foreground">Plano Básico</p>
          </StatCard>
          <StatCard title="Documentos Utilizados no Ciclo" value="0" icon={Zap} />
          <StatCard value="0%" icon={FileCheck2} iconClassName="h-10 w-10 text-muted-foreground">
             <p className="text-sm text-muted-foreground font-medium">Utilizados</p>
             <p className="text-xs text-muted-foreground">3 documentos restantes</p>
          </StatCard>
        </div>
      </div>
    </>
  );
}