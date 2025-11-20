// src/app/(dashboard)/admin/page.js
"use client";

import React from 'react';
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Package, FileText } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Dados Mockados para os Gráficos
const userGrowthData = [
  { name: 'Jun', users: 15 },
  { name: 'Jul', users: 28 },
  { name: 'Ago', users: 42 },
  { name: 'Set', users: 38 },
  { name: 'Out', users: 55 },
  { name: 'Nov', users: 67 },
];

const docsStatusData = [
  { name: 'Enviado', value: 45 },
  { name: 'Pendente', value: 32 },
  { name: 'Assinado', value: 130 },
  { name: 'Expirado', value: 8 },
  { name: 'Cancelado', value: 3 },
];

// Componente de Card de KPI
const KpiCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-2">{value}</h2>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </CardContent>
  </Card>
);

export default function SuperAdminDashboard() {
  return (
    <>
      <Header leftContent={<h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>} />
      
      <main className="flex-1 p-6 space-y-6 bg-slate-50/50">
        
        {/* 1. KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard title="Total de Usuários" value="263" icon={Users} color="bg-blue-500" />
          <KpiCard title="Receita Recorrente" value="R$ 36.398,20" icon={DollarSign} color="bg-green-500" />
          <KpiCard title="Planos Ativos" value="4" icon={Package} color="bg-purple-500" />
          <KpiCard title="Docs Assinados" value="892" icon={FileText} color="bg-orange-500" />
        </div>

        {/* 2. Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Novos Usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Novos Usuários por Mês</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Documentos por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos por Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={docsStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {docsStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#3b82f6' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 3. Últimos Logs (Simulado conforme imagem) */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Logs de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Usuário</th>
                    <th className="px-6 py-3">Ação</th>
                    <th className="px-6 py-3">Documento</th>
                    <th className="px-6 py-3">IP</th>
                    <th className="px-6 py-3">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { user: 'João Silva', action: 'login', doc: '-', ip: '192.168.1.1', date: '2024-11-19 10:30' },
                    { user: 'Maria Santos', action: 'envio_documento', doc: 'Termo Confidencial', ip: '192.168.1.2', date: '2024-11-19 09:15' },
                    { user: 'Pedro Costa', action: 'assinatura', doc: 'Acordo Parceria', ip: '192.168.1.3', date: '2024-11-19 08:45' },
                  ].map((log, i) => (
                    <tr key={i} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{log.user}</td>
                      <td className="px-6 py-4">{log.action}</td>
                      <td className="px-6 py-4">{log.doc}</td>
                      <td className="px-6 py-4 text-gray-500">{log.ip}</td>
                      <td className="px-6 py-4 text-gray-500">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </main>
    </>
  );
}