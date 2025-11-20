// src/app/(dashboard)/admin/documents/page.js
"use client";

import Header from "@/components/dashboard/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const mockDocs = [
    { title: 'Contrato de Prestação', owner: 'João Silva', status: 'SIGNED', created: '14/11/2024', deadline: '14/12/2024', progress: '2/2' },
    { title: 'Termo de Confidencialidade', owner: 'Maria Santos', status: 'PENDING', created: '17/11/2024', deadline: '17/12/2024', progress: '1/3' },
    { title: 'Acordo Comercial', owner: 'Pedro Costa', status: 'SIGNED', created: '09/11/2024', deadline: '09/12/2024', progress: '4/4' },
    { title: 'Contrato de Locação', owner: 'Ana Oliveira', status: 'EXPIRED', created: '30/09/2024', deadline: '31/10/2024', progress: '0/2' },
    { title: 'Termo de Uso', owner: 'Carlos Souza', status: 'PENDING', created: '18/11/2024', deadline: '18/12/2024', progress: '2/5' },
];

const StatusBadge = ({ status }) => {
    const map = {
        SIGNED: { label: 'Assinado', class: 'bg-green-100 text-green-700' },
        PENDING: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-700' },
        EXPIRED: { label: 'Expirado', class: 'bg-gray-100 text-gray-700' },
    };
    const s = map[status] || map.EXPIRED;
    return <Badge variant="outline" className={`border-0 ${s.class}`}>{s.label}</Badge>;
};

export default function AdminDocumentsPage() {
  return (
    <>
      <Header leftContent={<h1 className="text-2xl font-bold text-gray-800">Todos os Documentos</h1>} />
      
      <main className="flex-1 p-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar por título ou usuário..." className="pl-10 bg-white" />
            </div>
            <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="signed">Assinados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Card className="border-none shadow-sm">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold">Título</TableHead>
                            <TableHead className="font-semibold">Criador (Tenant)</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Criado em</TableHead>
                            <TableHead className="font-semibold">Prazo</TableHead>
                            <TableHead className="font-semibold">Progresso</TableHead>
                            <TableHead className="text-right font-semibold">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockDocs.map((doc, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">{doc.title}</TableCell>
                                <TableCell>{doc.owner}</TableCell>
                                <TableCell><StatusBadge status={doc.status} /></TableCell>
                                <TableCell>{doc.created}</TableCell>
                                <TableCell>{doc.deadline}</TableCell>
                                <TableCell>{doc.progress} assinaturas</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" className="text-blue-600 hover:text-blue-800">Ver detalhes</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </>
  );
}