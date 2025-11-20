// src/components/dashboard/Navigation.js
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api"; 
import {
  LayoutGrid, FileText, Folder, PenSquare, User, Settings, 
  HelpCircle, ChevronDown, Shield, Users, Building, CreditCard
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge"; 

const navLinksPrimary = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { 
    label: "Documentos", 
    icon: FileText,
    basePath: "/documentos",
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

const navLinksTenantAdmin = [
  { href: "/profiles", label: "Equipe & Perfis", icon: Users, hasBadge: true },
];

const navLinksSuperAdmin = [
  { href: "/admin/tenants", label: "Todas Empresas", icon: Building },
  { href: "/admin/plans", label: "Gerenciar Planos", icon: CreditCard },
  { href: "/admin/audit", label: "Auditoria Global", icon: Shield },
    { href: "/admin/settings", label: "Integrações & API", icon: Settings },

];

const navLinksSecondary = [
  { href: "/plano", label: "Meu Plano", icon: User },
  { href: "/configuracoes", label: "Minha Conta", icon: Settings },
  { href: "https://wa.me/5511987798662", label: "Suporte", icon: HelpCircle, isExternal: true },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isDocumentsActive = pathname.startsWith('/documentos');
  const [isDocumentsOpen, setIsDocumentsOpen] = React.useState(isDocumentsActive);
  const [pendingInvitesCount, setPendingInvitesCount] = React.useState(0);

  React.useEffect(() => {
    if (isDocumentsActive) setIsDocumentsOpen(true);
  }, [isDocumentsActive]);

  React.useEffect(() => {
    if (['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) {
      api.get('/tenants/invites/sent')
        .then(res => {
          const count = res.data.filter(i => i.status === 'PENDING' || !i.status).length;
          setPendingInvitesCount(count);
        })
        .catch(err => console.error("Falha ao buscar notificações nav:", err));
    }
  }, [user]);

  return (
    <nav className="flex-grow flex flex-col space-y-6 overflow-y-auto">
      
      {/* SEÇÃO 1: OPERACIONAL */}
      <div className="space-y-1">
        {navLinksPrimary.map((link) => 
          link.sublinks ? (
            <Collapsible key={link.label} open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
              <CollapsibleTrigger asChild>
                <div className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all hover:bg-gray-200/60 cursor-pointer select-none", 
                  isDocumentsActive ? "text-blue-600" : "text-gray-800"
                )}>
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                  <ChevronDown className={`ml-auto h-5 w-5 text-gray-500 transition-transform ${isDocumentsOpen ? "rotate-0" : "-rotate-90"}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-9 space-y-1 mt-1">
                {link.sublinks.map(sublink => {
                   const isActive = pathname === sublink.href;
                   return (
                     <Link key={sublink.href} href={sublink.href} className={cn(
                       "block py-1.5 text-sm font-medium transition-colors hover:text-gray-900", 
                       isActive ? "text-blue-600 font-bold" : "text-gray-600"
                     )}>
                       {sublink.label}
                     </Link>
                   );
                })}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-800 text-base font-medium transition-all hover:bg-gray-200/60", 
              pathname === link.href && "text-blue-600"
            )}>
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          )
        )}
      </div>

      {/* SEÇÃO 2: ADMINISTRAÇÃO DA EMPRESA */}
      {['ADMIN', 'SUPER_ADMIN'].includes(user?.role) && (
        <div className="space-y-1 pt-2 border-t border-gray-200">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {user?.role === 'SUPER_ADMIN' ? 'Gestão Local' : 'Minha Organização'}
          </p>
          {navLinksTenantAdmin.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-800 text-base font-medium transition-all hover:bg-gray-200/60 justify-between", 
              pathname.startsWith(link.href) && "text-blue-600"
            )}>
              <div className="flex items-center gap-3">
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </div>
              {link.hasBadge && pendingInvitesCount > 0 && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white h-5 px-1.5 text-[10px] rounded-full">
                  {pendingInvitesCount}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* SEÇÃO 3: SUPER ADMIN */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="space-y-1 pt-2 border-t border-gray-200 bg-slate-50 -mx-2 px-2 py-2 rounded-md mt-2">
          <p className="px-3 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Super Admin (Global)
          </p>
          {navLinksSuperAdmin.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-800 text-base font-medium transition-all hover:bg-indigo-100", 
              pathname.startsWith(link.href) && "text-indigo-700 font-semibold"
            )}>
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* SEÇÃO 4: SECUNDÁRIOS */}
      <div className="space-y-1 pt-2 border-t border-gray-200">
         {navLinksSecondary.map((link) => {
            // --- NOVA LÓGICA: Esconder "Meu Plano" para Viewer ---
            if (link.href === '/plano' && user?.role === 'VIEWER') {
                return null;
            }

            return (
                <Link 
                    key={link.href} 
                    href={link.href}
                    target={link.isExternal ? "_blank" : undefined}
                    className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-800 text-base font-medium transition-all hover:bg-gray-200/60", 
                    pathname === link.href && "text-blue-600"
                    )}>
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                </Link>
            );
        })}
      </div>
    </nav>
  );
}