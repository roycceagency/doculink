"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "@/lib/api"; // Seu axios configurado
import { useAuth } from "../context/AuthContext";

const TenantContext = createContext({});

export const TenantProvider = ({ children }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Busca dados atualizados do Tenant (Plano + Uso)
  const refreshTenant = useCallback(async () => {
    if (!user) return;
    try {
      // O endpoint /tenants/my deve retornar o objeto usage: { users: X, documents: Y }
      // Certifique-se que seu Backend (tenant.controller.js -> getMyTenant) está retornando isso.
      const { data } = await api.get("/tenants/my");
      setTenant(data);
    } catch (error) {
      console.error("Erro ao buscar dados do tenant:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Atualiza ao carregar
  useEffect(() => {
    refreshTenant();
  }, [refreshTenant]);

  return (
    <TenantContext.Provider value={{ tenant, loading, refreshTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);