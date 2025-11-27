// src/contexts/PlanLimitContext.js
"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const PlanLimitContext = createContext({});

export const PlanLimitProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [limitType, setLimitType] = useState(null); // 'DOCUMENTS', 'USERS', 'PAYMENT', 'GENERIC'

  // Função que processa a mensagem e define o tipo do modal
  const handleTrigger = useCallback((message) => {
    let type = 'GENERIC';
    const msgLower = message ? message.toLowerCase() : '';

    if (msgLower.includes('documentos') || msgLower.includes('document limit')) {
      type = 'DOCUMENTS';
    } else if (msgLower.includes('usuários') || msgLower.includes('user limit')) {
      type = 'USERS';
    } else if (msgLower.includes('assinatura') || msgLower.includes('pagamento') || msgLower.includes('regularize')) {
      type = 'PAYMENT';
    }

    setLimitType(type);
    setIsOpen(true);
  }, []);

  const closeLimitModal = useCallback(() => {
    setIsOpen(false);
    setLimitType(null);
  }, []);

  // --- OUVINTE DE EVENTOS (A Mágica) ---
  useEffect(() => {
    const handleEvent = (event) => {
      const message = event.detail?.message || '';
      handleTrigger(message);
    };

    // Adiciona o ouvinte
    if (typeof window !== 'undefined') {
      window.addEventListener('TRIGGER_UPGRADE_MODAL', handleEvent);
    }

    // Remove o ouvinte ao desmontar
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('TRIGGER_UPGRADE_MODAL', handleEvent);
      }
    };
  }, [handleTrigger]);

  return (
    <PlanLimitContext.Provider value={{ isOpen, limitType, triggerLimitModal: handleTrigger, closeLimitModal }}>
      {children}
    </PlanLimitContext.Provider>
  );
};

export const usePlanLimit = () => useContext(PlanLimitContext);