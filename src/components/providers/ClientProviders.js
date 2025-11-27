// src/components/providers/ClientProviders.js
"use client";

import { AuthProvider } from "@/context/AuthContext";
import { PlanLimitProvider } from '../../context/PlanLimitContext';
import { TenantProvider } from "../../context/TenantContext"; // <--- Importe aqui
import UpgradeModal from '@/components/UpgradeModal/UpgradeModal';

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <PlanLimitProvider>
        <TenantProvider> {/* <--- Adicione aqui */}
          <UpgradeModal />
          {children}
        </TenantProvider>
      </PlanLimitProvider>
    </AuthProvider>
  );
}