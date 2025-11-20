// src/app/send/page.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext"; // Importa o AuthContext

// Importa os componentes para cada passo do fluxo
import Step1_Upload from './_components/Step1_Upload';
import Step2_AddSigners from './_components/Step2_AddSigners';
import Step3_Configure from './_components/Step3_Configure';
import Step4_Send from './_components/Step4_Send';
import Step5_SendSuccess from './_components/Step5_SendSuccess';

// Importa componentes de UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, ArrowRight } from "lucide-react";

const STEPS = [
  { number: 1, label: "Adicionar Documentos" },
  { number: 2, label: "Adicionar signatários" },
  { number: 3, label: "Configuração" },
  { number: 4, label: "Enviar" },
  { number: 5, label: "Concluído" },
];

export default function SendDocumentFlow() {
  const { user, loading } = useAuth(); // Pega o usuário para validar
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const [document, setDocument] = useState(null);
  const [signers, setSigners] = useState([]);
  const [config, setConfig] = useState({
    deadlineAt: new Date(new Date().setDate(new Date().getDate() + 7)), 
    autoReminders: false,
    readConfirmation: false,
  });

  const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const goToPrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleCancel = () => router.push('/dashboard');
  const handleSendSuccess = () => setCurrentStep(5);

  // --- ESTADO DE CARREGAMENTO ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Skeleton className="h-[400px] w-[600px] rounded-xl" />
      </div>
    );
  }

  // --- BLOQUEIO PARA VISUALIZADOR ---
  if (user?.role === 'VIEWER') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] p-4">
        <Card className="w-full max-w-md text-center p-8 shadow-lg border-none">
            <CardContent className="flex flex-col items-center space-y-6 pt-4">
                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                    <Lock className="h-10 w-10 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">Acesso Restrito</h2>
                    <p className="text-gray-500">
                        Seu perfil atual <strong>(Visualizador)</strong> não tem permissão para enviar documentos.
                    </p>
                </div>
                <Button 
                    onClick={() => router.push('/onboarding')} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Trocar de Perfil <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                    Voltar ao Dashboard
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDERIZAÇÃO NORMAL DO FLUXO ---

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_Upload 
                 onNext={goToNextStep} 
                 onDocumentUploaded={setDocument} 
                 onCancel={handleCancel} 
               />;
      case 2:
        return <Step2_AddSigners 
                 onNext={goToNextStep} 
                 onBack={goToPrevStep} 
                 signers={signers} 
                 setSigners={setSigners} 
               />;
      case 3:
        return <Step3_Configure 
                 onNext={goToNextStep} 
                 onBack={goToPrevStep} 
                 config={config} 
                 setConfig={setConfig} 
               />;
      case 4:
        return <Step4_Send 
                 document={document} 
                 signers={signers} 
                 config={config} 
                 onBack={goToPrevStep}
                 onSuccess={handleSendSuccess} 
               />;
      case 5:
        return <Step5_SendSuccess />;
      default:
        return null;
    }
  };

  const headerContent = (
    <div className="flex items-center gap-4 sm:gap-8">
        <div className="hidden sm:block">
            <Image src="/logo.png" alt="Doculink Logo" width={140} height={32} />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
            {STEPS.map(step => (
              step.number <= 4 && (
                <div key={step.number} className={`flex items-center gap-2 text-sm ${currentStep >= step.number ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                    <div className={`flex items-center justify-center size-6 rounded-full transition-colors ${currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {step.number}
                    </div>
                    <span className="hidden md:inline">{step.label}</span>
                </div>
              )
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <header className="flex h-[68px] items-center justify-between bg-white px-4 sm:px-6 border-b shrink-0">
        {headerContent}
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Sair</Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-3xl">
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
}