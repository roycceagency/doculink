// src/app/(dashboard)/profiles/_components/Modal_InviteMember.js
"use client";

import { useState } from 'react';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter, 
    DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'; // Usando Input direto para controle total do CSS
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Shield, Eye, FileText, AlertCircle } from "lucide-react";

export default function Modal_InviteMember({ open, onOpenChange, onSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!email) {
        setError("Por favor, insira um e-mail válido.");
        return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/tenants/invite', { email, role });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
      setEmail('');
      setRole('VIEWER');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Ocorreu um erro ao enviar o convite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        
        {/* Cabeçalho com fundo suave */}
        <div className="bg-gray-50/50 p-6 border-b">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                </div>
                Convidar Membro
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
                Envie um convite para adicionar um colaborador à sua equipe.
            </DialogDescription>
            </DialogHeader>
        </div>
        
        {/* Corpo do Formulário */}
        <div className="p-6 space-y-6">
          
          {/* Campo de E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                E-mail do usuário
            </Label>
            <Input 
                id="email" 
                type="email" 
                placeholder="ex: colega@empresa.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="h-11"
            />
          </div>
          
          {/* Seleção de Função com Cards Visuais */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                Nível de Acesso
            </Label>
            <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="h-auto py-3">
                    <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                    
                    <SelectItem value="VIEWER" className="py-3 cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-gray-100 rounded">
                                <Eye className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-semibold text-gray-900">Visualizador</span>
                                <span className="text-xs text-muted-foreground leading-tight">
                                    Pode apenas visualizar e baixar documentos.
                                </span>
                            </div>
                        </div>
                    </SelectItem>

                    <SelectItem value="MANAGER" className="py-3 cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-blue-100 rounded">
                                <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-semibold text-gray-900">Gerenciador</span>
                                <span className="text-xs text-muted-foreground leading-tight">
                                    Pode criar, enviar e editar documentos.
                                </span>
                            </div>
                        </div>
                    </SelectItem>

                    <SelectItem value="ADMIN" className="py-3 cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-purple-100 rounded">
                                <Shield className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-semibold text-gray-900">Administrador</span>
                                <span className="text-xs text-muted-foreground leading-tight">
                                    Acesso total a configurações, equipe e pagamentos.
                                </span>
                            </div>
                        </div>
                    </SelectItem>

                </SelectContent>
            </Select>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <DialogFooter className="p-6 bg-gray-50 border-t">
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={loading} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 min-w-[120px]">
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                    </>
                ) : (
                    'Enviar Convite'
                )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}