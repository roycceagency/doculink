// src/app/(dashboard)/documents/_components/Modal_MoveDocument.js
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { FolderInput, Loader2 } from 'lucide-react';

export default function Modal_MoveDocument({ open, onOpenChange, document, onSuccess }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [loading, setLoading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchFolders = async () => {
        setLoadingFolders(true);
        try {
          // --- CORREÇÃO: Rota corrigida para /folders ---
          const { data } = await api.get('/folders?search='); 
          // --------------------------------------------
          setFolders(data.folders || []);
          setSelectedFolder(document?.folderId || 'root');
        } catch (error) {
          console.error("Erro ao buscar pastas", error);
        } finally {
          setLoadingFolders(false);
        }
      };
      fetchFolders();
    }
  }, [open, document]);

  const handleMove = async () => {
    setLoading(true);
    try {
      // A rota de mover já estava correta (/folders/move)
      await api.post('/folders/move', {
        itemId: document.id,
        itemType: 'DOCUMENT',
        targetFolderId: selectedFolder === 'root' ? null : selectedFolder
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao mover documento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800">
                <FolderInput className="h-5 w-5 text-blue-600" />
                Mover Documento
            </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-xs text-gray-500 uppercase font-bold">Documento</p>
                <p className="text-sm font-medium text-gray-800 truncate">{document?.title}</p>
            </div>

            <div className="space-y-2">
                <Label>Selecione o Destino</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder} disabled={loadingFolders}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="root">📂 Início (Raiz)</SelectItem>
                        {folders.map(folder => (
                            <SelectItem key={folder.id} value={folder.id}>
                                📁 {folder.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleMove} disabled={loading || loadingFolders} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mover'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}