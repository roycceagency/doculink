// src/app/onboarding/_components/Modal_PendingInvites.js
"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Building2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export default function Modal_PendingInvites({ onInvitesHandled }) {
  const [invites, setInvites] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null); // Para loading individual

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const { data } = await api.get('/tenants/invites/pending');
        if (data && data.length > 0) {
          setInvites(data);
          setOpen(true);
        }
      } catch (error) {
        console.error("Erro ao buscar convites:", error);
      }
    };
    fetchInvites();
  }, []);

  const handleResponse = async (inviteId, accept) => {
    setLoading(true);
    setProcessingId(inviteId);
    try {
      await api.post(`/tenants/invites/${inviteId}/respond`, { accept });
      
      // Animação de saída (opcional, aqui removemos direto)
      const remaining = invites.filter(i => i.id !== inviteId);
      setInvites(remaining);

      if (remaining.length === 0) {
        setOpen(false);
        if (onInvitesHandled) onInvitesHandled(); 
      }
    } catch (error) {
      alert("Erro ao processar convite.");
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const handleClose = () => {
    // Se o usuário fechar sem aceitar, apenas fecha o modal
    setOpen(false);
    if (onInvitesHandled) onInvitesHandled();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0">
        
        {/* HEADER COM FUNDO SUAVE */}
        <div className="bg-blue-50/50 p-6 border-b border-blue-100">
            <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                    <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                    Convites Recebidos
                </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 text-base">
                Você foi convidado para colaborar nas seguintes organizações.
            </DialogDescription>
            </DialogHeader>
        </div>
        
        {/* LISTA DE CONVITES COM SCROLL SE NECESSÁRIO */}
        <div className="p-6 bg-white max-h-[60vh] overflow-y-auto space-y-4">
          {invites.map((invite) => (
            <div 
                key={invite.id} 
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all bg-white"
            >
                {/* Informações da Empresa */}
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 border border-gray-100">
                        <span className="text-lg font-bold text-gray-600">
                            {invite.tenant?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    
                    <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 leading-none">
                            {invite.tenant?.name || 'Organização'}
                        </h4>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">Você atuará como:</p>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-[10px] px-2">
                                {invite.role === 'ADMIN' ? 'ADMINISTRADOR' : 'COLABORADOR'}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-400 pt-1">
                            Enviado em {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex sm:flex-col gap-2 sm:w-auto w-full pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <Button 
                        size="sm" 
                        className="w-full sm:w-24 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                        onClick={() => handleResponse(invite.id, true)}
                        disabled={loading}
                    >
                        {processingId === invite.id ? '...' : (
                            <>Aceitar <CheckCircle2 className="ml-1.5 h-3.5 w-3.5" /></>
                        )}
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-full sm:w-24 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleResponse(invite.id, false)}
                        disabled={loading}
                    >
                        Recusar
                    </Button>
                </div>
            </div>
          ))}
        </div>

        <Separator />

        <DialogFooter className="p-4 bg-gray-50">
            <Button variant="ghost" onClick={handleClose} className="text-gray-500">
                Decidir mais tarde <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}