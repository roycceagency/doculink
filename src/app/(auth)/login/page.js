// src/app/login/page.js
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f1f5f9] p-4">
      <Card className="w-full max-w-md bg-white shadow-lg border-none rounded-xl">
        <CardHeader className="space-y-4 flex flex-col items-center pb-2">
          {/* LOGO ADICIONADO NO TOPO */}
          <div className="mb-2">
            <Image 
              src="/logo.png" 
              alt="Doculink Logo" 
              width={180} 
              height={40} 
              priority 
            />
          </div>
          <CardTitle className="text-2xl font-bold text-[#151928]">
            Acesse sua conta
          </CardTitle>
          <CardDescription>Bem vindo de volta!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              onChange={handleChange}
            />
            <div className="space-y-1">
              <AuthInput
                id="password"
                label="Senha"
                type="password"
                required
                onChange={handleChange}
              />
              {/* TEXTO CENTRALIZADO CONFORME SOLICITADO */}
              <div className="flex justify-center pt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-muted-foreground hover:text-primary"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 mt-2"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Não tem uma conta?{" "}
              <Link href="/registro" className="font-bold text-[#151928] hover:underline">
                Crie sua conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}