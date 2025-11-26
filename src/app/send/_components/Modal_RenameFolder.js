// src/app/send/_components/Modal_RenameFolder.js
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3, Loader2 } from 'lucide-react';

export default function Modal_RenameFolder({ open, onOpenChange, folder, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folder) setName(folder.name);
  }, [folder]);

  const handleRename = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await api.patch(`/folders/${folder.id}`, { name });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao renomear pasta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] z-[100]"> {/* z-index alto para ficar sobre o modal de seleção */}
        <form onSubmit={handleRename}>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gray-800">
                    <Edit3 className="h-5 w-5 text-blue-600" />
                    Renomear Pasta
                </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="rename-input">Novo Nome</Label>
                <Input 
                    id="rename-input" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    autoFocus 
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading || !name.trim()} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}