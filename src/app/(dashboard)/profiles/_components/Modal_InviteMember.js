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
import { 
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Shield, Eye, FileText, AlertCircle, CheckCircle2, UserX, Copy } from "lucide-react";

export default function Modal_InviteMember({ open, onOpenChange, onSuccess }) {
  // Estados do Formulário
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER'); 
  
  // Estados de Controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewState, setViewState] = useState('form'); // 'form' | 'success'
  const [showNotFoundAlert, setShowNotFoundAlert] = useState(false); // Modal de erro específico

  const handleInvite = async () => {
    if (!email) {
        setError("Por favor, insira um e-mail válido.");
        return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/tenants/invite', { email, role });
      
      // Sucesso: Muda para a visualização de confirmação
      setViewState('success');
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Ocorreu um erro ao enviar o convite.";
      
      // Verifica se é o erro de usuário inexistente (baseado na mensagem do backend)
      if (message.includes("não corresponde a nenhuma conta") || message.includes("cadastrar primeiro")) {
          setShowNotFoundAlert(true);
      } else {
          setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reseta os estados ao fechar
  const handleClose = () => {
      onOpenChange(false);
      setTimeout(() => {
          setViewState('form');
          setEmail('');
          setRole('VIEWER');
          setError('');
      }, 300);
  };

  const copyLink = () => {
      navigator.clipboard.writeText("https://doculink.com.br/register");
      alert("Link de cadastro copiado!");
  };

  return (
    <>
        {/* MODAL PRINCIPAL (FORMULÁRIO E SUCESSO) */}
        <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
            
            {viewState === 'form' ? (
                <>
                    {/* HEADER */}
                    <div className="bg-gray-50/50 p-6 border-b">
                        <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Mail className="h-5 w-5" />
                            </div>
                            Convidar Membro
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-base">
                            Envie um convite para adicionar um colaborador à sua equipe.
                        </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    {/* BODY */}
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
                        
                        {/* Seleção de Função */}
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
                                            <div className="mt-1 p-1 bg-gray-100 rounded text-gray-600">
                                                <Eye className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-semibold text-gray-900">Visualizador</span>
                                                <span className="text-xs text-muted-foreground leading-tight">
                                                    Apenas visualiza e baixa documentos.
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>

                                    <SelectItem value="MANAGER" className="py-3 cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-1 bg-blue-100 rounded text-blue-600">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-semibold text-gray-900">Gerenciador</span>
                                                <span className="text-xs text-muted-foreground leading-tight">
                                                    Cria, envia e edita documentos.
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>

                                    <SelectItem value="ADMIN" className="py-3 cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-1 bg-purple-100 rounded text-purple-600">
                                                <Shield className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-semibold text-gray-900">Administrador</span>
                                                <span className="text-xs text-muted-foreground leading-tight">
                                                    Acesso total a equipe e pagamentos.
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Erro Genérico */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-200 animate-in fade-in">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <DialogFooter className="p-6 bg-gray-50 border-t">
                        <div className="flex w-full justify-end gap-3">
                            <Button variant="outline" onClick={handleClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button onClick={handleInvite} disabled={loading} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 min-w-[120px]">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Convite'}
                            </Button>
                        </div>
                    </DialogFooter>
                </>
            ) : (
                /* --- TELA DE SUCESSO --- */
                <div className="flex flex-col items-center justify-center p-10 text-center space-y-6 animate-in zoom-in-95">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">Convite Enviado!</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            O usuário <strong>{email}</strong> recebeu um e-mail para ingressar na sua equipe.
                        </p>
                    </div>
                    <Button onClick={handleClose} className="w-full max-w-xs bg-gray-900 text-white">
                        Concluir
                    </Button>
                </div>
            )}
        </DialogContent>
        </Dialog>

        {/* ALERTA ESPECÍFICO: USUÁRIO NÃO ENCONTRADO */}
        <AlertDialog open={showNotFoundAlert} onOpenChange={setShowNotFoundAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-full">
                            <UserX className="h-6 w-6 text-orange-600" />
                        </div>
                        <AlertDialogTitle className="text-xl">Usuário não encontrado</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base space-y-3">
                        <p>
                            O e-mail <strong>{email}</strong> ainda não possui uma conta na Doculink.
                        </p>
                        <p className="bg-gray-50 p-3 rounded-md border text-sm text-gray-700">
                            Por segurança, apenas usuários cadastrados podem ser convidados para equipes. Peça para ele se cadastrar gratuitamente.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={copyLink} className="gap-2">
                        <Copy className="h-4 w-4" /> Copiar Link de Cadastro
                    </Button>
                    <AlertDialogAction onClick={() => setShowNotFoundAlert(false)} className="bg-[#1c4ed8]">
                        Entendi
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}