// src/app/(dashboard)/admin/plans/page.js
"use client";

import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const planData = [
  { name: 'Free', value: 17, color: '#3b82f6' },
  { name: 'Pro', value: 49, color: '#22c55e' },
  { name: 'Avançado', value: 25, color: '#a855f7' },
  { name: 'Enterprise', value: 9, color: '#facc15' },
];

const PlanPricingCard = ({ title, subtitle, price, users, docs, revenue, color }) => (
    <Card className="border shadow-sm relative overflow-hidden">
        <div className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold text-white rounded ${color}`}>Ativo</div>
        <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <span className="text-3xl font-bold text-blue-600">{price}</span>
                <span className="text-gray-500">/mês</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                <div className="flex justify-between"><span>Usuários Ativos:</span> <strong>{users}</strong></div>
                <div className="flex justify-between"><span>Docs/mês:</span> <strong>{docs}</strong></div>
                <div className="flex justify-between text-green-600 font-bold"><span>Receita:</span> <strong>{revenue}</strong></div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full ${color}`} style={{ width: '40%' }}></div>
            </div>
        </CardContent>
    </Card>
);

export default function AdminPlansPage() {
  return (
    <>
      <Header leftContent={<h1 className="text-2xl font-bold text-gray-800">Gestão de Planos</h1>} />
      
      <main className="flex-1 p-6 space-y-8 bg-slate-50/50">
        
        {/* Gráfico de Distribuição */}
        <Card>
            <CardHeader><CardTitle>Distribuição de Assinaturas</CardTitle></CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={planData} 
                            cx="50%" cy="50%" 
                            innerRadius={60} outerRadius={100} 
                            paddingAngle={5} 
                            dataKey="value"
                        >
                            {planData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Lista de Planos Detalhada */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlanPricingCard title="Free" subtitle="Plano gratuito" price="Grátis" users="45" docs="5" revenue="R$ 0.00" color="bg-blue-500" />
            <PlanPricingCard title="Pro" subtitle="Pequenas empresas" price="R$ 89.90" users="128" docs="50" revenue="R$ 11.507,20" color="bg-green-500" />
            <PlanPricingCard title="Avançado" subtitle="Recursos extras" price="R$ 199.90" users="67" docs="150" revenue="R$ 13.393,30" color="bg-purple-500" />
            <PlanPricingCard title="Enterprise" subtitle="Grandes volumes" price="R$ 499.90" users="23" docs="999" revenue="R$ 11.497,70" color="bg-yellow-500" />
        </div>
      </main>
    </>
  );
}