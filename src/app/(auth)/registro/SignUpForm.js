"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function SignUpForm() {
  return (
    <Card className="w-full max-w-sm border-0 shadow-lg sm:border sm:shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Cadastre-se grátis</CardTitle>
      </CardHeader>
      {/* <<< INÍCIO DA CORREÇÃO >>> */}
      <CardContent className="grid gap-5"> {/* Aumentado o espaçamento geral */}
        <div className="grid gap-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" type="text" placeholder="m@ejemplo.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" type="email" placeholder="Digite seu e-mail" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input id="cpf" type="text" placeholder="Digite seu CPF" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="celular">Celular *</Label>
          <Input id="celular" type="tel" placeholder="Digite seu celular" required />
        </div>

        {/* Alinhamento do checkbox corrigido */}
        <div className="flex items-start gap-3 pt-1">
          <Checkbox id="terms" required className="mt-0.5" />
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-normal"
          >
            Concordo com os{" "}
            <Link href="#" className="underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="#" className="underline">
              Política de Privacidade
            </Link>
          </Label>
        </div>

        {/* Botão e link agrupados e espaçados */}
        <div className="grid gap-4 pt-2">
          <Button type="submit" className="w-full">
            Seguinte
          </Button>
          <div className="text-center text-sm">
            Já tem cadastro?{" "}
            <Link href="/login" className="underline">
              Acesse sua conta
            </Link>
          </div>
        </div>
      </CardContent>
      {/* <<< FIM DA CORREÇÃO >>> */}
    </Card>
  )
}