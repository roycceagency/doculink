// src/app/(auth)/register/page.js
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AuthInput } from "@/components/auth/AuthInput";

export default function RegisterPage() {
  const router = useRouter(); // <<< INICIALIZAR O HOOK >>>

  // <<< FUNÇÃO PARA NAVEGAR >>>
  const handleNext = () => {
    // Aqui você adicionaria a lógica de validação/envio do formulário
    router.push('/definir-senha');
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-xl border-none p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-3xl font-bold text-[#151928]">
          Cadastre-se grátis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-5">
        <AuthInput
          id="name"
          label="Nome"
          type="text"
          placeholder="Paulo Conte"
          required
        />
        <AuthInput
          id="email"
          label="E-mail"
          type="email"
          placeholder="paulo@grupoconteo.com"
          required
        />
        <AuthInput
          id="cpf"
          label="CPF"
          mask="999.999.999-99"
          placeholder="123.123.123-12"
          required
        />
        <AuthInput
          id="phone"
          label="Celular"
          mask="(99) 99999-9999"
          placeholder="(11) 5555-123"
          required
        />
        <div className="flex items-start space-x-3 pt-2">
          <Checkbox id="terms" className="mt-1" />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-medium text-[#151928] leading-tight"
            >
              Concordo com os Termos de Uso e Política de Privacidade
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-5 p-0 mt-8">
        {/* <<< ADICIONAR O onClick AO BOTÃO >>> */}
        <Button 
          onClick={handleNext} 
          className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold h-10"
        >
          Seguinte
        </Button>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Já tem cadastro? </span>
          <Link href="/login" className="font-medium text-[#151928] hover:underline">
            Acesse sua conta
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}