// src/app/onboarding/page.js
"use client"

import Link from "next/link";
import Image from "next/image";
// Ícones corrigidos para corresponder ao design
import { Signature, FileTextIcon } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
  const userName = "Paulo Santos";

  return (
    <Card className="w-full max-w-lg bg-white shadow-lg rounded-xl border-none p-8">
      <CardHeader className="p-0">
        <CardTitle className="text-3xl font-bold text-[#151928]">
          Olá {userName}
        </CardTitle>
        <CardDescription className="text-base pt-1">
          O que deseja fazer hoje?
        </CardDescription>
      </CardHeader>

      {/* <<< INÍCIO DA CORREÇÃO ESTRUTURAL >>> */}
      <CardContent className="p-0 mt-8 space-y-4">
        {/* Bloco 1: Ir para a Página Principal - Agora um card clicável */}
        <Link href="/dashboard" className="block w-full text-left">
          <div className="flex w-full items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <Signature className="size-5 text-muted-foreground" />
            <span className="font-medium text-[#151928]">
              Ir para a Página Principal
            </span>
          </div>
        </Link>

        {/* Bloco 2: Enviar Documentos - Agora um único card clicável com conteúdo aninhado */}
        <Link href="/send-documents" className="block w-full text-left">
          <div className="flex w-full flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <FileTextIcon className="size-5 text-muted-foreground" />
              <span className="font-medium text-[#151928]">
                Enviar documentos para assinatura
              </span>
            </div>
            
            {/* Conteúdo alinhado com o texto, não com o ícone */}
            <div className=" space-y-4">
              <p className="text-sm text-muted-foreground leading-snug">
                Acesse a área de envio para enviar documentos para assinatura.
              </p>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#151928]">Firmar como:</p>
                {/* Caixa interna com fundo sutil, como no design */}
                <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/50 p-6">
                  <Image
                    src="/logo.png"
                    alt="Logo Doculink"
                    width={160}
                    height={40}
                    className="object-contain"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full bg-white border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700"
                    onClick={(e) => e.preventDefault()} // Evita que o clique no botão ative o link do card
                  >
                    {userName}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
      {/* <<< FIM DA CORREÇÃO ESTRUTURAL >>> */}
    </Card>
  );
}