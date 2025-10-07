// src/app/(dashboard)/folders/page.js
"use client";

import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function FoldersPage() {
  // Conteúdo para o lado esquerdo do Header
  const headerLeftContent = <h1 className="text-xl font-semibold text-gray-800">Pastas</h1>;

  return (
    <>
      <Header
        leftContent={headerLeftContent}
        actionButtonText="Enviar Documento"
        onActionButtonClick={() => console.log("Enviar Documento clicado na página de Pastas")}
      />

      <main className="flex-1 p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Pastas</h2>

        <Card className="bg-white shadow-sm rounded-xl border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Todos</CardTitle>
          </CardHeader>
          <CardContent>
            {/* --- Empty State Container --- */}
            {/* Este container representa a área onde as pastas seriam listadas. */}
            {/* Como não há nenhuma, mostramos um convite para criar uma. */}
            <div className="flex items-center justify-center min-h-[50vh] p-8 border-2 border-dashed rounded-lg bg-gray-50/50">
              <Button className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Pasta
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}