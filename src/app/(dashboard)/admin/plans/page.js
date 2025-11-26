// src/app/(dashboard)/admin/plans/page.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import api from "@/lib/api";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Users, FileText, TrendingUp, DollarSign, Edit } from "lucide-react";

import Modal_EditPlan from './_components/Modal_EditPlan';

// Cores visuais para os gráficos (Mapeado pelo Slug do banco)
const PLAN_COLORS = {
    'basico': '#3b82f6',       // Azul
    'profissional': '#10b981', // Emerald
    'empresa': '#8b5cf6',      // Violeta
    'default': '#94a3b8'       // Slate
};

// Tooltip do Gráfico
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                <p className="font-bold text-gray-800 mb-1">{payload[0].name}</p>
                <div className="space-y-1">
                    <span className="block text-gray-600">
                        Qtd: <strong>{payload[0].value}</strong>
                    </span>
                    {payload[0].payload.revenue !== undefined && (
                        <span className="block text-emerald-600">
                            Receita: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].payload.revenue)}</strong>
                        </span>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

// Componente do Card de Plano
const PlanPricingCard = ({ plan, activeCount, totalRevenue, onClick }) => {
    const color = PLAN_COLORS[plan.slug] || PLAN_COLORS.default;
    
    return (
        <Card 
            className="border shadow-sm relative overflow-hidden hover:shadow-lg transition-all group cursor-pointer ring-offset-2 hover:ring-2 hover:ring-blue-100"
            onClick={() => onClick(plan)}
        >
            <div className="absolute top-0 left-0 w-full h-1.5 transition-all group-hover:h-2" style={{ backgroundColor: color }}></div>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-full shadow-sm border">
                <Edit className="h-4 w-4 text-gray-500" />
            </div>

            <CardHeader className="pb-2 pt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {plan.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground capitalize">{plan.slug}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 border border-gray-100 text-gray-600 flex items-center gap-1`}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCount > 0 ? color : '#ccc' }}></span>
                        {activeCount} Ativos
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-5">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                        {Number(plan.price) > 0 ? `R$ ${plan.price}` : 'Grátis'}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">/mês</span>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                            <TrendingUp className="h-3 w-3" />
                            <span>MRR do Plano</span>
                        </div>
                    </div>
                    <div className="text-lg font-bold text-emerald-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                    </div>
                </div>
                
                <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Limites Configurados</p>
                    
                    <div className="flex items-center justify-between text-sm group-hover:text-gray-900 transition-colors">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>Usuários</span>
                        </div>
                        <strong className="font-semibold">{plan.userLimit}</strong>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm group-hover:text-gray-900 transition-colors">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4 text-orange-500" />
                            <span>Documentos</span>
                        </div>
                        <strong className="font-semibold">{plan.documentLimit}</strong>
                    </div>
                </div>
                
                <div className="pt-2 text-center">
                    <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Clique para editar detalhes
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPlan, setEditingPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Busca Planos REAIS do banco (AGORA GARANTIDOS PELO SEED)
        const plansRes = await api.get('/subscription/plans');
        // 2. Busca Tenants (para calcular estatísticas)
        const tenantsRes = await api.get('/tenants/all');
        
        setPlans(plansRes.data);
        setTenants(tenantsRes.data);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica de Cruzamento de Dados (Planos vindos da API x Tenants)
  const stats = useMemo(() => {
      if (!plans.length) return { chartData: [], revenueData: [], planStats: [] };

      // Mapeia os planos vindos do banco
      const planStats = plans.map(plan => {
          // Conta quantos tenants usam este planoID
          const planTenants = tenants.filter(t => t.planId === plan.id);
          
          // Calcula receita (somente de ativos ou pendentes)
          const revenue = planTenants.reduce((acc, t) => {
              if (t.subscriptionStatus === 'ACTIVE' || t.subscriptionStatus === 'PENDING') {
                  return acc + Number(plan.price);
              }
              return acc;
          }, 0);

          return {
              ...plan, // Passa todos os dados do banco (id, name, userLimit, etc)
              count: planTenants.length,
              revenue
          };
      });

      // Ordena por preço (menor para maior)
      planStats.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

      // Prepara Gráficos
      const chartData = planStats
        .filter(p => p.count > 0)
        .map(p => ({
            name: p.name,
            value: p.count,
            revenue: p.revenue,
            color: PLAN_COLORS[p.slug] || PLAN_COLORS.default
        }));

      const revenueData = planStats
        .filter(p => p.revenue > 0)
        .map(p => ({
            name: p.name.split(' ')[0],
            revenue: p.revenue,
            color: PLAN_COLORS[p.slug] || PLAN_COLORS.default
        }));

      return { planStats, chartData, revenueData };
  }, [plans, tenants]);

  const handleEditClick = (plan) => {
      setEditingPlan(plan);
      setIsModalOpen(true);
  };

  return (
    <>
      <Header leftContent={<h1 className="text-xl font-semibold text-gray-800">Gestão de Planos</h1>} />
      
      <main className="flex-1 p-6 space-y-8 bg-slate-50/50">
        
        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" /> Distribuição de Clientes
                    </CardTitle>
                    <CardDescription>Assinaturas por tipo</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {loading ? <Skeleton className="h-full w-full rounded-full" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={stats.chartData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={100} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500" /> Receita por Plano (MRR)
                    </CardTitle>
                    <CardDescription>Faturamento mensal</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {loading ? <Skeleton className="h-full w-full" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.revenueData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                                <RechartsTooltip 
                                    cursor={{fill: 'transparent'}}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-2 border shadow-lg rounded text-xs">
                                                    <span className="font-bold text-emerald-600">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={30}>
                                    {stats.revenueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* LISTA DE PLANOS (Do Banco de Dados) */}
        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 ml-1">Planos Ativos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-72 w-full rounded-xl" />
                    ))
                ) : (
                    stats.planStats.map((plan) => (
                        <PlanPricingCard 
                            key={plan.id} 
                            plan={plan}
                            activeCount={plan.count}
                            totalRevenue={plan.revenue}
                            onClick={handleEditClick}
                        />
                    ))
                )}
            </div>
        </div>
      </main>

      {/* MODAL DE EDIÇÃO */}
      <Modal_EditPlan 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        plan={editingPlan} 
        onSuccess={fetchData} 
      />
    </>
  );
}