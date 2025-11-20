// src/components/dashboard/TenantSwitcher.js
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import { 
    ChevronsUpDown, 
    Check, 
    Building2, 
    User,
    PlusCircle
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TenantSwitcher() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [switching, setSwitching] = React.useState(false);
  const [tenants, setTenants] = React.useState([]);
  const [selectedTenant, setSelectedTenant] = React.useState(null);

  // Busca os tenants disponíveis
  React.useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data } = await api.get('/tenants/available');
        setTenants(data);
        
        // Identifica o tenant atual baseado no user.tenantId (que vem do token atual)
        const current = data.find(t => t.id === user?.tenantId);
        setSelectedTenant(current || data[0]); // Fallback para o primeiro se não achar
      } catch (error) {
        console.error("Erro ao carregar organizações:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTenants();
  }, [user]);

  // Lógica de troca de perfil
  const handleSwitch = async (tenant) => {
    if (tenant.id === selectedTenant?.id) {
        setOpen(false);
        return;
    }

    setSwitching(true);
    try {
      // 1. Chama endpoint de troca para gerar novo token
      const { data } = await api.post('/auth/switch-tenant', { targetTenantId: tenant.id });
      
      // 2. Salva novos tokens
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // 3. Força recarregamento total da página.
      // Isso garante que AuthContext, SWR, React Query e estados limpem cache e peguem os dados do novo tenant.
      window.location.reload(); 

    } catch (error) {
      console.error("Erro ao trocar de organização:", error);
      alert("Não foi possível trocar de perfil.");
      setSwitching(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecione uma organização"
          className={cn("w-[200px] justify-between bg-white hover:bg-gray-50 border-gray-200 shadow-sm", switching && "opacity-50 pointer-events-none")}
        >
          <div className="flex items-center gap-2 truncate">
            <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px] bg-slate-900 text-white">
                    {selectedTenant?.name?.substring(0,1).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">
                {switching ? 'Trocando...' : selectedTenant?.name}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Perfil Pessoal
        </DropdownMenuLabel>
        
        {tenants.filter(t => t.isPersonal).map(tenant => (
            <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleSwitch(tenant)}
                className="flex items-center gap-2 p-2 cursor-pointer"
            >
                <div className="flex items-center justify-center h-8 w-8 rounded-md border bg-white">
                    <User className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{tenant.name}</span>
                    <span className="text-[10px] text-muted-foreground">Dono</span>
                </div>
                {selectedTenant?.id === tenant.id && (
                    <Check className="ml-auto h-4 w-4 text-blue-600" />
                )}
            </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Organizações
        </DropdownMenuLabel>
        <DropdownMenuGroup className="max-h-[200px] overflow-y-auto">
            {tenants.filter(t => !t.isPersonal).map((tenant) => (
            <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleSwitch(tenant)}
                className="flex items-center gap-2 p-2 cursor-pointer"
            >
                <div className="flex items-center justify-center h-8 w-8 rounded-md border bg-white">
                    <Building2 className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-medium truncate">{tenant.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                        {tenant.role === 'ADMIN' ? 'Admin' : 'Membro'}
                    </span>
                </div>
                {selectedTenant?.id === tenant.id && (
                    <Check className="ml-auto h-4 w-4 text-blue-600" />
                )}
            </DropdownMenuItem>
            ))}
            {tenants.filter(t => !t.isPersonal).length === 0 && (
                <div className="p-2 text-xs text-center text-muted-foreground">
                    Nenhuma organização encontrada.
                </div>
            )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onSelect={() => window.location.href = '/plano'} className="cursor-pointer text-blue-600">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Criar nova organização</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}