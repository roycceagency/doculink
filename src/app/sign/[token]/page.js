// src/app/sign/[token]/page.js
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Importa a função para carregamento dinâmico
import Image from 'next/image';
import api from '@/lib/api'; // Sua instância configurada do Axios

// Componentes para os passos que não precisam de carregamento dinâmico
import Step1_Summary from './_components/Step1_Summary';
import Step2_Identify from './_components/Step2_Identify';
import Step4_VerifyOtp from './_components/Step4_VerifyOtp';
import Step5_Success from './_components/Step5_Success';

// Componente de UI para o estado de carregamento
import { Skeleton } from '@/components/ui/skeleton'; 

// --- Carregamento Dinâmico para o Componente com PDF ---
// Esta é a correção para o erro "Object.defineProperty called on non-object".
// O Next.js só carregará este componente no lado do cliente (navegador).
const Step3_DrawSign = dynamic(
  () => import('./_components/Step3_DrawSign'),
  { 
    // Desabilita a Renderização no Lado do Servidor (SSR) para este componente.
    ssr: false, 
    // Componente de esqueleto a ser exibido enquanto o Step3 está sendo carregado.
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
 * Página principal que gerencia o fluxo de assinatura completo para um signatário.
 * A rota dinâmica `[token]` captura o token de acesso da URL.
 */
export default function SignPage({ params }) {
  const { token } = params;
  
  // Estado para controlar qual passo do fluxo é exibido
  const [currentStep, setCurrentStep] = useState(0); // 0: Carregando, 1-5: Passos, -1: Erro
  const [error, setError] = useState('');
  
  // Estado para armazenar os dados coletados durante o fluxo
  const [summaryData, setSummaryData] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);

  // Efeito para buscar os dados iniciais da API ao carregar a página.
  useEffect(() => {
    if (!token) {
      setError("Token de assinatura não fornecido na URL.");
      setCurrentStep(-1);
      return;
    }

    const fetchInitialData = async () => {
      try {
        // 1. Busca os dados de resumo do documento e do signatário.
        const summaryResponse = await api.get(`/sign/${token}`);
        setSummaryData(summaryResponse.data);
        
        // 2. Busca a URL para download/visualização do PDF.
        const docId = summaryResponse.data.document.id;
        if (!docId) {
            throw new Error("ID do documento não foi retornado pela API.");
        }
        
        // A API de download deve retornar um objeto com uma propriedade 'url'.
        const urlResponse = await api.get(`/documents/${docId}/download?variant=original`);
        setDocumentUrl(urlResponse.data.url);
        
        // 3. Se ambas as requisições foram bem-sucedidas, avança para o primeiro passo.
        setCurrentStep(1);

      } catch (err) {
        // Captura qualquer erro de rede ou da API e exibe uma mensagem amigável.
        setError(err.response?.data?.message || 'Link de assinatura inválido, expirado ou ocorreu um erro inesperado.');
        setCurrentStep(-1);
      }
    };

    fetchInitialData();
  }, [token]);
  
  // Funções de navegação passadas como props para os componentes filhos.
  const goToNextStep = () => setCurrentStep(prev => prev + 1);
  const goToPrevStep = () => setCurrentStep(prev => prev - 1);

  /**
   * Função "roteadora" que renderiza o componente correto com base no estado `currentStep`.
   */
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Estado de Carregamento Inicial
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
      
      case 1: // Resumo do Documento
        return <Step1_Summary data={summaryData} onNext={goToNextStep} />;
      
      case 2: // Identificação do Signatário
        return <Step2_Identify token={token} onNext={goToNextStep} onBack={goToPrevStep} />;
      
      case 3: // Captura e Posicionamento da Assinatura (Componente Dinâmico)
        return (
          <Step3_DrawSign 
            token={token}
            documentUrl={documentUrl} 
            onNext={goToNextStep} 
            onBack={goToPrevStep} 
            onSigned={setSignatureImage} 
          />
        );
      
      case 4: // Verificação com Código OTP
        return (
          <Step4_VerifyOtp 
            token={token} 
            signatureImage={signatureImage} 
            onNext={goToNextStep} 
            onBack={goToPrevStep} 
          />
        );
      
      case 5: // Tela de Sucesso
        return <Step5_Success />;
      
      case -1: // Tela de Erro
        return (
          <div className="w-full max-w-lg text-center bg-white p-10 rounded-lg shadow-lg border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        );
        
      default:
        // Caso padrão para qualquer estado inesperado.
        return null;
    }
  };

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-[#f1f5f9] p-4">
        {/* Logo fixo no canto superior esquerdo */}
        <div className="absolute top-8 left-8">
            <Image src="/logo.png" alt="Doculink Logo" width={140} height={32} />
        </div>
        {/* O container centraliza e define a largura máxima para o conteúdo do passo atual */}
      <div className="w-full max-w-3xl">
        {renderStep()}
      </div>
    </main>
  );
}