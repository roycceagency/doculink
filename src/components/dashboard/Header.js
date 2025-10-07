// src/components/dashboard/Header.js
"use client";

import { Button } from "@/components/ui/button";

export default function Header({ leftContent, actionButtonText, onActionButtonClick }) {
  return (
    <header className="flex h-[68px] items-center justify-between bg-white px-6 border-b">
      {/* Conteúdo da Esquerda (Título ou Breadcrumbs) */}
      <div>
        {leftContent}
      </div>

      {/* Conteúdo da Direita (Botão de Ação, renderizado condicionalmente) */}
      <div>
        {actionButtonText && (
          <Button
            onClick={onActionButtonClick}
            className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold rounded-lg"
          >
            {actionButtonText}
          </Button>
        )}
      </div>
    </header>
  );
}