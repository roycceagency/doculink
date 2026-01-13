// src/app/(dashboard)/admin/users/_components/Modal_UserForm.js
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AuthInput } from '@/components/auth/AuthInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Importante para o input de telefone customizado
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

// Lista de países para o seletor
const countryCodes = [
  { name: "Brasil", code: "+55", flag: "🇧🇷" },
  { name: "Estados Unidos", code: "+1", flag: "🇺🇸" },
  { name: "Portugal", code: "+351", flag: "🇵🇹" },
  { name: "Reino Unido", code: "+44", flag: "🇬🇧" },
  { name: "Espanha", code: "+34", flag: "🇪🇸" },
  { name: "França", code: "+33", flag: "🇫🇷" },
  { name: "Alemanha", code: "+49", flag: "🇩🇪" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Uruguai", code: "+598", flag: "🇺🇾" },
  { name: "Paraguai", code: "+595", flag: "🇵🇾" },
];

export default function Modal_UserForm({ open, onOpenChange, onSave, existingUser }) {
  // Estado inicial
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '+55 ', // Inicia com padrão Brasil na criação
    role: 'ADMIN', // Padrão ADMIN pois ele será dono da própria empresa
    status: 'ACTIVE'
  });

  const [selectedDDI, setSelectedDDI] = useState("+55");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (existingUser) {
        // Lógica para extrair o DDI do telefone existente (se houver)
        let phoneVal = existingUser.phoneWhatsE164 || '';
        let ddi = "+55"; // fallback

        // Tenta encontrar qual DDI o número usa
        const foundCountry = countryCodes.find(c => phoneVal.startsWith(c.code));
        if (foundCountry) {
          ddi = foundCountry.code;
        }

        setSelectedDDI(ddi);

        setFormData({
          name: existingUser.name || '',
          email: existingUser.email || '',
          password: '',
          cpf: existingUser.cpf || '',
          phone: phoneVal,
          role: existingUser.role || 'ADMIN',
          status: existingUser.status || 'ACTIVE',
        });
      } else {
        // Reset para criação
        setSelectedDDI("+55");
        setFormData({
          name: '', email: '', password: '', cpf: '', phone: '+55 ', role: 'ADMIN', status: 'ACTIVE'
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

  // Lógica da troca de bandeira
  const handleCountryChange = (e) => {
    const newDDI = e.target.value;
    setSelectedDDI(newDDI);
    // Atualiza o input mantendo o fluxo
    setFormData(prev => ({ ...prev, phone: newDDI + " " }));
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
            {existingUser ? 'Editar Usuário' : 'Novo Usuário (Nova Organização)'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <AuthInput id="name" label="Nome Completo *" required value={formData.name} onChange={handleChange} />
            <AuthInput id="email" label="Email *" type="email" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AuthInput id="cpf" label="CPF" value={formData.cpf} onChange={handleChange} mask="999.999.999-99" />

            {/* INPUT DE TELEFONE COM BANDEIRA - AGORA USANDO REACT-INTERNATIONAL-PHONE */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Celular (Whatsapp)</Label>
              <div className="flex w-full items-center gap-2">
                <PhoneInput
                  defaultCountry="br"
                  value={formData.phone}
                  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  inputClassName="flex-1 !w-full !h-10 !text-base !bg-background !border-input !rounded-md"
                  containerClassName="!w-full"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Função</Label>
              <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin (Dono)</SelectItem>
                  <SelectItem value="USER">Usuário Comum</SelectItem>
                  {formData.role === 'SUPER_ADMIN' && <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>}
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

          {/* Campo de Senha */}
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