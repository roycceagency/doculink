"use client";

import { useTenant } from "../context/TenantContext";
import { usePlanLimit } from "../context/PlanLimitContext";

export function useLimitCheck() {
  const { tenant } = useTenant();
  const { triggerLimitModal } = usePlanLimit();

  /**
   * Verifica se pode realizar a ação.
   * Retorna TRUE se estiver liberado.
   * Retorna FALSE e abre o modal se estiver bloqueado.
   * @param {'DOCUMENTS' | 'USERS'} feature 
   */
  const checkLimit = (feature) => {
    if (!tenant || !tenant.plan) return true; // Se não carregou, deixa passar (o backend barra depois)

    const isFree = parseFloat(tenant.plan.price) <= 0;
    
    // 1. Validação de Pagamento (Apenas para planos pagos)
    if (!isFree) {
        if (tenant.subscriptionStatus === 'OVERDUE' || tenant.subscriptionStatus === 'CANCELED') {
            triggerLimitModal('Sua assinatura está irregular. Regularize o pagamento.');
            return false;
        }
    }

    // 2. Validação de Documentos
    if (feature === 'DOCUMENTS') {
        // tenant.usage.documents vem do backend
        if (tenant.usage.documents >= tenant.plan.documentLimit) {
            triggerLimitModal(`Limite de documentos atingido (${tenant.usage.documents}/${tenant.plan.documentLimit}). Faça upgrade.`);
            return false;
        }
    }

    // 3. Validação de Usuários
    if (feature === 'USERS') {
        // tenant.usage.users vem do backend
        if (tenant.usage.users >= tenant.plan.userLimit) {
            triggerLimitModal(`Limite de usuários atingido (${tenant.usage.users}/${tenant.plan.userLimit}). Faça upgrade.`);
            return false;
        }
    }

    return true; // Liberado
  };

  return { checkLimit };
}