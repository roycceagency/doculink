// src/components/dashboard/Sidebar.js
"use client"

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, FileText, Folder, PenSquare, User, Settings, HelpCircle,
  ChevronDown, ChevronsUpDown, Signature, LogOut // Adicionar novos ícones
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navLinksPrimary = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { 
    label: "Documentos", 
    icon: FileText,
    sublinks: [
      { href: "/documentos/pendentes", label: "Pendentes" },
      { href: "/documentos/concluidos", label: "Concluídos" },
      { href: "/documentos/todos", label: "Todos" },
      { href: "/documentos/lixeira", label: "Lixeira" },
    ]
  },
  { href: "/pastas", label: "Pastas", icon: Folder },
  { href: "/signatarios", label: "Signatários", icon: PenSquare },
];
const navLinksSecondary = [
  { href: "/plano", label: "Meu Plano", icon: User },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/support", label: "Suporte", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isDocumentsActive = pathname.startsWith('/documentos');
  const [isOpen, setIsOpen] = React.useState(isDocumentsActive);

  React.useEffect(() => { setIsOpen(isDocumentsActive); }, [isDocumentsActive]);

  // <<< CORREÇÃO: Atualizando nome para consistência com a imagem >>>
  const userName = "Paulo Santos";
  const userEmail = "paulo@grupoconteo.com";
  const userAvatar = "https://github.com/shadcn.png"; // Usando avatar genérico

  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-screen bg-[#F7F9FC] border-r">
      <div className="flex-grow flex flex-col p-4 space-y-8">
        <div className="px-2">
          <div className=" inline-block">
            <Image src="/logo.png" alt="Logo Doculink" width={140} height={32} />
          </div>
        </div>
        <nav className="flex-grow flex flex-col space-y-6">
          <div className="space-y-1">
            {navLinksPrimary.map((link) => 
              link.sublinks ? (
                <Collapsible key={link.label} open={isOpen} onOpenChange={setIsOpen}>
                  <CollapsibleTrigger asChild>
                    <Link href="/documentos/pendentes" className="block w-full">
                      <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all hover:bg-gray-200/60", isDocumentsActive ? "text-blue-600" : "text-gray-800")}>
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                        <ChevronDown className={`ml-auto h-5 w-5 text-gray-500 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
                      </div>
                    </Link>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-9 space-y-1 mt-1">
                    {link.sublinks.map(sublink => {
                       const isActive = pathname === sublink.href;
                       return (
                         <Link key={sublink.href} href={sublink.href} className={cn("block py-1.5 text-sm font-medium transition-colors hover:text-gray-900", isActive ? "text-blue-600" : "text-gray-600")}>
                           {sublink.label}
                         </Link>
                       );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-800 text-base font-medium transition-all hover:bg-gray-200/60", pathname === link.href && "text-blue-600")}>
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            )}
          </div>
          <div className="space-y-1">
             {navLinksSecondary.map((link) => (
              <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-800 text-base font-medium transition-all hover:bg-gray-200/60", pathname === link.href && "text-blue-600")}>
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
      
      {/* Seção do Perfil do Usuário */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 text-left">
              <Avatar className="h-10 w-10"><AvatarImage src={userAvatar} alt={userName} /><AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <div className="flex-grow">
                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>

          {/* <<< INÍCIO DA ATUALIZAÇÃO DO DROPDOWN >>> */}
          <DropdownMenuContent className="w-64 mb-2" align="end">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Signature className="mr-2 h-4 w-4" />
              <span>Área de assinatura</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Meu perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Ajuda</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
          {/* <<< FIM DA ATUALIZAÇÃO DO DROPDOWN >>> */}

        </DropdownMenu>
      </div>
    </aside>
  );
}