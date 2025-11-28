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
import { Input } from "@/components/ui/input"; // Importando Input diretamente para customizar o layout do telefone

// Lista de países com Bandeira e DDI
const countryCodes = [
  { name: "Brasil", code: "+55", flag: "🇧🇷" },
  { name: "Estados Unidos", code: "+1", flag: "🇺🇸" },
  { name: "Portugal", code: "+351", flag: "🇵🇹" },
  { name: "Reino Unido", code: "+44", flag: "🇬🇧" },
  { name: "Espanha", code: "+34", flag: "🇪🇸" },
  { name: "França", code: "+33", flag: "🇫🇷" },
  { name: "Alemanha", code: "+49", flag: "🇩🇪" },
  { name: "Itália", code: "+39", flag: "🇮🇹" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Uruguai", code: "+598", flag: "🇺🇾" },
  { name: "Paraguai", code: "+595", flag: "🇵🇾" },
  { name: "Chile", code: "+56", flag: "🇨🇱" },
  { name: "Colômbia", code: "+57", flag: "🇨🇴" },
  { name: "México", code: "+52", flag: "🇲🇽" },
  { name: "Canadá", code: "+1", flag: "🇨🇦" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    password: "",
  });
  
  // Estado para o DDI selecionado (Padrão Brasil)
  const [selectedDDI, setSelectedDDI] = useState("+55");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Função para lidar com a troca de país
  const handleCountryChange = (e) => {
    const newDDI = e.target.value;
    setSelectedDDI(newDDI);
    
    // Atualiza o input de telefone com o novo DDI
    // Mantém o que o usuário já digitou se ele apenas trocou a bandeira,
    // ou apenas seta o DDI se estiver vazio.
    const currentPhone = formData.phone;
    
    // Se o telefone já começar com um DDI (ex: +1), removemos e colocamos o novo
    // Se estiver vazio, apenas coloca o DDI
    if (!currentPhone) {
        setFormData({ ...formData, phone: newDDI + " " });
    } else {
        // Lógica simples: substitui o prefixo ou adiciona na frente
        // Aqui optamos por limpar e setar o DDI para garantir formato correto
        setFormData({ ...formData, phone: newDDI + " " });
    }
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

            {/* SEÇÃO DE TELEFONE CUSTOMIZADA */}
            <div className="space-y-2">
                <Label htmlFor="phone">Celular (Whatsapp)</Label>
                <div className="flex w-full items-center gap-2">
                    {/* Select de Bandeiras */}
                    <div className="relative">
                        <select
                            className="h-10 w-[80px] appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-center"
                            value={selectedDDI}
                            onChange={handleCountryChange}
                        >
                            {countryCodes.map((country) => (
                                <option key={country.name} value={country.code}>
                                    {country.flag} {country.code}
                                </option>
                            ))}
                        </select>
                        {/* Ícone customizado de seta para baixo pode ser adicionado aqui com CSS, 
                            mas o select nativo já resolve bem mobile/desktop */}
                    </div>

                    {/* Input de Telefone */}
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+55 11 99999-9999"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1"
                    />
                </div>
            </div>

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