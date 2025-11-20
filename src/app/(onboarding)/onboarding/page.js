// src/app/onboarding/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import api from "@/lib/api";

import { Signature, FileTextIcon, ChevronDown, Building, Check, Lock } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import Modal_PendingInvites from "./_components/Modal_PendingInvites";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Estado para os tenants disponíveis (Meus + Convidados)
  const [availableTenants, setAvailableTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  
  // Estado para controlar feedback de troca de tenant
  const [switching, setSwitching] = useState(false);

  // Função para buscar tenants
  const fetchTenants = async () => {
    setTenantsLoading(true);
    try {
      const { data } = await api.get('/tenants/available');
      setAvailableTenants(data);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    } finally {
      setTenantsLoading(false);
    }
  };

  // Carrega tenants ao iniciar
  useEffect(() => {
    if (user) fetchTenants();
  }, [user]);

  // Função para trocar de tenant e navegar
  const handleSwitchAndGo = async (tenantId) => {
    setSwitching(true);
    try {
      const { data } = await api.post('/auth/switch-tenant', { targetTenantId: tenantId });
      
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Força reload para garantir contexto limpo
      window.location.href = '/send'; 

    } catch (error) {
      console.error("Erro ao trocar de perfil:", error);
      alert("Falha ao trocar de perfil. Tente novamente.");
      setSwitching(false);
    }
  };

  if (authLoading) {
    return (
      <Card className="w-full max-w-lg bg-white shadow-lg rounded-xl border-none p-8">
        <CardHeader className="p-0"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
        <CardContent className="p-0 mt-8 space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-64 w-full" /></CardContent>
      </Card>
    );
  }

  const userName = user?.name || "Usuário";
  const currentTenant = availableTenants.find(t => t.id === user?.tenantId);
  const currentTenantName = currentTenant ? currentTenant.name : "Perfil Pessoal";

  // --- VALIDAÇÃO DE PERMISSÃO ---
  // Verifica se o usuário pode enviar documentos no perfil ATUAL
  const canSend = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user?.role);

  return (
    <>
      <Modal_PendingInvites onInvitesHandled={fetchTenants} />

      <Card className="w-full max-w-lg bg-white shadow-lg rounded-xl border-none p-8">
        <CardHeader className="p-0">
          <CardTitle className="text-3xl font-bold text-[#151928]">
            Olá, {userName}
          </CardTitle>
          <CardDescription className="text-base pt-1">
            O que deseja fazer hoje?
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 mt-8 space-y-4">
          
          {/* Bloco 1: Ir para a Página Principal */}
          <Link href="/dashboard" className="block w-full text-left group">
            <div className="flex w-full items-center gap-4 rounded-lg border p-4 transition-all hover:bg-blue-50 hover:border-blue-200">
              <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                <Signature className="size-5 text-gray-600 group-hover:text-blue-700" />
              </div>
              <span className="font-medium text-[#151928]">Ir para a Página Principal</span>
            </div>
          </Link>

          {/* Bloco 2: Enviar Documentos (Com Dropdown e Validação de Viewer) */}
          <div className="flex w-full flex-col gap-3 rounded-lg border p-4 bg-white">
            
            {/* 
               Link condicional para a área de envio 
               Se for VIEWER, o clique é desabilitado e o estilo muda
            */}
            <div 
                className={cn(
                    "flex items-center justify-between rounded-lg p-2 transition-all",
                    canSend 
                        ? "cursor-pointer hover:bg-gray-50" 
                        : "opacity-60 cursor-not-allowed bg-gray-50"
                )}
                onClick={() => canSend && router.push('/send')}
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-full">
                    {canSend ? <FileTextIcon className="size-5 text-gray-600" /> : <Lock className="size-5 text-gray-400" />}
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-[#151928]">Enviar documentos</span>
                    {!canSend && <span className="text-xs text-red-500 font-medium">Acesso apenas leitura neste perfil</span>}
                </div>
              </div>
            </div>
            
            <div className="pl-[52px] space-y-4">
              <p className="text-sm text-muted-foreground leading-snug">
                Selecione abaixo qual perfil deseja usar para assinar ou enviar:
              </p>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Perfil Atual:</p>
                
                <div className="flex flex-col items-center gap-4 rounded-lg border bg-gray-50/50 p-6">
                  <Image src="/logo.png" alt="Logo Doculink" width={140} height={35} className="object-contain opacity-80" />
                  
                  {/* DROPDOWN DE PERFIS (Sempre ativo para permitir troca) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" 
                            disabled={tenantsLoading || switching}
                            className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 justify-between h-11"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Building className="h-4 w-4" />
                                <span className="truncate max-w-[200px]">{switching ? 'Trocando...' : currentTenantName}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px]" align="center">
                        <DropdownMenuLabel>Meus Perfis</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {availableTenants.map((tenant) => (
                            <DropdownMenuItem 
                                key={tenant.id} 
                                onClick={() => handleSwitchAndGo(tenant.id)}
                                className="flex items-center justify-between py-3 cursor-pointer"
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium">{tenant.name}</span>
                                    <span className="text-xs text-gray-500">
                                        {tenant.isPersonal ? 'Conta Pessoal (Dono)' : (
                                            tenant.role === 'ADMIN' ? 'Admin' : 
                                            tenant.role === 'MANAGER' ? 'Gerente' : 'Visualizador'
                                        )}
                                    </span>
                                </div>
                                {tenant.id === user?.tenantId && <Check className="h-4 w-4 text-blue-600" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </>
  );
}