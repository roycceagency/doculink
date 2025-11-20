"use client";

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, Shield, User, Phone, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Sheet_MemberDetails({ member, open, onOpenChange }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && member) {
      setLoading(true);
      // Simulação de delay de API
      setTimeout(() => {
        setStats({
            docsSent: Math.floor(Math.random() * 50), 
            docsSigned: Math.floor(Math.random() * 20),
        });
        setLoading(false);
      }, 600);
    }
  }, [open, member]);

  if (!member) return null;

  const initials = member.name ? member.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* 
          CSS FIX: 
          - w-full sm:max-w-xl: Aumenta a largura no desktop.
          - overflow-y-auto: Habilita scroll vertical se o conteúdo for grande.
          - p-0: Remove padding padrão para customizarmos melhor.
      */}
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 border-l">
        
        {/* CABEÇALHO COM FUNDO SUAVE */}
        <div className="bg-gray-50/50 border-b p-6">
            <SheetHeader className="flex flex-row items-start gap-5 space-y-0">
                <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                    <AvatarFallback className="text-2xl bg-blue-600 text-white font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-1">
                    <SheetTitle className="text-2xl font-bold text-gray-900">
                        {member.name}
                    </SheetTitle>
                    <SheetDescription className="text-base text-gray-500">
                        {member.email}
                    </SheetDescription>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {member.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                        </span>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            member.status === 'ACTIVE' 
                            ? 'bg-green-50 text-green-700 ring-green-600/20' 
                            : 'bg-red-50 text-red-700 ring-red-600/10'
                        }`}>
                            {member.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </div>
            </SheetHeader>
        </div>

        {/* CORPO DO CONTEÚDO */}
        <div className="p-6">
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 mb-6 gap-6">
                    <TabsTrigger 
                        value="overview" 
                        className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none pb-3 px-1 font-medium text-gray-500 data-[state=active]:text-blue-600"
                    >
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger 
                        value="activity" 
                        className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none pb-3 px-1 font-medium text-gray-500 data-[state=active]:text-blue-600"
                    >
                        Atividade Recente
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in-50">
                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="shadow-sm border-gray-200">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Enviados</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {loading ? <Skeleton className="h-8 w-8" /> : stats?.docsSent}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-gray-200">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                    <Shield className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Assinados</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {loading ? <Skeleton className="h-8 w-8" /> : stats?.docsSigned}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Dados Detalhados */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Informações de Contato & Acesso</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Phone className="h-4 w-4" /> Telefone
                                </div>
                                <span className="font-medium text-gray-900">{member.phoneWhatsE164 || 'Não informado'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Calendar className="h-4 w-4" /> Membro desde
                                </div>
                                <span className="font-medium text-gray-900">
                                    {member.createdAt ? format(new Date(member.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR }) : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock className="h-4 w-4" /> Último acesso
                                </div>
                                <span className="font-medium text-gray-900">
                                    {loading ? <Skeleton className="h-4 w-24" /> : "Hoje, 14:30"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="animate-in fade-in-50">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Timeline de Atividade */}
                            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 py-2">
                                {[1,2,3,4].map((i) => (
                                    <div key={i} className="relative pl-8">
                                        <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-2 border-blue-500"></span>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                                Hoje, {14 + i}:00
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                Enviou o documento <span className="font-semibold">Contrato de Prestação #{i}02</span> para assinatura.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>

      </SheetContent>
    </Sheet>
  );
}