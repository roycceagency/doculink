// src/app/register/page.js
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    password: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(formData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f1f5f9] p-4 py-8">
      <Card className="w-full max-w-md bg-white shadow-lg border-none rounded-xl">
        <CardHeader className="space-y-2 flex flex-col items-center pb-2">
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
            Cadastre-se grátis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              id="name"
              label="Nome Completo"
              placeholder="Seu nome completo"
              required
              onChange={handleChange}
            />
            <AuthInput
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              onChange={handleChange}
            />
            <AuthInput
              id="cpf"
              label="CPF"
              mask="999.999.999-99"
              placeholder="000.000.000-00"
              required
              onChange={handleChange}
            />

            {/* TELEFONE SEM MÁSCARA */}
            <AuthInput
              id="phone"
              label="Celular"
              placeholder="+55 11 99999-9999"
              required
              onChange={handleChange}
            />

            <AuthInput
              id="password"
              label="Crie uma Senha"
              type="password"
              required
              onChange={handleChange}
            />

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={setTermsAccepted}
              />
              <Label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground font-normal">
                Concordo com os{" "}
                <a 
                  href="https://doculink.com.br/blog/2025/11/17/termos-de-uso/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-[#151928] hover:underline"
                >
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a 
                  href="https://doculink.com.br/blog/2025/11/17/politica-de-privacidade/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-[#151928] hover:underline"
                >
                  Política de Privacidade
                </a>
              </Label>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 mt-4"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Já tem cadastro?{" "}
              <Link href="/login" className="font-bold text-[#151928] hover:underline">
                Acesse sua conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
