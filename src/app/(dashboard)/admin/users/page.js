// src/app/(dashboard)/admin/users/page.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api'; 
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Plus, Pencil, Trash2, UserCheck, Ban } from "lucide-react";

import Modal_UserForm from './_components/Modal_UserForm';

// Componente visual para Status
const StatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: "bg-green-100 text-green-700 border-green-200",
        INACTIVE: "bg-gray-100 text-gray-700 border-gray-200",
        BLOCKED: "bg-red-100 text-red-700 border-red-200",
    };
    const labels = { ACTIVE: "Ativo", INACTIVE: "Inativo", BLOCKED: "Bloqueado" };
    return <Badge variant="outline" className={styles[status] || styles.INACTIVE}>{labels[status] || status}</Badge>;
};

// --- NOVO: Componente visual para Função (Role) ---
const RoleBadge = ({ role }) => {
    if (role === 'SUPER_ADMIN') {
        return (
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-sm">
                Super Admin
            </Badge>
        );
    }
    if (role === 'ADMIN') {
        return (
            <Badge className="bg-gray-800 hover:bg-gray-900 text-white border-none">
                Admin
            </Badge>
        );
    }
    // Fallback para usuários comuns
    return <span className="text-sm text-gray-600 font-medium">Usuário</span>;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Controle do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // --- 1. BUSCAR USUÁRIOS (READ) ---
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            alert("Não foi possível carregar a lista de usuários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filtragem local
    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.name.toLowerCase().includes(search.toLowerCase()) || 
            u.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    // --- 2. CRIAR OU EDITAR USUÁRIO ---
    const handleSaveUser = async (formData) => {
        if (editingUser) {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            await api.patch(`/users/${editingUser.id}`, payload);
            fetchUsers(); 
        } else {
            await api.post('/users', formData);
            fetchUsers();
        }
    };

    // --- 3. EXCLUIR USUÁRIO ---
    const handleDeleteUser = async (id) => {
        if (confirm("Tem certeza que deseja remover este usuário permanentemente?")) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                alert(error.response?.data?.message || "Erro ao excluir usuário.");
            }
        }
    };

    // --- 4. BLOQUEAR/DESBLOQUEAR ---
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        try {
            await api.patch(`/users/${user.id}`, { status: newStatus });
            setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        } catch (error) {
            alert("Erro ao alterar status.");
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const headerLeftContent = (
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h1>
            <p className="text-sm text-muted-foreground">Controle de acesso e equipe</p>
        </div>
    );

    return (
        <>
            <Header 
                leftContent={headerLeftContent} 
                actionButtonText={null} 
            />

            <main className="flex-1 p-6 space-y-6">
                {/* Toolbar Superior */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por nome ou email..." 
                            className="pl-8 bg-white" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={openCreateModal} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Usuário
                    </Button>
                </div>

                {/* Tabela de Usuários */}
                <Card className="bg-white shadow-sm rounded-xl border">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome / Email</TableHead>
                                    <TableHead>Empresa (Tenant)</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead>Celular</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            Nenhum usuário encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            
                                            {/* Coluna da Empresa (útil para Super Admin ver de onde é o usuário) */}
                                            <TableCell className="text-sm text-gray-600">
                                                {user.ownTenant?.name || '-'}
                                            </TableCell>

                                            <TableCell>
                                                {/* Usando o novo componente RoleBadge */}
                                                <RoleBadge role={user.role} />
                                            </TableCell>
                                            
                                            <TableCell className="text-sm text-gray-600">
                                                {user.phoneWhatsE164 || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={user.status} />
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {user.createdAt && format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                                            {user.status === 'ACTIVE' ? (
                                                                <>
                                                                    <Ban className="mr-2 h-4 w-4 text-orange-600" /> 
                                                                    <span className="text-orange-600">Bloquear</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="mr-2 h-4 w-4 text-green-600" /> 
                                                                    <span className="text-green-600">Ativar</span>
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4 bg-gray-50/50 rounded-b-xl">
                        <div className="text-sm text-muted-foreground">
                            Total de {filteredUsers.length} registros
                        </div>
                    </CardFooter>
                </Card>
            </main>

            <Modal_UserForm 
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSaveUser}
                existingUser={editingUser}
            />
        </>
    );
}