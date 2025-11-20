// src/app/(dashboard)/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// Importação de Componentes
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { FileClock, FileCheck2, Files, Building2, Crown, AlertCircle } from "lucide-react"; 

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Estados
  const [stats, setStats] = useState({ pending: 0, signed: 0, total: 0 });
  const [currentTenant, setCurrentTenant] = useState(null);
  
  // Loadings separados para não travar a UI toda se um falhar
  const [tenantLoading, setTenantLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Efeito para carregar DADOS DO TENANT (Prioridade)
  useEffect(() => {
    if (user) {
      const fetchTenant = async () => {
        setTenantLoading(true);
        try {
          const timestamp = Date.now();
          console.log("Buscando dados do tenant...");
          const { data } = await api.get(`/tenants/my?_t=${timestamp}`);
          console.log("Dados do Tenant recebidos:", data);
          setCurrentTenant(data);
        } catch (error) {
          console.error("Erro ao carregar tenant:", error);
        } finally {
          setTenantLoading(false);
        }
      };
      fetchTenant();
    }
  }, [user]);

  // Efeito para carregar ESTATÍSTICAS (Secundário)
  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        setStatsLoading(true);
        try {
          const timestamp = Date.now();
          const { data } = await api.get(`/documents/stats?_t=${timestamp}`);
          setStats(data);
        } catch (error) {
          console.error("Erro ao carregar estatísticas:", error);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [user]);

  // Renderização do Skeleton apenas se estiver carregando a autenticação ou o tenant principal
  if (authLoading || (tenantLoading && !currentTenant)) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const userName = user?.name || "Usuário";
  
  // Se currentTenant for null (erro na api), usa fallback
  const tenantName = currentTenant?.name || "Organização Desconhecida";
  
  // Tratamento seguro para o plano
  const planName = currentTenant?.plan?.name 
    ? currentTenant.plan.name 
    : "Plano Gratuito / Não Atribuído";

  const canManagePlan = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  return (
    <>
      <Header
        leftContent={ <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1> }
        actionButtonText="Enviar Documento"
      />

      <main className="flex-1 p-6 space-y-8">
        
        {/* HEADER DO CONTEXTO (Mostra em qual empresa estamos) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-gray-800">Olá, {userName}</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500">
                {/* Badge da Empresa */}
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                    <Building2 className="h-4 w-4 text-gray-700" />
                    <span className="text-sm">
                        Organização: <strong className="text-gray-900">{tenantName}</strong>
                    </span>
                </div>

                {/* Badge do Plano */}
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-xs border px-3 py-1 ${currentTenant?.plan ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {currentTenant?.plan ? <Crown className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        {planName}
                    </Badge>
                </div>
            </div>
          </div>
          
          {canManagePlan && (
            <Button 
                variant="outline"
                onClick={() => router.push('/plano')} 
                className="border-blue-200 text-blue-700 hover:bg-blue-50 h-12 px-6 shadow-sm"
            >
                Gerenciar Plano
            </Button>
          )}
        </div>

        {/* GRID DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <StatCard 
            title="Total de Documentos" 
            icon={Files} 
            iconClassName="h-6 w-6 text-blue-500 bg-blue-50 rounded-md p-1"
          >
             {statsLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
             ) : (
                <>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{stats.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">Nesta organização</p>
                </>
             )}
          </StatCard>
          
          <StatCard 
            title="Aguardando Assinatura" 
            icon={FileClock}
            iconClassName="h-6 w-6 text-orange-500 bg-orange-50 rounded-md p-1"
          >
             {statsLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
             ) : (
                <>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground mt-1">Pendentes de ação</p>
                </>
             )}
          </StatCard>
          
          <StatCard 
            title="Finalizados" 
            icon={FileCheck2}
            iconClassName="h-6 w-6 text-green-500 bg-green-50 rounded-md p-1"
          >
             {statsLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
             ) : (
                <>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{stats.signed}</p>
                    <p className="text-xs text-muted-foreground mt-1">Concluídos com sucesso</p>
                </>
             )}
          </StatCard>

        </div>
      </main>
    </>
  );
}