// src/app/(dashboard)/admin/payments/page.js
"use client";

import React from "react";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, TrendingUp, AlertCircle, CreditCard } from "lucide-react";

// Dados Mockados baseados na imagem fornecida
const payments = [
    { id: 1, user: 'João Silva', plan: 'Pro', value: 'R$ 89.90', status: 'PAID', method: 'Cartão', due: '31/10/2024', paid: '31/10/2024' },
    { id: 2, user: 'Maria Santos', plan: 'Free', value: 'R$ 0.00', status: 'PAID', method: 'Cartão', due: '31/10/2024', paid: '31/10/2024' },
    { id: 3, user: 'Pedro Costa', plan: 'Enterprise', value: 'R$ 499.90', status: 'PAID', method: 'Boleto', due: '04/11/2024', paid: '05/11/2024' },
    { id: 4, user: 'Ana Oliveira', plan: 'Pro', value: 'R$ 89.90', status: 'PENDING', method: 'Boleto', due: '09/11/2024', paid: '-' },
    { id: 5, user: 'Carlos Souza', plan: 'Avançado', value: 'R$ 199.90', status: 'PAID', method: 'Pix', due: '31/10/2024', paid: '31/10/2024' },
];

const PaymentBadge = ({ status }) => {
    const styles = {
        PAID: "bg-green-500 hover:bg-green-600 border-green-600 text-white",
        PENDING: "bg-yellow-500 hover:bg-yellow-600 border-yellow-600 text-white",
    };
    const labels = { PAID: "Pago", PENDING: "Pendente" };
    
    return (
        <Badge className={`border-0 font-bold ${styles[status]}`}>
            {labels[status]}
        </Badge>
    );
};

const SummaryCard = ({ title, value, icon: Icon, colorClass }) => (
    <Card className="shadow-sm">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <h2 className="text-3xl font-bold text-gray-800 mt-2">{value}</h2>
            </div>
            <div className={`p-3 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                <Icon className={`h-8 w-8 ${colorClass}`} />
            </div>
        </CardContent>
    </Card>
);

export default function AdminPaymentsPage() {
  return (
    <>
      <Header leftContent={<h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>} />
      
      <main className="flex-1 p-6 space-y-8 bg-slate-50/50">
        
        {/* 1. Cartões de Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard 
                title="Faturamento Total" 
                value="R$ 789.70" 
                icon={DollarSign} 
                colorClass="text-blue-600" 
            />
            <SummaryCard 
                title="Faturamento Mês" 
                value="R$ 236.91" 
                icon={TrendingUp} 
                colorClass="text-green-600" 
            />
            <SummaryCard 
                title="Inadimplência" 
                value="R$ 89.90" 
                icon={AlertCircle} 
                colorClass="text-red-600" 
            />
            <SummaryCard 
                title="Ticket Médio" 
                value="R$ 197.42" 
                icon={CreditCard} 
                colorClass="text-purple-600" 
            />
        </div>

        {/* 2. Seção de Histórico */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Histórico de Pagamentos</h2>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Buscar por usuário..." 
                        className="pl-10 bg-white border-gray-200" 
                    />
                </div>
                <div className="flex gap-2">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[160px] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Métodos" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Métodos</SelectItem>
                            <SelectItem value="card">Cartão</SelectItem>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="pix">Pix</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tabela */}
            <Card className="border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-semibold">Usuário</TableHead>
                                <TableHead className="font-semibold">Plano</TableHead>
                                <TableHead className="font-semibold">Valor</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Método</TableHead>
                                <TableHead className="font-semibold">Vencimento</TableHead>
                                <TableHead className="font-semibold">Pago em</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium text-gray-900">{payment.user}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                            {payment.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-gray-700">{payment.value}</TableCell>
                                    <TableCell><PaymentBadge status={payment.status} /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            {payment.method === 'Cartão' && <CreditCard className="h-4 w-4" />}
                                            {payment.method === 'Pix' && <span className="font-bold text-xs">PIX</span>}
                                            {payment.method === 'Boleto' && <span className="font-bold text-xs">BOL</span>}
                                            {payment.method}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500">{payment.due}</TableCell>
                                    <TableCell className="text-gray-500">{payment.paid}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}