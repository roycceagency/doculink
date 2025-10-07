// src/app/(dashboard)/plan/page.js
"use client";

import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Um componente local para a barra de uso, para manter o código limpo
const UsageBar = ({ label, value }) => (
  <div className="w-full">
    <p className="text-sm text-muted-foreground mb-2">{label}</p>
    <div className="w-full bg-[#1c4ed8] text-white font-semibold text-center rounded-lg py-2">
      {value}
    </div>
  </div>
);

export default function PlanPage() {
  const headerLeftContent = <h1 className="text-xl font-semibold text-gray-800">Meu Plano</h1>;

  return (
    <>
      <Header
        leftContent={headerLeftContent}
        actionButtonText="Enviar Documento"
        onActionButtonClick={() => console.log("Enviar Documento clicado")}
      />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">Planos e Cobrança</h2>
          <Button className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold rounded-lg">
            Meu Plano
          </Button>
        </div>

        <Card className="bg-white shadow-sm rounded-xl border">
          <CardContent className="p-8 space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Plano</h3>
              <p className="text-sm text-muted-foreground mt-2">Plano Aderido Em: 12/06/2025</p>
              <p className="text-sm text-muted-foreground">Consumo Atual: 3</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <UsageBar label="Documentos" value="0/10" />
              <UsageBar label="Usuários" value="1/1" />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}