// src/app/sign/[token]/_components/Step4_VerifyOtp.js
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function Step4_VerifyOtp({ token, signatureImage, onComplete, onBack }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Envia o OTP automaticamente assim que o componente carrega
  useEffect(() => {
    const sendOtp = async () => {
        try {
            setSendingOtp(true);
            setMessage('Enviando código de verificação...');
            await api.post(`/sign/${token}/otp/start`);
            setMessage('Enviamos um código de 6 dígitos para seus canais de autenticação (E-mail/WhatsApp).');
        } catch (err) {
            console.error(err);
            setError("Falha ao enviar o código de verificação. Tente novamente.");
        } finally {
            setSendingOtp(false);
        }
    };
    sendOtp();
  }, [token]);

  const handleVerifyAndSign = async () => {
    if (!otp || otp.length < 6) {
        setError("Por favor, digite o código de 6 dígitos completo.");
        return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. Verifica o OTP
      await api.post(`/sign/${token}/otp/verify`, { otp });
      
      // 2. Gera um fingerprint simples do navegador (pode ser melhorado com libs específicas)
      const clientFingerprint = `ua:${window.navigator.userAgent}|lang:${window.navigator.language}|ts:${Date.now()}`;
      
      // 3. Finaliza a assinatura enviando a imagem
      // A resposta conterá { message, shortCode, signatureHash, isComplete }
      const response = await api.post(`/sign/${token}/commit`, {
        signatureImage: signatureImage,
        clientFingerprint: clientFingerprint
      });

      // 4. Chama o callback do pai passando os dados finais para a tela de sucesso
      if (onComplete) {
          onComplete(response.data);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Código inválido ou erro ao finalizar a assinatura.');
      setLoading(false);
    }
  };

  // Função para reenviar o código manualmente
  const handleResend = async () => {
    setError('');
    setMessage('Reenviando código...');
    try {
        await api.post(`/sign/${token}/otp/start`);
        setMessage('Novo código enviado com sucesso.');
    } catch (err) {
        setError('Erro ao reenviar código. Aguarde alguns instantes.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl border-none p-8 text-center">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-3xl font-bold text-[#151928]">Verificação de Segurança</CardTitle>
        <div className="mt-2 text-sm text-muted-foreground min-h-[20px]">
            {sendingOtp ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/> Enviando código...</span>
            ) : (
                message || 'Insira o código recebido.'
            )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 space-y-6">
        <div className="flex justify-center">
            <Input 
            type="text" 
            maxLength="6" 
            value={otp} 
            onChange={(e) => {
                // Permite apenas números
                const value = e.target.value.replace(/\D/g, '');
                setOtp(value);
            }}
            className="text-center text-3xl tracking-[0.5em] h-16 w-64 font-mono border-2 focus-visible:ring-blue-600" 
            placeholder="000000"
            autoFocus
            />
        </div>
        
        {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
            </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-center gap-4 p-0 mt-8">
        <Button 
            onClick={handleVerifyAndSign} 
            disabled={loading || otp.length < 6} 
            className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 h-12 text-lg font-semibold shadow-md transition-all"
        >
          {loading ? (
            <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizando...
            </>
          ) : 'Confirmar Assinatura'}
        </Button>
        
        <div className="flex justify-between w-full text-sm mt-2">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 underline decoration-gray-300 underline-offset-4">
                Voltar
            </button>
            <button onClick={handleResend} disabled={sendingOtp} className="text-blue-600 hover:text-blue-800 font-medium">
                Reenviar código
            </button>
        </div>
      </CardFooter>
    </Card>
  );
}