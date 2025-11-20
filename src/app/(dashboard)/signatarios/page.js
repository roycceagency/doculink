// src/app/(dashboard)/signatories/page.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { useAuth } from "@/context/AuthContext"; // Import para verificação de Role

// Importação dos componentes de UI
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Star, Trash2, Eye } from "lucide-react";

// Importa o modal reutilizável de formulário de contato
import Modal_ContactForm from '@/app/send/_components/Modal_ContactForm'; 

/**
 * Página para gerenciamento de Contatos (Signatários salvos).
 */
export default function SignatoriesPage() {
    const { user } = useAuth();

    // --- PERMISSÕES ---
    // ADMIN, SUPER_ADMIN e MANAGER podem criar/editar contatos.
    // VIEWER apenas visualiza.
    const canManage = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user?.role);

    // Estado para controlar a aba ativa (todos, favoritos, inativos)
    const [activeTab, setActiveTab] = useState('todos');
    // Estado para armazenar a lista completa de contatos vinda da API
    const [allContacts, setAllContacts] = useState([]);
    // Estado para controlar a exibição do skeleton de carregamento
    const [loading, setLoading] = useState(true);
    // Estado para busca local
    const [search, setSearch] = useState("");
    
    // Estado para gerenciar os IDs dos contatos selecionados na tabela
    const [selectedContacts, setSelectedContacts] = useState([]);
    
    // Estado para controlar o modal de criação/edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null); // Guarda o contato em edição

    /**
     * Função centralizada para buscar/recarregar a lista de contatos da API.
     */
    const fetchContacts = async () => {
        // Mostra o skeleton de carregamento apenas na primeira busca se a lista estiver vazia
        if (allContacts.length === 0) setLoading(true); 
        try {
            const { data } = await api.get('/contacts');
            setAllContacts(data);
        } catch (error) {
            console.error("Erro ao buscar contatos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Busca os contatos quando o componente é montado pela primeira vez
    useEffect(() => {
        if (user) {
            fetchContacts();
        }
    }, [user]);

    // `useMemo` recalcula a lista de contatos a ser exibida sempre que a aba, a busca ou a lista principal mudam.
    const filteredContacts = useMemo(() => {
        if (!allContacts) return [];
        
        let filtered = allContacts;

        // 1. Filtro por Aba
        switch(activeTab) {
            case 'favoritos':
                filtered = filtered.filter(c => c.isFavorite && c.status === 'ACTIVE');
                break;
            case 'inativos':
                filtered = filtered.filter(c => c.status === 'INACTIVE');
                break;
            case 'todos':
            default:
                filtered = filtered.filter(c => c.status === 'ACTIVE');
                break;
        }

        // 2. Filtro por Busca (Nome ou Email)
        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(lowerSearch) || 
                c.email.toLowerCase().includes(lowerSearch)
            );
        }

        return filtered;
    }, [activeTab, allContacts, search]);

    // --- Funções de Ação ---

    /**
     * Alterna o status de favorito de um contato.
     */
    const handleToggleFavorite = async (contact) => {
        if (!canManage) return;
        try {
            const updatedContact = await api.patch(`/contacts/${contact.id}`, { isFavorite: !contact.isFavorite });
            // Atualiza o estado local instantaneamente para feedback rápido na UI
            setAllContacts(prev => prev.map(c => c.id === contact.id ? updatedContact.data : c));
        } catch (error) { 
            console.error("Erro ao favoritar:", error); 
            alert("Não foi possível atualizar o favorito.");
        }
    };

    /**
     * Inativa os contatos selecionados em massa.
     */
    const handleInactivate = async () => {
        if (!canManage) return;
        if (selectedContacts.length === 0) return;

        if (confirm(`Tem certeza que deseja inativar ${selectedContacts.length} signatário(s)? Esta ação pode ser revertida na aba "Inativos".`)) {
            try {
                await api.post('/contacts/inactivate-bulk', { contactIds: selectedContacts });
                fetchContacts(); // Recarrega a lista da API
                setSelectedContacts([]); // Limpa a seleção
            } catch (error) {
                console.error("Erro ao inativar contatos:", error);
                alert("Ocorreu um erro ao inativar os contatos selecionados.");
            }
        }
    };

    /**
     * Lida com o salvamento (criação ou edição) de um contato no modal.
     */
    const handleSaveContact = async (formData) => {
        if (editingContact) {
            await api.patch(`/contacts/${editingContact.id}`, formData);
        } else {
            await api.post('/contacts', formData);
        }
        fetchContacts(); // Recarrega a lista para exibir o novo/editado contato
    };
    
    // --- Funções para controle dos Modais e Seleção ---
    const handleOpenCreateModal = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };
    const handleOpenEditModal = (contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };
    const handleSelectContact = (contactId) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };
    const handleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map(c => c.id));
        }
    };

    const headerLeftContent = <h1 className="text-xl font-semibold text-gray-800">Signatários</h1>;

    return (
        <>
            <Header
                leftContent={headerLeftContent}
                // O botão de ação "Enviar Documento" só aparece se o usuário tiver permissão
                actionButtonText={canManage ? "Enviar Documento" : null}
            />
            <main className="flex-1 p-6 space-y-6">
                <h2 className="text-3xl font-bold text-gray-800">Signatários</h2>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-transparent p-0 h-auto">
                        <TabsTrigger value="todos" className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2">Todos</TabsTrigger>
                        <TabsTrigger value="favoritos" className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2">Favoritos</TabsTrigger>
                        <TabsTrigger value="inativos" className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2">Inativos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={activeTab} className="mt-6">
                        <Card className="bg-white shadow-sm rounded-xl border">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b gap-4">
                                    <Input 
                                        placeholder="Buscar por nome ou email..." 
                                        className="max-w-xs bg-white" 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    
                                    {/* Botões de Ação - Apenas para quem tem permissão */}
                                    {canManage && (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Button variant="outline" onClick={handleOpenCreateModal} className="flex-1 sm:flex-none">
                                                Adicionar signatário
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                onClick={handleInactivate} 
                                                disabled={selectedContacts.length === 0}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Inativar ({selectedContacts.length})
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {canManage && (
                                                    <TableHead className="w-[50px]">
                                                        <Checkbox 
                                                            checked={filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length} 
                                                            onCheckedChange={handleSelectAll} 
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Celular</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                Array.from({ length: 5 }).map((_, i) => (
                                                    <TableRow key={`skel-${i}`}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                                ))
                                            ) : filteredContacts.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
                                            ) : (
                                                filteredContacts.map((contact) => (
                                                    <TableRow key={contact.id} data-state={selectedContacts.includes(contact.id) && "selected"}>
                                                        {canManage && (
                                                            <TableCell>
                                                                <Checkbox 
                                                                    checked={selectedContacts.includes(contact.id)} 
                                                                    onCheckedChange={() => handleSelectContact(contact.id)} 
                                                                />
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="font-medium">{contact.name}</TableCell>
                                                        <TableCell>{contact.email}</TableCell>
                                                        <TableCell>{contact.phone || '-'}</TableCell>
                                                        
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {/* Botão de Editar/Visualizar */}
                                                                {canManage ? (
                                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(contact)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                                                                        <Edit className="h-4 w-4" /> <span className="hidden sm:inline">Editar</span>
                                                                    </Button>
                                                                ) : (
                                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(contact)} className="flex items-center gap-2 text-gray-600">
                                                                        <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Detalhes</span>
                                                                    </Button>
                                                                )}

                                                                {/* Botão de Favoritar */}
                                                                {canManage && (
                                                                    <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(contact)}>
                                                                        <Star className={`h-5 w-5 transition-colors ${contact.isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`} />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-between p-4 bg-gray-50/50 rounded-b-xl">
                                <div className="text-sm text-muted-foreground">Total de {filteredContacts.length} registros</div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            {/* O Modal lida internamente com modo Edição ou Criação baseado na prop existingContact */}
            <Modal_ContactForm 
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSaveContact}
                existingContact={editingContact}
                readOnly={!canManage} // Opcional: se seu modal suportar modo leitura para viewers
            />
        </>
    );
}