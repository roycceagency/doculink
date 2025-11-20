// src/app/sign/[token]/page.js
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';

// Importação dos componentes de UI para feedback de carregamento
import { Skeleton } from '@/components/ui/skeleton'; 

// Importação dos componentes de cada passo
import Step1_Summary from './_components/Step1_Summary';
import Step2_Identify from './_components/Step2_Identify';
import Step4_VerifyOtp from './_components/Step4_VerifyOtp';
import Step5_Success from './_components/Step5_Success';

// Carregamento dinâmico do Step3 (Canvas de Assinatura) para evitar erros de SSR (Window is not defined)
const Step3_DrawSign = dynamic(
  () => import('./_components/Step3_DrawSign'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <Skeleton className="h-96 w-full" />
      </div>
    )
  }
);

/**
 * Página principal que orquestra todo o fluxo de assinatura para o signatário externo.
 */
export default function SignPage() {
  const params = useParams();
  const token = params.token;
  
  // --- ESTADOS ---
  // 0: Carregando, 1: Resumo, 2: Identificação, 3: Assinatura, 4: OTP, 5: Sucesso, -1: Erro
  const [currentStep, setCurrentStep] = useState(0); 
  const [error, setError] = useState('');
  
  // Dados do Documento e Signatário vindos da API
  const [summaryData, setSummaryData] = useState(null);
  
  // Imagem da assinatura capturada no Step 3 (Base64)
  const [signatureImage, setSignatureImage] = useState(null); 

  // Dados finais retornados após o commit (Hash, Código Curto)
  const [finalData, setFinalData] = useState(null);

  // --- EFEITOS ---
  useEffect(() => {
    if (!token) {
        setError("Token de assinatura inválido ou não fornecido.");
        setCurrentStep(-1);
        return;
    }

    const fetchInitialData = async () => {
      try {
        const response = await api.get(`/sign/${token}`);
        setSummaryData(response.data);
        setCurrentStep(1); // Inicia o fluxo
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError(err.response?.data?.message || 'Link inválido, expirado ou documento não encontrado.');
        setCurrentStep(-1);
      }
    };

    fetchInitialData();
  }, [token]);
  
  // --- NAVEGAÇÃO ---
  const goToNextStep = () => setCurrentStep(prev => prev + 1);
  const goToPrevStep = () => setCurrentStep(prev => prev - 1);

  /**
   * Callback chamado pelo Step 4 quando a assinatura é finalizada com sucesso no backend.
   * Recebe os dados de confirmação (Hash, Protocolo) e avança para a tela de sucesso.
   */
  const handleSignatureComplete = (data) => {
      setFinalData(data); // { shortCode: 'AF3B91', signatureHash: '...', ... }
      goToNextStep(); // Vai para o Step 5
  };

  /**
   * Renderiza o componente do passo atual.
   */
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Carregando
        return (
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-100">
                <Skeleton className="h-8 w-3/4 mb-6" />
                <Skeleton className="h-4 w-1/2 mb-8" />
                <Skeleton className="h-40 w-full" />
                <div className="flex justify-end mt-8"><Skeleton className="h-10 w-24" /></div>
            </div>
        );
      
      case 1: // Resumo
        return <Step1_Summary data={summaryData} onNext={goToNextStep} />;
      
      case 2: // Identificação
        return <Step2_Identify token={token} onNext={goToNextStep} onBack={goToPrevStep} summaryData={summaryData} />;
      
      case 3: // Desenhar Assinatura
        return <Step3_DrawSign onNext={goToNextStep} onBack={goToPrevStep} onSigned={setSignatureImage} />;
      
      case 4: // Verificar OTP e Finalizar
        return (
          <Step4_VerifyOtp 
            token={token} 
            signatureImage={signatureImage} 
            onComplete={handleSignatureComplete} 
            onBack={goToPrevStep} 
          />
        );
      
      case 5: // Sucesso e Código
        return <Step5_Success finalData={finalData} />;
      
      case -1: // Erro
        return (
          <div className="w-full max-w-lg text-center bg-white p-10 rounded-lg shadow-lg border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-[#f1f5f9] p-4">
        
        {/* Logo no Canto Superior Esquerdo */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <Image 
                src="/logo.png" 
                alt="Logo Doculink" 
                width={140} 
                height={32}
                priority
            />
        </div>
        
        {/* Container Central */}
        <div className="w-full max-w-3xl px-4 z-10">
            {renderStep()}
        </div>
    </main>
  );
}