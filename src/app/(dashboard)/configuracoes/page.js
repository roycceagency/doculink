// src/app/(dashboard)/settings/page.js
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthInput } from "@/components/auth/AuthInput"; // Reutilizando nosso componente de input

export default function SettingsPage() {
  return (
    // Esta página não chama o componente <Header />, pois tem seu próprio layout de título.
    <main className="flex-1 p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Configurações</h2>

      <Tabs defaultValue="perfil">
        {/* Usando o mesmo estilo de Tabs da página de Signatários para manter a consistência */}
        <TabsList className="bg-transparent p-0 h-auto">
          <TabsTrigger value="perfil" className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2">
            Perfil
          </TabsTrigger>
          <TabsTrigger value="conta" className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2">
            Conta
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil" className="mt-6">
          <div className="space-y-6">
            {/* Card: Dados do Perfil */}
            <Card className="bg-white shadow-sm rounded-xl border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Dados do perfil</CardTitle>
                <CardDescription>
                  Complete seu cadastro para aproveitar melhor nossos recursos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reutilizando AuthInput para consistência, mas sem a label com '*' */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Nome</label>
                    <AuthInput id="name" type="text" placeholder="Paulo Santos" defaultValue="Paulo Santos" />
                  </div>
                   <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefone</label>
                    <AuthInput id="phone" type="tel" mask="(99) 99999-9999" placeholder="(11) 9546-9781" defaultValue="(11) 9546-9781" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                    <AuthInput id="email" type="email" placeholder="pvconteo@outlook.com" defaultValue="pvconteo@outlook.com" />
                  </div>
                   <div className="space-y-1.5">
                    <label htmlFor="birthdate" className="text-sm font-medium text-gray-700">Data de nascimento</label>
                    <AuthInput id="birthdate" type="text" mask="99/99/9999" placeholder="9/9/1999" defaultValue="09/09/1999" />
                  </div>
                </div>
                <div className="flex justify-end">
                    <Button className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold rounded-lg">
                        Salvar dados pessoais
                    </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card: Alterar Senha */}
            <Card className="bg-white shadow-sm rounded-xl border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Alterar Senha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AuthInput id="current-password" label="Senha atual" type="password" required />
                    <AuthInput id="new-password" label="Nova senha" type="password" required />
                 </div>
                 <div className="flex justify-end">
                    <Button className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold rounded-lg">
                        Atualizar senha
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conta" className="mt-6">
            {/* O conteúdo da aba "Conta" viria aqui */}
            <p>Conteúdo da aba Conta.</p>
        </TabsContent>

      </Tabs>
    </main>
  );
}