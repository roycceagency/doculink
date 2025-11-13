// src/app/sign/[token]/page.js
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';

// Importa os componentes para cada passo do fluxo
import Step1_Summary from './_components/Step1_Summary';
import Step2_Identify from './_components-Step2_Identify';
import Step4_VerifyOtp from './_components-Step4_VerifyOtp';
import Step5_Success from './_components-Step5_Success';

// Importa o componente de UI para exibir o estado de carregamento
import { Skeleton } from '@/components/ui/skeleton'; 

// Carrega dinamicamente o componente que usa a biblioteca de PDF para evitar erros de SSR
const Step3_DrawSign = dynamic(
  () => import('./_components-Step3_DrawSign'),
  { 
    ssr: false, // Garante que o componente só seja renderizado no cliente
    loading: () => ( // Exibe um esqueleto de UI enquanto o componente é carregado
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <Skeleton className="h-96 w-full" />
      </div>
    )
  }
);

/**
 * Página principal que gerencia o fluxo de assinatura completo para um signatário.
 */
export default function SignPage() {
  const params = useParams(); // Hook correto para acessar parâmetros de rota em "use client"
  const token = params.token;
  
  // Estado para controlar o passo atual do fluxo
  const [currentStep, setCurrentStep] = useState(0); // 0: Carregando, 1-5: Passos, -1: Erro
  const [error, setError] = useState('');
  
  // Estado para armazenar os dados coletados durante o fluxo
  const [summaryData, setSummaryData] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);

  // Efeito para buscar os dados iniciais da API ao carregar a página ou quando o token mudar.
  useEffect(() => {
    // Se o token ainda não estiver disponível (primeira renderização), não faz nada.
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        // Realiza uma única chamada à API para obter todos os dados necessários.
        const response = await api.get(`/sign/${token}`);
        
        // Armazena os dados nos respectivos estados.
        setSummaryData(response.data);
        setDocumentUrl(response.data.document.url); // A URL do documento agora vem na mesma resposta
        
        // Avança para o primeiro passo do fluxo.
        setCurrentStep(1);
      } catch (err) {
        // Em caso de erro, define a mensagem e o estado de erro.
        setError(err.response?.data?.message || 'Link inválido, expirado ou ocorreu um erro inesperado.');
        setCurrentStep(-1);
      }
    };

    fetchInitialData();
  }, [token]);
  
  // Funções de navegação
  const goToNextStep = () => setCurrentStep(prev => prev + 1);
  const goToPrevStep = () => setCurrentStep(prev => prev - 1);

  /**
   * Renderiza o componente correspondente ao passo atual.
   */
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Carregamento
        return (
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
                <Skeleton className="h-8 w-3/4 mb-6" />
                <Skeleton className="h-4 w-1/2 mb-8" />
                <Skeleton className="h-40 w-full" />
                <div className="flex justify-end mt-8">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
      
      case 1: // Resumo
        return <Step1_Summary data={summaryData} onNext={goToNextStep} />;
      
      case 2: // Identificação
        return <Step2_Identify token={token} onNext={goToNextStep} onBack={goToPrevStep} />;
      
      case 3: // Assinatura (Desenho e Posicionamento)
        return (
          <Step3_DrawSign 
            token={token}
            documentUrl={documentUrl} 
            onNext={goToNextStep} 
            onBack={goToPrevStep} 
            onSigned={setSignatureImage} 
          />
        );
      
      case 4: // Verificação OTP
        return (
          <Step4_VerifyOtp 
            token={token} 
            signatureImage={signatureImage} 
            onNext={goToNextStep} 
            onBack={goToPrevStep} 
          />
        );
      
      case 5: // Sucesso
        return <Step5_Success />;
      
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
        {/* Logo da Aplicação */}
        <div className="absolute top-8 left-8">
            <Image src="/logo.png" alt="Doculink Logo" width={140} height={32} />
        </div>
        
        {/* Container que centraliza o conteúdo do passo atual */}
      <div className="w-full max-w-3xl">
        {renderStep()}
      </div>
    </main>
  );
}