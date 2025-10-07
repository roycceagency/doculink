// src/app/(dashboard)/documents/[status]/page.js
"use client";

import React, { useMemo } from 'react'; // Importar useMemo
import Link from 'next/link';
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight } from 'lucide-react';

const allDocuments = [
  { id: 1, name: "PROPOSTA_CLIENTE_A.pdf", status: "Pendente", folder: "Comercial", created: "18/06/2025", updated: "18/06/2025" },
  { id: 2, name: "INFORME_MENDOZA1601.pdf", status: "Concluído", folder: "None", created: "12/06/2025", updated: "16/06/2025" },
  { id: 3, name: "CONTRATO_VENCIDO.pdf", status: "Lixeira", folder: "Jurídico", created: "01/01/2025", updated: "02/01/2025" },
  { id: 4, name: "INFORME_SUPERI2393.pdf", status: "Concluído", folder: "None", created: "12/06/2025", updated: "16/06/2025" },
  { id: 5, name: "NDA_PARCEIRO_B.pdf", status: "Pendente", folder: "Jurídico", created: "17/06/2025", updated: "17/06/2025" },
];

const statusMap = {
  pendentes: { label: "Pendentes", filter: "Pendente" },
  concluidos: { label: "Concluídos", filter: "Concluído" },
  todos: { label: "Todos", filter: null },
  lixeira: { label: "Lixeira", filter: "Lixeira" },
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Concluído': "text-green-700 border-green-300 bg-green-100",
        'Pendente': "text-orange-700 border-orange-300 bg-orange-100",
        'Lixeira': "text-gray-700 border-gray-300 bg-gray-100",
    };
    return <Badge className={`font-medium rounded-full px-2.5 py-0.5 ${styles[status] || styles['Lixeira']}`}>{status}</Badge>;
};

export default function DocumentsPage({ params }) {
    const currentStatusKey = params.status || 'pendentes';

    // <<< CORREÇÃO DEFINITIVA COM useMemo >>>
    // Esta lógica agora recalcula os dados sempre que a URL (params.status) muda.
    const { filteredDocuments, headerLeftContent } = useMemo(() => {
        const statusInfo = statusMap[currentStatusKey] || statusMap.pendentes;
        
        const documents = (() => {
            if (statusInfo.filter) {
                return allDocuments.filter(d => d.status === statusInfo.filter);
            }
            // Lógica para 'todos': mostrar tudo, exceto 'Lixeira'
            return allDocuments.filter(d => d.status !== 'Lixeira');
        })();

        const breadcrumbs = [
            { label: "Documentos", href: "/documentos/pendentes" },
            { label: statusInfo.label },
        ];
        
        const headerContent = (
            <div className="flex items-center gap-2 text-base">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <React.Fragment key={index}>
                            {isLast ? (
                                <span className="font-semibold text-gray-800">{crumb.label}</span>
                            ) : (
                                <Link href={crumb.href} className="font-normal text-gray-500 hover:text-gray-700">
                                    {crumb.label}
                                </Link>
                            )}
                            {!isLast && <ChevronRight className="h-5 w-5 text-gray-400" />}
                        </React.Fragment>
                    );
                })}
            </div>
        );

        return { filteredDocuments: documents, headerLeftContent: headerContent };
    }, [currentStatusKey]);
    // <<< FIM DA CORREÇÃO >>>

    return (
        <>
            <Header
                leftContent={headerLeftContent}
                actionButtonText="Enviar Documento"
                onActionButtonClick={() => console.log("Enviar Documento clicado")}
            />
            <main className="flex-1 p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-800">Documentos</h2>
                </div>
                <Card className="bg-white shadow-sm rounded-xl border">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between p-6 border-b">
                            <Input placeholder="Email" className="max-w-xs bg-white" />
                            <Button variant="ghost" className="text-gray-500 font-semibold hover:text-red-600 hover:bg-red-50">Deletar</Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"><Checkbox /></TableHead>
                                    <TableHead>Documento</TableHead><TableHead>Status</TableHead><TableHead>Pasta</TableHead><TableHead>Criado Em</TableHead><TableHead>Última Atualização</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocuments.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell><Checkbox /></TableCell>
                                        <TableCell className="font-medium text-gray-800">{doc.name}</TableCell>
                                        <TableCell><StatusBadge status={doc.status} /></TableCell>
                                        <TableCell>{doc.folder}</TableCell><TableCell>{doc.created}</TableCell><TableCell>{doc.updated}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4 bg-gray-50/50 rounded-b-xl">
                        <div className="text-sm text-muted-foreground">Total de {filteredDocuments.length} registros</div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">Filas por página</p>
                                <Select defaultValue="10"><SelectTrigger className="w-[80px] bg-white h-9"><SelectValue placeholder="10" /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem></SelectContent></Select>
                            </div>
                            <div className="text-sm font-medium">Página 1 de 1</div>
                            <Pagination className="mx-0 w-fit"><PaginationContent>
                                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                                <PaginationItem><PaginationNext href="#" /></PaginationItem>
                            </PaginationContent></Pagination>
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </>
    );
}