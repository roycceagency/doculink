// src/app/(dashboard)/documents/[status]/page.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importação dos componentes de UI e ícones
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Download, MoreVertical, Ban } from 'lucide-react';

// Mapeia o status da URL para a label e o parâmetro a ser enviado para a API
const statusMap = {
  pendentes: { label: "Pendentes", apiQuery: "pendentes" },
  concluidos: { label: "Concluídos", apiQuery: "concluidos" },
  todos: { label: "Todos", apiQuery: null },
  lixeira: { label: "Lixeira", apiQuery: "lixeira" },
};

/**
 * Componente para renderizar um Badge colorido com base no status do documento.
 */
const StatusBadge = ({ status }) => {
    const styles = {
        'SIGNED': "text-green-700 border-green-200 bg-green-50",
        'READY': "text-orange-700 border-orange-200 bg-orange-50",
        'PARTIALLY_SIGNED': "text-blue-700 border-blue-200 bg-blue-50",
        'CANCELLED': "text-gray-700 border-gray-200 bg-gray-50",
        'EXPIRED': "text-red-700 border-red-200 bg-red-50",
        'DRAFT': "text-gray-600 border-gray-200 bg-gray-100"
    };
    const label = {
        'SIGNED': 'Concluído',
        'READY': 'Pendente',
        'PARTIALLY_SIGNED': 'Em andamento',
        'CANCELLED': 'Cancelado',
        'EXPIRED': 'Expirado',
        'DRAFT': 'Rascunho'
    };
    
    return (
        <Badge variant="outline" className={`font-semibold ${styles[status] || styles['CANCELLED']}`}>
            {label[status] || status}
        </Badge>
    );
};

export default function DocumentsPage() {
    const { isAuthenticated, user } = useAuth();
    const pathname = usePathname();

    // Determina qual aba está ativa baseado na URL
    const currentStatusKey = useMemo(() => {
        const segments = pathname.split('/');
        const statusFromUrl = segments[segments.length - 1];
        return statusMap[statusFromUrl] ? statusFromUrl : 'pendentes';
    }, [pathname]);

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lógica de Permissões (RBAC)
    // MANAGER e ADMIN podem cancelar documentos. VIEWER só pode baixar.
    const canManage = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user?.role);

    // Função de Busca
    const fetchDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const statusInfo = statusMap[currentStatusKey] || statusMap.pendentes;
            const apiQuery = statusInfo.apiQuery;
            // Se apiQuery for null (Todos), não envia parâmetro
            const url = apiQuery ? `/documents?status=${apiQuery}` : '/documents';
            
            const response = await api.get(url);
            setDocuments(response.data);
        } catch (err) {
            console.error(`Falha ao buscar docs para '${currentStatusKey}':`, err);
            setError("Não foi possível carregar os documentos.");
        } finally {
            setLoading(false);
        }
    };

    // Efeito para buscar os documentos da API quando auth ou aba mudar
    useEffect(() => {
        if (isAuthenticated) {
            fetchDocuments();
        }
    }, [isAuthenticated, currentStatusKey]);

    // Configuração do Header
    const headerLeftContent = (
        <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800">Documentos</h1>
            <p className="text-sm text-muted-foreground">
                {statusMap[currentStatusKey]?.label || "Lista de Documentos"}
            </p>
        </div>
    );
    
    // --- AÇÕES DE DOCUMENTO ---

    const handleDownload = async (documentId) => {
        try {
            const { data } = await api.get(`/documents/${documentId}/download`);
            if (data.url) {
                window.open(data.url, '_blank');
            }
        } catch (error) {
            alert("Erro ao iniciar download.");
        }
    };

    const handleCancel = async (documentId) => {
        if (!confirm("Tem certeza que deseja cancelar este documento? O link de assinatura será invalidado.")) return;
        
        try {
            await api.post(`/documents/${documentId}/cancel`);
            // Atualiza a lista localmente
            fetchDocuments();
        } catch (error) {
            alert("Erro ao cancelar documento.");
        }
    };

    // --- RENDERIZAÇÃO ---

    const renderTableBody = () => {
        if (loading) {
            return Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skel-${index}`}><TableCell colSpan={6}><Skeleton className="w-full h-8" /></TableCell></TableRow>
            ));
        }
        if (error) {
            return <TableRow><TableCell colSpan={6} className="text-center h-32 text-red-600 font-medium">{error}</TableCell></TableRow>;
        }
        if (documents.length === 0) {
            return <TableRow><TableCell colSpan={6} className="text-center h-32 text-gray-500">Nenhum documento encontrado nesta categoria.</TableCell></TableRow>;
        }
        
        return documents.map((doc) => (
            <TableRow key={doc.id}>
                <TableCell><Checkbox /></TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{doc.title}</span>
                        {/* Opcional: Mostrar quem criou se for colaborativo */}
                        {doc.owner && <span className="text-xs text-gray-400">Criado por: {doc.owner.name}</span>}
                    </div>
                </TableCell>
                <TableCell><StatusBadge status={doc.status} /></TableCell>
                <TableCell className="text-gray-600 text-sm">{doc.Signers ? `${doc.Signers.length} Assinantes` : '-'}</TableCell>
                <TableCell className="text-gray-600 text-sm">{format(new Date(doc.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleDownload(doc.id)} className="cursor-pointer">
                                <Download className="mr-2 h-4 w-4" />
                                <span>Baixar Original</span>
                            </DropdownMenuItem>

                            {/* Apenas mostra Cancelar se tiver permissão E o documento não estiver finalizado/cancelado */}
                            {canManage && doc.status !== 'SIGNED' && doc.status !== 'CANCELLED' && doc.status !== 'EXPIRED' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => handleCancel(doc.id)} className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50">
                                        <Ban className="mr-2 h-4 w-4" />
                                        <span>Cancelar</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <>
            <Header
                leftContent={headerLeftContent}
                // Esconde botão de enviar se o usuário for apenas VIEWER
                actionButtonText={canManage ? "Enviar Documento" : null}
            />
            
            <main className="flex-1 p-6 space-y-6">
                <Card className="bg-white shadow-sm rounded-xl border overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[50px]"><Checkbox /></TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assinantes</TableHead>
                                    <TableHead>Criado Em</TableHead>
                                    <TableHead className="text-right w-[80px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderTableBody()}
                            </TableBody>
                        </Table>
                    </CardContent>
                    
                    {documents.length > 0 && (
                        <CardFooter className="flex items-center justify-between p-4 bg-gray-50/50 border-t">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {documents.length} registro(s)
                            </div>
                            {/* Paginação futura pode entrar aqui */}
                        </CardFooter>
                    )}
                </Card>
            </main>
        </>
    );
}