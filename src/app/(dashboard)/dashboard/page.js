// src/app/(dashboard)/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importação de Componentes
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
    FileClock, 
    FileCheck2, 
    Files, 
    Building2, 
    Crown, 
    AlertCircle, 
    HardDrive,
    FileText,
    ExternalLink
} from "lucide-react"; 

// Mapeamento de status para cores (igual ao da lista de docs)
const getStatusColor = (status) => {
    const map = {
        SIGNED: "text-green-700 bg-green-50 border-green-200",
        READY: "text-orange-700 bg-orange-50 border-orange-200",
        PARTIALLY_SIGNED: "text-blue-700 bg-blue-50 border-blue-200",
        CANCELLED: "text-red-700 bg-red-50 border-red-200",
        DRAFT: "text-gray-700 bg-gray-100 border-gray-200",
    };
    return map[status] || "text-gray-700 bg-gray-50 border-gray-200";
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Estados
  const [dashboardData, setDashboardData] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  
  // Loadings
  const [tenantLoading, setTenantLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // 1. Carregar DADOS DO TENANT
  useEffect(() => {
    if (user) {
      const fetchTenant = async () => {
        setTenantLoading(true);
        try {
          const { data } = await api.get(`/tenants/my`);
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

  // 2. Carregar ESTATÍSTICAS (Nova estrutura)
  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        setStatsLoading(true);
        try {
          // O endpoint agora retorna { counts, storage, recents }
          const { data } = await api.get(`/documents/stats`);
          setDashboardData(data);
        } catch (error) {
          console.error("Erro ao carregar estatísticas:", error);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [user]);

  // Helpers para extrair dados seguros
  const counts = dashboardData?.counts || { pending: 0, signed: 0, total: 0, draft: 0, expired: 0 };
  const storage = dashboardData?.storage || { usedMB: 0 };
  const recents = dashboardData?.recents || [];

  // Renderização do Skeleton
  if (authLoading || (tenantLoading && !currentTenant)) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl mt-6" />
      </div>
    );
  }

  const userName = user?.name || "Usuário";
  const tenantName = currentTenant?.name || "Organização";
  const planName = currentTenant?.plan?.name || "Plano Gratuito";
  const canManagePlan = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  return (
    <>
      <Header
        leftContent={ <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1> }
        actionButtonText="Enviar Documento"
      />

      <main className="flex-1 p-6 space-y-8">
        
        {/* HEADER DO CONTEXTO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-gray-800">Olá, {userName}</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                    <Building2 className="h-4 w-4 text-gray-700" />
                    <span className="text-sm">
                        Organização: <strong className="text-gray-900">{tenantName}</strong>
                    </span>
                </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <StatCard 
            title="Total de Documentos" 
            icon={Files} 
            iconClassName="h-6 w-6 text-blue-500 bg-blue-50 rounded-md p-1"
          >
             {statsLoading ? <Skeleton className="h-8 w-16 mt-2" /> : (
                <p className="text-4xl font-bold text-gray-800 mt-2">{counts.total}</p>
             )}
          </StatCard>
          
          <StatCard 
            title="Aguardando Assinatura" 
            icon={FileClock}
            iconClassName="h-6 w-6 text-orange-500 bg-orange-50 rounded-md p-1"
          >
             {statsLoading ? <Skeleton className="h-8 w-16 mt-2" /> : (
                <p className="text-4xl font-bold text-gray-800 mt-2">{counts.pending}</p>
             )}
          </StatCard>
          
          <StatCard 
            title="Finalizados" 
            icon={FileCheck2}
            iconClassName="h-6 w-6 text-green-500 bg-green-50 rounded-md p-1"
          >
             {statsLoading ? <Skeleton className="h-8 w-16 mt-2" /> : (
                <p className="text-4xl font-bold text-gray-800 mt-2">{counts.signed}</p>
             )}
          </StatCard>

          <StatCard 
            title="Armazenamento" 
            icon={HardDrive}
            iconClassName="h-6 w-6 text-purple-500 bg-purple-50 rounded-md p-1"
          >
             {statsLoading ? <Skeleton className="h-8 w-16 mt-2" /> : (
                <>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{storage.usedMB}</p>
                    <p className="text-xs text-muted-foreground mt-1">MB utilizados</p>
                </>
             )}
          </StatCard>

        </div>

        {/* TABELA DE DOCUMENTOS RECENTES */}
        <Card className="border shadow-sm">
            <CardHeader className="border-b bg-gray-50/30">
                <CardTitle className="text-lg font-semibold text-gray-800">Documentos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {statsLoading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : recents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        Nenhum documento recente.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Documento</th>
                                    <th className="px-6 py-3 font-medium">Criador</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Atualizado em</th>
                                    <th className="px-6 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recents.map((doc) => (
                                    <tr key={doc.id} className="bg-white border-b hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <span className="truncate max-w-[200px]" title={doc.title}>{doc.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {doc.owner?.name || 'Sistema'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={getStatusColor(doc.status)}>
                                                {doc.status === 'READY' ? 'Pendente' : 
                                                 doc.status === 'SIGNED' ? 'Concluído' : doc.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {format(new Date(doc.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0"
                                                onClick={() => window.open(`/documentos/todos`, '_self')} // Redireciona para a lista completa
                                            >
                                                <ExternalLink className="h-4 w-4 text-blue-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>

      </main>
    </>
  );
}