// src/app/(dashboard)/signatories/page.js
"use client";

import React, { useState, useEffect } from 'react';
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Star } from "lucide-react";

// Dados mockados com estado de favorito
const allSignatories = [
    { id: 1, name: "Paulo Santos", email: "pvconteo@outlook.com", isFavorite: true },
    { id: 2, name: "Roycce Agency", email: "roycceagencia@gmail.com", isFavorite: false },
];

export default function SignatoriesPage() {
    const [activeTab, setActiveTab] = useState('todos');
    const [signatories, setSignatories] = useState(allSignatories);
    const [filteredSignatories, setFilteredSignatories] = useState(allSignatories);

    useEffect(() => {
        let filtered;
        if (activeTab === 'todos') {
            filtered = signatories;
        } else if (activeTab === 'favoritos') {
            filtered = signatories.filter(s => s.isFavorite);
        } else if (activeTab === 'inativos') {
            filtered = []; 
        }
        setFilteredSignatories(filtered);
    }, [activeTab, signatories]);

    const toggleFavorite = (id) => {
        setSignatories(currentSignatories =>
            currentSignatories.map(s =>
                s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
            )
        );
    };
    
    const headerLeftContent = <h1 className="text-xl font-semibold text-gray-800">Signatários</h1>;

    return (
        <>
            <Header
                leftContent={headerLeftContent}
                actionButtonText="Enviar Documento"
                onActionButtonClick={() => console.log("Enviar Documento clicado")}
            />

            <main className="flex-1 p-6 space-y-6">
                <h2 className="text-3xl font-bold text-gray-800">Signatários</h2>

                <Tabs defaultValue="todos" onValueChange={setActiveTab}>
                    {/* <<< INÍCIO DA CORREÇÃO DE ESTILO >>> */}
                    {/* 1. Removido o fundo cinza da lista de abas */}
                    <TabsList className="bg-transparent p-0 h-auto">
                        {/* 2. Ajustado o estilo de cada botão de aba */}
                        <TabsTrigger value="todos" className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2">
                            Todos
                        </TabsTrigger>
                        <TabsTrigger value="favoritos" className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2">
                            Favoritos
                        </TabsTrigger>
                        <TabsTrigger value="inativos" className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2">
                            Inativos
                        </TabsTrigger>
                    </TabsList>
                    {/* <<< FIM DA CORREÇÃO DE ESTILO >>> */}
                    
                    <TabsContent value={activeTab} className="mt-6">
                        <Card className="bg-white shadow-sm rounded-xl border">
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between p-6 border-b">
                                    <Input placeholder="Email" className="max-w-xs bg-white" />
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline">Adicionar signatário</Button>
                                        <Button variant="outline">Inativar</Button>
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]"><Checkbox /></TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Editar</TableHead>
                                            <TableHead>Favorito</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSignatories.map((signer) => (
                                            <TableRow key={signer.id}>
                                                <TableCell><Checkbox /></TableCell>
                                                <TableCell className="font-medium text-gray-800">{signer.name}</TableCell>
                                                <TableCell>{signer.email}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                                                        <Edit className="h-4 w-4" />
                                                        Editar
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => toggleFavorite(signer.id)}>
                                                        <Star className={`h-5 w-5 text-gray-400 transition-colors hover:text-yellow-500 ${signer.isFavorite ? 'fill-yellow-400 text-yellow-500' : 'fill-none'}`} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between p-4 bg-gray-50/50 rounded-b-xl">
                                <div className="text-sm text-muted-foreground">Total de {filteredSignatories.length} registros</div>
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
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}