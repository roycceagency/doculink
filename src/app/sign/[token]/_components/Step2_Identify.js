// src/app/sign/[token]/_components/Step2_Identify.js
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AuthInput } from '@/components/auth/AuthInput';
import api from '@/lib/api';

// Renomeado para refletir o design da imagem
export default function Step2_Identify({ token, onNext, onBack, summaryData }) {
  const [formData, setFormData] = useState({
    name: summaryData?.signer?.name || '',
    email: summaryData?.signer?.email || '',
    cpf: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleIdentify = async () => {
    setLoading(true);
    setError('');
    try {
      // --- REMOÇÃO DA CHAMADA DE OTP ---
      // 1. Apenas salva os dados de identificação.
      await api.post(`/sign/${token}/identify`, { 
          cpf: formData.cpf, 
          phone: formData.phone 
      });
      // 2. Não envia o OTP aqui.
      
      onNext(); // Avança para o próximo passo (desenhar assinatura)
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao confirmar identidade.');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-lg rounded-xl border-none p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-3xl font-bold text-[#151928]">Identificação</CardTitle>
        <CardDescription className="text-muted-foreground mt-2">Confirme sua identidade para assinar o documento</CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-5">
        <AuthInput id="name" label="Nome *" value={formData.name} readOnly disabled className="bg-gray-100" />
        <AuthInput id="email" label="Email *" type="email" value={formData.email} readOnly disabled className="bg-gray-100" />
        <AuthInput id="cpf" label="CPF *" mask="999.999.999-99" required onChange={handleChange} />
        <AuthInput id="phone" label="Celular *" mask="(99) 99999-9999" required onChange={handleChange} />
        <p className="text-sm text-muted-foreground">*campos obrigatórios</p>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </CardContent>
      <CardFooter className="flex justify-between p-0 mt-8">
        <Button variant="outline" onClick={onBack}>Anterior</Button>
        <Button onClick={handleIdentify} disabled={loading} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
          {loading ? 'Aguarde...' : 'Adicionar e Continuar'}
        </Button>
      </CardFooter>
    </Card>
  );
}