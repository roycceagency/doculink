// src/app/sign/[token]/_components/Step1_Summary.js
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, User, Mail, PenTool } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Vamos usar o Badge se tiver, ou um span estilizado

export default function Step1_Summary({ data, onNext }) {
  const { document: doc, signer } = data;
  const deadline = new Date(doc.deadlineAt).toLocaleDateString('pt-BR');

  return (
    <Card className="w-full bg-white shadow-lg rounded-xl border-none overflow-hidden">
      
      {/* HEADER RESPONSIVO */}
      <CardHeader className="p-6 md:p-8 border-b md:border-b-0">
        <CardTitle className="text-xl md:text-3xl font-bold text-[#151928] leading-tight">
          {doc.title}
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-muted-foreground mt-2 md:mt-4 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            <span>Assinar até <strong className="text-gray-700">{deadline}</strong></span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        
        {/* --- VERSÃO MOBILE (CARD VERTICAL) --- */}
        {/* Só aparece em telas pequenas (md:hidden) */}
        <div className="md:hidden p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Seus Dados
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-4">
                {/* Nome e Status */}
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-full border border-gray-200 mt-1">
                            <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{signer.name}</p>
                            <span className="text-xs text-gray-500">Signatário (Você)</span>
                        </div>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold border border-orange-200">
                        Pendente
                    </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200/60">
                     <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                     <p className="text-sm text-gray-600 break-all">{signer.email}</p>
                </div>

                {/* Ação */}
                <div className="flex items-center gap-3">
                     <PenTool className="h-4 w-4 text-gray-400 shrink-0" />
                     <p className="text-sm text-gray-600">Ação requerida: <span className="font-medium text-blue-600">Assinar Documento</span></p>
                </div>
            </div>
        </div>


        {/* --- VERSÃO DESKTOP (TABELA) --- */}
        {/* Só aparece em telas médias ou maiores (hidden md:block) */}
        <div className="hidden md:block px-8 pb-4">
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr className="border-b">
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Assinante</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Email</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Ação</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    <tr>
                    <td className="py-4 px-4 font-medium text-gray-900">{signer.name}</td>
                    <td className="py-4 px-4 text-gray-600">{signer.email}</td>
                    <td className="py-4 px-4 text-gray-600">Assinar</td>
                    <td className="py-4 px-4">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
                            Pendente
                        </span>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
        </div>

      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 md:p-8 border-t bg-gray-50/50">
        <p className="text-xs text-gray-400 text-center sm:text-left">
            Ao clicar em próximo, você concorda com os termos de assinatura eletrônica.
        </p>
        <Button 
            onClick={onNext} 
            className="w-full sm:w-auto bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 h-11 px-8 text-base shadow-lg shadow-blue-900/10 transition-all"
        >
          Próximo
        </Button>
      </CardFooter>
    </Card>
  );
}