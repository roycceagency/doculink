// src/app/send/_components/Step2_AddSigners.js
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import api from '@/lib/api'; // <--- 1. IMPORTANTE: Importar a API

import Modal_SelectSigners from './Modal_SelectSigners';
import Modal_CreateSigner from './Modal_CreateSigner';

const QUALIFICATION_OPTIONS = [
  "Advogado(a)", "Assinar", "Cedente", "Cessionário", "Contratada", "Contratante",
  "Credor", "Devedor", "Distratada", "Distratante", "Interveniente Garantidor",
  "Interveniente Garantidor e Contratante", "Licenciado", "Locador",
];
const AUTH_OPTIONS = ["Whatsapp", "E-mail", "Ambos"];

export default function Step2_AddSigners({ onNext, onBack, signers, setSigners }) {
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Função auxiliar para adicionar visualmente na lista (usada tanto pelo Select quanto pelo Create)
  const addSignersToList = (newContacts) => {
    const contactsArray = Array.isArray(newContacts) ? newContacts : [newContacts];
    
    const signersToAdd = contactsArray
      .filter(contact => !signers.some(existing => existing.email.toLowerCase() === contact.email.toLowerCase()))
      .map(contact => ({ 
        ...contact, 
        qualification: 'Assinar', 
        authMethod: 'Whatsapp' 
      }));
      
    setSigners(prev => [...prev, ...signersToAdd]);
  };

  // <--- 2. NOVA FUNÇÃO: Salva no banco de dados E DEPOIS adiciona na lista
  const handleSaveNewSigner = async (formData) => {
    try {
      // Faz a chamada para a API para salvar o contato permanentemente
      const response = await api.post('/contacts', formData);
      
      // Adiciona o contato retornado pela API (que agora tem ID) na lista visual
      addSignersToList(response.data);
      
    } catch (error) {
      // Repassa o erro para que o Modal possa exibir a mensagem vermelha
      throw error; 
    }
  };

  const removeSigner = (emailToRemove) => {
    setSigners(signers.filter(s => s.email.toLowerCase() !== emailToRemove.toLowerCase()));
  };

  const updateSignerField = (email, field, value) => {
    const newSigners = signers.map(signer => {
      if (signer.email.toLowerCase() === email.toLowerCase()) {
        return { ...signer, [field]: value };
      }
      return signer;
    });
    setSigners(newSigners);
  };
  
  return (
    <>
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md border space-y-6 min-h-[400px]">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Selecione os Signatários</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" onClick={() => setIsSelectModalOpen(true)} className="w-full sm:w-auto">
            Escolha um signatário de sua lista
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
            Adicione um novo signatário
          </Button>
        </div>

        {signers.length > 0 && (
          <div>
            {/* 1. VISÃO DE TABELA PARA TELAS MÉDIAS E GRANDES */}
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Celular</TableHead>
                    <TableHead>Qualificação</TableHead>
                    <TableHead>Autenticação</TableHead>
                    <TableHead className="text-right">Eliminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signers.map((signer) => (
                    <TableRow key={signer.email}>
                      <TableCell className="font-medium">{signer.name}</TableCell>
                      <TableCell>{signer.email}</TableCell>
                      <TableCell>{signer.phone || signer.phoneWhatsE164}</TableCell>
                      <TableCell>
                        <Select value={signer.qualification} onValueChange={(v) => updateSignerField(signer.email, 'qualification', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{QUALIFICATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={signer.authMethod} onValueChange={(v) => updateSignerField(signer.email, 'authMethod', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{AUTH_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="icon" onClick={() => removeSigner(signer.email)} className="bg-red-500 hover:bg-red-600 rounded-md size-8">
                          <X className="h-4 w-4 text-white" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 2. VISÃO DE CARDS PARA TELAS PEQUENAS */}
            <div className="block md:hidden space-y-4">
              {signers.map(signer => (
                <Card key={signer.email} className="bg-gray-50/50">
                  <CardHeader className="flex flex-row items-start justify-between p-4 border-b">
                      <div>
                          <p className="font-bold text-gray-800">{signer.name}</p>
                          <p className="text-sm text-gray-500">{signer.email}</p>
                          <p className="text-sm text-gray-500">{signer.phone || signer.phoneWhatsE164}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeSigner(signer.email)} className="-mt-2 -mr-2">
                        <X className="h-5 w-5 text-red-500" />
                      </Button>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">Qualificação</label>
                      <Select value={signer.qualification} onValueChange={(v) => updateSignerField(signer.email, 'qualification', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{QUALIFICATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">Autenticação</label>
                      <Select value={signer.authMethod} onValueChange={(v) => updateSignerField(signer.email, 'authMethod', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{AUTH_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>Anterior</Button>
          <Button onClick={onNext} disabled={signers.length === 0} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
            Próximo
          </Button>
        </div>
      </div>

      {/* Modal de Seleção: Usa a função que apenas adiciona à lista (pois já existem no banco) */}
      <Modal_SelectSigners 
        open={isSelectModalOpen} 
        onOpenChange={setIsSelectModalOpen} 
        onSelect={addSignersToList} 
      />
      
      {/* Modal de Criação: Usa a NOVA função que salva no banco primeiro */}
      <Modal_CreateSigner 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
        onSave={handleSaveNewSigner} 
      />
    </>
  );
}