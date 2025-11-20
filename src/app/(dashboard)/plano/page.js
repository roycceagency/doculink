// src/app/(dashboard)/plan/page.js
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, Zap } from "lucide-react";

// Dados estáticos dos planos para exibição (Preços e Features)
// O backend controla os limites reais, aqui controlamos a apresentação visual de vendas.
const AVAILABLE_PLANS = [
    {
        name: 'Básico',
        slug: 'basico',
        price: '29,90',
        features: ['Até 20 Documentos', '3 Usuários', 'Suporte via WhatsApp', 'Validade jurídica', 'Armazenamento seguro'],
        highlight: false
    },
    {
        name: 'Profissional',
        slug: 'profissional',
        price: '49,90',
        features: ['Até 50 Documentos', '5 Usuários', 'Templates personalizados', 'API básica', 'Suporte prioritário'],
        highlight: true, // MAIS POPULAR
        tag: 'MAIS POPULAR'
    },
    {
        name: 'Empresa',
        slug: 'empresa',
        price: '79,90',
        features: ['Até 100 Documentos', '10 Usuários', 'API completa', 'Branding completo', 'Suporte dedicado'],
        highlight: false
    }
];

// Componente auxiliar para Barra de Progresso
const UsageBar = ({ label, value, total, unit }) => {
    // Evita divisão por zero
    const limit = total || 1; 
    const percentage = Math.min((value / limit) * 100, 100);
    const isLimitReached = value >= limit;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className={`text-xs font-bold ${isLimitReached ? 'text-red-600' : 'text-gray-500'}`}>
                    {value} / {total === 999999 ? 'Ilimitado' : total} {unit}
                </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${isLimitReached ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isLimitReached && (
                <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Limite atingido. Faça upgrade.
                </p>
            )}
        </div>
    );
};

export default function PlanPage() {
    const { user } = useAuth();
    const [tenantData, setTenantData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenantData = async () => {
            try {
                // Endpoint que retorna dados do tenant + plano + usage
                const { data } = await api.get('/tenants/my');
                setTenantData(data);
            } catch (error) {
                console.error("Erro ao buscar dados do plano:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTenantData();
    }, []);

    const headerLeftContent = <h1 className="text-xl font-semibold text-gray-800">Meu Plano</h1>;

    // Verifica se é admin para mostrar botões de compra
    const canManageBilling = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

    if (loading) {
        return (
            <>
                <Header leftContent={headerLeftContent} actionButtonText="Enviar Documento" />
                <main className="flex-1 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                </main>
            </>
        );
    }

    // Dados seguros com fallback
    const currentSlug = tenantData?.plan?.slug || 'basico';
    const limits = {
        documents: tenantData?.plan?.documentLimit || 20,
        users: tenantData?.plan?.userLimit || 3
    };
    const usage = {
        documents: tenantData?.usage?.documents || 0,
        users: tenantData?.usage?.users || 0
    };

    return (
        <>
            <Header leftContent={headerLeftContent} actionButtonText="Enviar Documento" />

            <main className="flex-1 p-6 space-y-8">
                
                {/* SEÇÃO DE USO ATUAL */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-white shadow-sm border-l-4 border-l-blue-600 lg:col-span-3">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-800">
                                        Plano Atual: {tenantData?.plan?.name || 'Básico'}
                                    </CardTitle>
                                    <CardDescription>
                                        Renovação mensal. Gerencie seus limites abaixo.
                                    </CardDescription>
                                </div>
                                {canManageBilling && (
                                    <Button variant="outline" className="hidden sm:flex">
                                        Histórico de Faturas
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <UsageBar 
                                    label="Documentos Enviados" 
                                    value={usage.documents} 
                                    total={limits.documents} 
                                    unit="docs"
                                />
                                <UsageBar 
                                    label="Usuários da Equipe" 
                                    value={usage.users} 
                                    total={limits.users} 
                                    unit="usuários"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SEÇÃO DE PLANOS DISPONÍVEIS */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Planos Disponíveis</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AVAILABLE_PLANS.map((plan) => {
                            const isCurrent = plan.slug === currentSlug;
                            
                            return (
                                <Card 
                                    key={plan.slug} 
                                    className={`relative flex flex-col ${
                                        isCurrent 
                                        ? 'border-blue-500 ring-1 ring-blue-500 shadow-md bg-blue-50/30' 
                                        : (plan.highlight ? 'border-purple-200 shadow-md' : 'border-gray-200 shadow-sm')
                                    }`}
                                >
                                    {plan.tag && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
                                            {plan.tag}
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-xl text-gray-900">{plan.name}</CardTitle>
                                            {isCurrent && <Badge className="bg-blue-600">Atual</Badge>}
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-3xl font-bold text-gray-900">R$ {plan.price}</span>
                                            <span className="text-gray-500 text-sm">/mês</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${isCurrent ? 'text-blue-600' : 'text-green-600'}`} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        {isCurrent ? (
                                            <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed">
                                                Plano Ativo
                                            </Button>
                                        ) : (
                                            <Button 
                                                disabled={!canManageBilling}
                                                className={`w-full font-semibold ${
                                                    plan.highlight 
                                                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                                    : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
                                                }`}
                                                onClick={() => alert("Integração com ASAAS será implementada em breve!")}
                                            >
                                                {canManageBilling ? (
                                                    <span className="flex items-center gap-2">
                                                        {plan.slug === 'empresa' ? 'Falar com Vendas' : 'Fazer Upgrade'} <Zap className="h-4 w-4" />
                                                    </span>
                                                ) : (
                                                    "Contate o Admin"
                                                )}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}