// src/app/forgot-password/page.js
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowLeft, CheckCircle, Mail, MessageSquare, Timer } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Estados de Controle
  const [step, setStep] = useState("IDENTITY"); // IDENTITY | VERIFY
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dados do Formulário
  const [email, setEmail] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("EMAIL"); // EMAIL ou WHATSAPP
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Timer (Countdown)
  const [timeLeft, setTimeLeft] = useState(0);

  // Efeito para rodar o timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  // Função para solicitar o código (Envia Email ou WhatsApp)
  const handleRequestCode = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { 
        email, 
        channel: selectedChannel 
      });
      
      // Sucesso: Avança etapa e inicia timer
      setStep("VERIFY");
      setTimeLeft(60); // 60 segundos
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao enviar solicitação. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  // Função para reenviar o código (Resend)
  const handleResend = () => {
    if (timeLeft === 0) {
      handleRequestCode();
    }
  };

  // Função para trocar o método (Voltar para etapa 1)
  const handleChangeMethod = () => {
    setStep("IDENTITY");
    setError("");
    setOtp("");
    // Não limpamos o e-mail para facilitar
  };

  // Função final de resetar a senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });
      
      setSuccessMessage("Senha alterada com sucesso! Redirecionando...");
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f1f5f9] p-4">
      <Card className="w-full max-w-md bg-white shadow-lg border-none rounded-xl">
        <CardHeader className="space-y-4 flex flex-col items-center pb-2">
          <div className="mb-2">
            <Image src="/logo.png" alt="Doculink Logo" width={180} height={40} priority />
          </div>
          <CardTitle className="text-2xl font-bold text-[#151928]">
            {step === "IDENTITY" ? "Recuperar Senha" : "Redefinir Senha"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "IDENTITY" 
              ? "Escolha como deseja receber o código de segurança."
              : `Enviamos um código para seu ${selectedChannel === 'EMAIL' ? 'e-mail' : 'WhatsApp'}.`
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {successMessage ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
               <CheckCircle className="h-16 w-16 text-green-500" />
               <h3 className="text-lg font-semibold text-green-700">{successMessage}</h3>
            </div>
          ) : (
            <>
              {/* --- ETAPA 1: IDENTIFICAÇÃO E ESCOLHA --- */}
              {step === "IDENTITY" && (
                <form onSubmit={handleRequestCode} className="space-y-5">
                  <AuthInput
                    id="email"
                    label="Informe seu E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />

                  <div className="space-y-3">
                    <Label className="text-[#151928] font-medium">Enviar código via:</Label>
                    <RadioGroup 
                        defaultValue="EMAIL" 
                        value={selectedChannel} 
                        onValueChange={setSelectedChannel} 
                        className="grid grid-cols-2 gap-4"
                    >
                      {/* Opção Email */}
                      <div>
                        <RadioGroupItem value="EMAIL" id="via-email" className="peer sr-only" />
                        <Label
                          htmlFor="via-email"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-blue-600 cursor-pointer transition-all"
                        >
                          <Mail className="mb-2 h-6 w-6" />
                          E-mail
                        </Label>
                      </div>

                      {/* Opção WhatsApp */}
                      <div>
                        <RadioGroupItem value="WHATSAPP" id="via-whatsapp" className="peer sr-only" />
                        <Label
                          htmlFor="via-whatsapp"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:text-green-600 cursor-pointer transition-all"
                        >
                          <MessageSquare className="mb-2 h-6 w-6" />
                          WhatsApp
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 font-medium text-center bg-red-50 p-2 rounded">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 h-10 mt-2"
                    disabled={loading || !email}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {loading ? "Enviando..." : "Enviar Código"}
                  </Button>
                </form>
              )}

              {/* --- ETAPA 2: VERIFICAÇÃO E NOVA SENHA --- */}
              {step === "VERIFY" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <AuthInput
                    id="otp"
                    label="Código de Verificação (OTP)"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest font-mono"
                    required
                  />

                  <div className="grid gap-4">
                    <AuthInput
                        id="newPassword"
                        label="Nova Senha"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <AuthInput
                        id="confirmPassword"
                        label="Confirme a Nova Senha"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 font-medium text-center bg-red-50 p-2 rounded">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 h-10"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {loading ? "Redefinindo..." : "Alterar Senha"}
                  </Button>

                  {/* SEÇÃO DE REENVIO E TROCA DE MÉTODO */}
                  <div className="pt-4 space-y-3">
                    {/* Botão de Timer / Reenviar */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={handleResend}
                        disabled={timeLeft > 0 || loading}
                    >
                        {timeLeft > 0 ? (
                             <span className="flex items-center text-gray-500">
                                <Timer className="mr-2 h-4 w-4" /> 
                                Reenviar código em {timeLeft}s
                             </span>
                        ) : (
                            "Reenviar Código"
                        )}
                    </Button>

                    {/* Botão de Tentar Outro Método */}
                    <div className="text-center">
                        <button 
                            type="button" 
                            onClick={handleChangeMethod}
                            className="text-sm text-gray-500 hover:text-[#1c4ed8] underline transition-colors"
                        >
                            Não recebeu? Tentar outro método
                        </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="text-center text-sm text-muted-foreground pt-6 border-t mt-6">
            <Link href="/login" className="flex items-center justify-center gap-1 font-bold text-[#151928] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}