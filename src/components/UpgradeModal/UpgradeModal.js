// src/components/UpgradeModal/UpgradeModal.js
import React, { useState } from 'react';
import styles from './UpgradeModal.module.css';
import { usePlanLimit } from '../../context/PlanLimitContext';
import { useAuth } from '../../context/AuthContext'; // Importar AuthContext
import CheckoutDialog from '../CheckoutDialog/CheckoutDialog'; // Importar o novo componente

// Componentes UI (Shadcn/Tailwind)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, CreditCard, Zap } from "lucide-react";

// Mesmos planos da página /plano para consistência
const PLANS = [
  {
    name: 'Básico',
    price: '29.90',
    slug: 'basico',
    features: ['Até 3 usuários', '20 Documentos/mês', 'Suporte WhatsApp'],
    highlight: false
  },
  {
    name: 'Profissional',
    price: '49.90',
    slug: 'profissional',
    features: ['Até 5 usuários', '50 Documentos/mês', 'Templates'],
    highlight: true, // Recomendado
    tag: 'POPULAR'
  },
  {
    name: 'Empresa',
    price: '79.90',
    slug: 'empresa',
    features: ['Até 10 usuários', '100 Documentos/mês', 'API Completa'],
    highlight: false
  }
];

export default function UpgradeModal() {
  const { isOpen, limitType, closeLimitModal } = usePlanLimit();
  const { user } = useAuth();
  
  // Estado local para controlar o checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Se o contexto diz que está fechado, não renderiza nada
  if (!isOpen && !isCheckoutOpen) return null;

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true); 
    // Nota: Não chamamos closeLimitModal() aqui manualmente. 
    // Controlamos a visibilidade do primeiro modal via prop 'open={isOpen && !isCheckoutOpen}'
  };

  const handleCheckoutClose = (isOpenStatus) => {
    setIsCheckoutOpen(isOpenStatus);
    if (!isOpenStatus) {
        // Se fechou o checkout, fecha tudo (inclusive o aviso de limite)
        closeLimitModal();
    }
  };

  // Textos dinâmicos baseados no erro
  let icon = <Lock className="h-12 w-12 text-red-500 bg-red-100 p-2 rounded-full mx-auto" />;
  let title = "Limite Atingido";
  let description = "Você atingiu o limite do seu plano atual.";

  if (limitType === 'DOCUMENTS') {
    title = "Mais documentos?";
    description = "Você atingiu o limite de envio do seu plano atual. Faça um upgrade para continuar operando sem pausas.";
  } else if (limitType === 'USERS') {
    title = "Sua equipe cresceu!";
    description = "Para adicionar mais membros, você precisa de um plano que comporte o tamanho do seu time.";
  } else if (limitType === 'PAYMENT') {
    icon = <CreditCard className="h-12 w-12 text-yellow-600 bg-yellow-100 p-2 rounded-full mx-auto" />;
    title = "Assinatura Pendente";
    description = "Identificamos uma pendência no pagamento. Regularize para desbloquear todos os recursos.";
  }

  return (
    <>
      {/* 1. MODAL DE AVISO DE LIMITE (UPGRADE) */}
      <Dialog 
        // O segredo está aqui: Só mostra se o contexto mandar E se o checkout NÃO estiver aberto
        open={isOpen && !isCheckoutOpen} 
        onOpenChange={closeLimitModal}
      >
        <DialogContent className="sm:max-w-[900px] bg-[#F8FAFC]">
          <DialogHeader className="text-center space-y-4 pt-4">
            <div>{icon}</div>
            <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
            <DialogDescription className="text-base text-gray-600 max-w-md mx-auto">
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Conteúdo: Regularizar ou Escolher Plano */}
          <div className="py-6">
            {limitType === 'PAYMENT' ? (
               <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8"
                    onClick={() => window.location.href = '/plano'}
                  >
                    Ir para Faturamento
                  </Button>
               </div>
            ) : (
              // GRID DE PLANOS
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <Card 
                    key={plan.slug} 
                    className={`relative flex flex-col border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                      plan.highlight 
                        ? 'border-blue-500 shadow-md ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
                            {plan.tag}
                        </div>
                    )}

                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-lg font-semibold text-gray-800">{plan.name}</CardTitle>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-gray-900">R$ {plan.price}</span>
                            <span className="text-gray-500 text-xs">/mês</span>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                        <ul className="space-y-2">
                            {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </CardContent>

                    <CardFooter>
                        <Button 
                            className={`w-full ${
                                plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                            }`}
                        >
                            Escolher <Zap className="ml-2 h-3 w-3" />
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. MODAL DE CHECKOUT (SOBREPÕE OU SUBSTITUI VISUALMENTE) */}
      <CheckoutDialog 
        open={isCheckoutOpen} 
        onOpenChange={handleCheckoutClose}
        plan={selectedPlan}
        user={user}
      />
    </>
  );
}