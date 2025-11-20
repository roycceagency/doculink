// src/components/dashboard/Header.js
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import MobileSidebar from "./MobileSidebar";
import TenantSwitcher from "./TenantSwitcher";
import { useAuth } from "@/context/AuthContext"; // <--- Importação do Contexto

export default function Header({ leftContent, actionButtonText }) {
  const router = useRouter();
  const { user } = useAuth(); // <--- Pegar dados do usuário

  // Verifica se o usuário tem permissão para ações de escrita (Enviar/Criar)
  // VIEWER não entra nessa lista.
  const canSend = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user?.role);

  const handleActionButtonClick = () => {
    if (actionButtonText === "Enviar Documento") {
      router.push('/send');
    }
  };

  return (
    <header className="flex h-[68px] items-center justify-between bg-white px-4 sm:px-6 border-b shrink-0 z-20 relative">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <div>
          {leftContent}
        </div>
      </div>
      
      {/* Área Direita do Header */}
      <div className="flex items-center gap-3">
        
        {/* SWITCH DE PERFIL (Sempre visível para poder trocar de empresa) */}
        <div className="hidden md:block">
            <TenantSwitcher />
        </div>

        {/* BOTÃO DE AÇÃO (Escondido se for apenas VIEWER) */}
        {actionButtonText && canSend && (
          <Button
            onClick={handleActionButtonClick}
            className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold rounded-lg shadow-sm"
          >
            {actionButtonText}
          </Button>
        )}
      </div>
    </header>
  );
}