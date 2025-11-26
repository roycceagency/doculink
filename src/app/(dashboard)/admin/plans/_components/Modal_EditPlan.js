// src/app/(dashboard)/admin/plans/_components/Modal_EditPlan.js
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';

export default function Modal_EditPlan({ open, onOpenChange, plan, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    userLimit: '',
    documentLimit: '',
    featuresText: ''
  });

  useEffect(() => {
    if (plan && open) {
      // Lógica segura para Features
      let featuresList = [];
      if (Array.isArray(plan.features)) {
          featuresList = plan.features;
      } else if (typeof plan.features === 'string') {
          // Se o banco retornou string JSON (alguns dialetos SQL fazem isso)
          try { featuresList = JSON.parse(plan.features); } catch(e) {}
      }

      setFormData({
        name: plan.name || '',
        price: plan.price || 0,
        userLimit: plan.userLimit || 0,
        documentLimit: plan.documentLimit || 0,
        featuresText: featuresList.join('\n')
      });
    }
  }, [plan, open]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const featuresArray = formData.featuresText.split('\n').filter(line => line.trim() !== '');

      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        userLimit: parseInt(formData.userLimit),
        documentLimit: parseInt(formData.documentLimit),
        features: featuresArray
      };

      // Garante o ID correto na rota
      await api.put(`/subscription/plans/${plan.id}`, payload);
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar plano. Verifique a conexão ou permissões.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSave}>
            <DialogHeader>
                <DialogTitle>Editar Plano: {formData.name}</DialogTitle>
                <DialogDescription>
                    ID Interno: {plan?.id}
                </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Plano</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Preço Mensal (R$)</Label>
                        <Input id="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="userLimit">Limite de Usuários</Label>
                        <Input id="userLimit" type="number" value={formData.userLimit} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="documentLimit">Limite de Documentos</Label>
                        <Input id="documentLimit" type="number" value={formData.documentLimit} onChange={handleChange} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="featuresText">Lista de Funcionalidades (Uma por linha)</Label>
                    <Textarea 
                        id="featuresText" 
                        value={formData.featuresText} 
                        onChange={handleChange} 
                        className="h-32 font-mono text-sm"
                        placeholder="Ex: Suporte VIP&#10;API Completa"
                    />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}