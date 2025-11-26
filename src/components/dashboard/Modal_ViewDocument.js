// src/components/dashboard/Modal_ViewDocument.js
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, X, ExternalLink } from 'lucide-react';

export default function Modal_ViewDocument({ documentId, open, onOpenChange }) {
  const [url, setUrl] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open && documentId) {
      const fetchUrl = async () => {
        setLoading(true);
        setError(false);
        try {
          const { data } = await api.get(`/documents/${documentId}/download`);
          setUrl(data.url);
          setDocTitle(data.title || 'Visualização de Documento');
        } catch (err) {
          console.error("Erro ao carregar documento:", err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchUrl();
    } else {
        setUrl(null);
    }
  }, [open, documentId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false} // <--- CORREÇÃO 1: Remove o X padrão duplicado
        className="max-w-[95vw] w-[95vw] h-[95vh] flex flex-col p-0 gap-0" // <--- CORREÇÃO 2: Tamanho aumentado
      >
        
        {/* Header Customizado */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-white rounded-t-lg">
            <DialogHeader className="space-y-0 text-left"> 
                <DialogTitle className="text-lg font-semibold text-gray-800 truncate max-w-[600px]">
                    {docTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                    Visualização segura do documento PDF.
                </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
                {url && (
                    <Button variant="outline" size="sm" asChild>
                        <a href={url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" /> Baixar
                        </a>
                    </Button>
                )}
                {url && (
                    <Button variant="ghost" size="icon" asChild title="Abrir em nova aba">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                        </a>
                    </Button>
                )}
                {/* Este é o X que será mantido (o customizado) */}
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                    <X className="h-5 w-5 text-gray-500" />
                </Button>
            </div>
        </div>

        {/* Área de Conteúdo (PDF) */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Loader2 className="h-10 w-10 animate-spin mb-2 text-blue-600" />
                    <p>Carregando visualização...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-500">
                    <p>Não foi possível carregar o documento.</p>
                    <Button variant="link" onClick={() => onOpenChange(false)}>Fechar</Button>
                </div>
            ) : (
                <iframe 
                    src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} 
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}