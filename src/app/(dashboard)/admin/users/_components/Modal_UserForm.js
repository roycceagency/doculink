// src/app/(dashboard)/admin/users/_components/Modal_UserForm.js
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AuthInput } from '@/components/auth/AuthInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Modal_UserForm({ open, onOpenChange, onSave, existingUser }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', // Novo campo (obrigatório na criação)
    cpf: '',
    phone: '',
    role: 'USER', 
    status: 'ACTIVE'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (existingUser) {
        setFormData({
          name: existingUser.name || '',
          email: existingUser.email || '',
          password: '', // Na edição, senha vazia significa "não alterar"
          cpf: existingUser.cpf || '',
          phone: existingUser.phoneWhatsE164 || '', // Mapeando do backend
          role: existingUser.role || 'USER',
          status: existingUser.status || 'ACTIVE',
        });
      } else {
        // Reset para criação
        setFormData({ 
            name: '', email: '', password: '', cpf: '', phone: '', role: 'USER', status: 'ACTIVE' 
        });
      }
    }
  }, [existingUser, open]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validação básica
    if (!formData.name || !formData.email) {
        setError("Nome e Email são obrigatórios.");
        return;
    }
    if (!existingUser && !formData.password) {
        setError("A senha é obrigatória para novos usuários.");
        return;
    }

    setLoading(true);
    setError('');
    
    try {
        await onSave(formData);
        onOpenChange(false);
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Erro ao salvar usuário.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
            {existingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <AuthInput id="name" label="Nome Completo *" required value={formData.name} onChange={handleChange} />
            <AuthInput id="email" label="Email *" type="email" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AuthInput id="cpf" label="CPF" value={formData.cpf} onChange={handleChange} />
            <AuthInput id="phone" label="Celular (Whatsapp)" value={formData.phone} onChange={handleChange} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label>Função</Label>
                <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USER">Usuário Comum</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="INACTIVE">Inativo</SelectItem>
                        <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          {/* Campo de Senha (Diferente para Criação e Edição) */}
          <div className="pt-2">
             <AuthInput 
                id="password" 
                label={existingUser ? "Nova Senha (Opcional)" : "Senha Inicial *"} 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder={existingUser ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"}
             />
          </div>

          {error && <p className="text-sm text-red-600 font-medium text-center bg-red-50 p-2 rounded">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
            {loading ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
