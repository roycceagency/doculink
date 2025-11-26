// src/app/(dashboard)/folders/_components/Modal_CreateFolder.js
"use client";

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus, Loader2 } from 'lucide-react';

export default function Modal_CreateFolder({ open, onOpenChange, parentId, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await api.post('/folders', { 
        name, 
        parentId: parentId === 'root' ? null : parentId 
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
      setName('');
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
      alert("Erro ao criar pasta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleCreate}>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gray-800">
                    <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                        <FolderPlus className="h-5 w-5" />
                    </div>
                    Nova Pasta
                </DialogTitle>
                <DialogDescription>
                    Crie uma pasta para organizar seus documentos.
                </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-2">
                <Label htmlFor="folderName">Nome da Pasta</Label>
                <Input 
                    id="folderName"
                    placeholder="Ex: Contratos 2024" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading || !name.trim()} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Pasta'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}