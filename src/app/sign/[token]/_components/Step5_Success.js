// src/app/sign/[token]/_components/Step5_Success.js
"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy } from 'lucide-react';

export default function Step5_Success({ finalData }) {
  const router = useRouter();
  const protocol = finalData?.shortCode || '------';

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl border-none p-8 text-center">
      <CardContent className="p-0 flex flex-col items-center gap-6">
        
        <Image src="/sucesso.png" alt="Sucesso" width={80} height={80} />

        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#151928]">
            Assinatura Registrada!
            </h2>
            <p className="text-muted-foreground text-sm">
                O documento foi processado com segurança.
            </p>
        </div>

        {/* Token de Verificação Visual (Estilo PDF Page 8) */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">Token de Verificação</p>
            <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-mono font-bold text-green-800 tracking-widest">{protocol}</span>
            </div>
            <p className="text-[10px] text-green-600 mt-2">
                Use este código para validar a autenticidade no portal.
            </p>
        </div>
        
        <div className="flex gap-4 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open('/validate', '_blank')}
            >
              Validar
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="flex-1 bg-[#1c4ed8] hover:bg-[#1c4ed8]/90"
            >
              Minha Conta
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}