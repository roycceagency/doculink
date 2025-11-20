"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Plus, UserCog, Clock } from "lucide-react";

import Modal_InviteMember from './_components/Modal_InviteMember';
import Sheet_MemberDetails from './_components/Sheet_MemberDetails';

export default function ProfilesPage() {
    const [activeMembers, setActiveMembers] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loading, setLoading] = useState(true);

    // Controles de UI
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Busca Membros Ativos (Endpoint /users que lista usuários do tenant)
            const usersRes = await api.get('/users');
            setActiveMembers(usersRes.data);

            // 2. Busca Convites Pendentes (Endpoint novo)
            const invitesRes = await api.get('/tenants/invites/sent');
            setPendingInvites(invitesRes.data);

        } catch (error) {
            console.error("Erro ao carregar perfis:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewDetails = (member) => {
        setSelectedMember(member);
        setIsDetailsOpen(true);
    };

    const headerLeftContent = (
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Perfis e Equipe</h1>
            <p className="text-sm text-muted-foreground">Gerencie o acesso e permissões da sua organização.</p>
        </div>
    );

    return (
        <>
            <Header leftContent={headerLeftContent} actionButtonText={null} />

            <main className="flex-1 p-6 space-y-6">
                
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Membros da Equipe</h2>
                    <Button onClick={() => setIsInviteModalOpen(true)} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
                        <Plus className="mr-2 h-4 w-4" /> Convidar Novo
                    </Button>
                </div>

                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="bg-white p-1 border h-auto w-fit justify-start gap-2 rounded-lg shadow-sm">
                        <TabsTrigger value="active" className="data-[state=active]:bg-gray-100 data-[state=active]:text-blue-700 px-4 py-2">
                            <UserCog className="h-4 w-4 mr-2" /> Ativos ({activeMembers.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="data-[state=active]:bg-gray-100 data-[state=active]:text-blue-700 px-4 py-2">
                            <Mail className="h-4 w-4 mr-2" /> Convites Pendentes ({pendingInvites.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* ABA: MEMBROS ATIVOS */}
                    <TabsContent value="active" className="mt-6">
                        <Card className="bg-white shadow-sm rounded-xl border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead>Membro</TableHead>
                                        <TableHead>Função</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Entrou em</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell></TableRow>)
                                    ) : activeMembers.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-32 text-muted-foreground">Nenhum membro ativo.</TableCell></TableRow>
                                    ) : (
                                        activeMembers.map((member) => (
                                            <TableRow key={member.id} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleViewDetails(member)}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>{member.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{member.name}</p>
                                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-gray-100 text-gray-700">{member.role}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Ativo
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(member.createdAt).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                                        Gerenciar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* ABA: CONVITES PENDENTES */}
                    <TabsContent value="pending" className="mt-6">
                        <Card className="bg-white shadow-sm rounded-xl border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead>Email Convidado</TableHead>
                                        <TableHead>Função Proposta</TableHead>
                                        <TableHead>Enviado em</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        [1,2].map(i => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell></TableRow>)
                                    ) : pendingInvites.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Nenhum convite pendente.</TableCell></TableRow>
                                    ) : (
                                        pendingInvites.map((invite) => (
                                            <TableRow key={invite.id}>
                                                <TableCell className="font-medium text-gray-900">{invite.email}</TableCell>
                                                <TableCell><Badge variant="outline">{invite.role}</Badge></TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit ml-auto">
                                                        <Clock className="h-3 w-3" />
                                                        <span className="text-xs font-medium">Aguardando Aceite</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>

            </main>

            {/* MODAL DE CONVITE */}
            <Modal_InviteMember 
                open={isInviteModalOpen} 
                onOpenChange={setIsInviteModalOpen} 
                onSuccess={fetchData}
            />

            {/* SHEET DE DETALHES */}
            <Sheet_MemberDetails 
                open={isDetailsOpen} 
                onOpenChange={setIsDetailsOpen} 
                member={selectedMember} 
            />
        </>
    );
}