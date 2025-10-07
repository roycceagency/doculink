// src/app/(auth)/subscribe/page.js
"use client"

import Link from "next/link";
import { useRouter } from "next/navigation"; // <<< IMPORTAR >>>
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthInput } from "@/components/auth/AuthInput";

export default function SubscribePage() {
  const router = useRouter(); // <<< INICIALIZAR O HOOK >>>

  // <<< FUNÇÃO PARA NAVEGAR >>>
  const handleCreateAccount = () => {
    // Aqui você adicionaria a lógica de validação/envio do formulário
    router.push('/onboarding');
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-xl border-none p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-2xl font-bold text-[#151928]">
          Crie sua senha
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-5">
        <AuthInput
          id="password"
          label="Senha"
          type="password"
          required
        />
        <AuthInput
          id="confirm-password"
          label="Confirme sua senha"
          type="password"
          required
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-4 p-0 mt-8">
        {/* <<< ADICIONAR O onClick AO BOTÃO >>> */}
        <Button 
          onClick={handleCreateAccount} 
          className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold h-10"
        >
          Criar conta
        </Button>
        <Button asChild variant="outline" className="w-full h-10">
          <Link href="/login">Cancelar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}