// src/app/(auth)/login/page.js
"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthInput } from "@/components/auth/AuthInput";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Aqui viria a sua lógica de autenticação (verificar email e senha)
    // Após a autenticação bem-sucedida, redireciona para o onboarding.
    router.push('/onboarding');
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-xl border-none p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-3xl font-bold text-[#151928]">
          Acesse sua conta
        </CardTitle>
        <CardDescription className="text-base pt-2">
          Bem vindo de volta!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-5">
        <AuthInput
          id="email"
          label="E-mail"
          type="email"
          placeholder="paulo@grupoconteo.com"
          required
        />
        <AuthInput
          id="password"
          label="Senha"
          type="password"
          required
        />
        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password" // Você pode criar esta página depois
            className="text-sm font-medium text-[#151928] hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-5 p-0 mt-8">
        <Button 
          onClick={handleLogin} 
          className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold h-10"
        >
          Entrar
        </Button>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Não tem uma conta? </span>
          <Link href="/register" className="font-medium text-[#151928] hover:underline">
            Crie sua conta
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}