// src/app/send/_components/Step3_Configure.js
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Para formatar a data em português

export default function Step3_Configure({ onNext, onBack, config, setConfig }) {
  
  /**
   * Atualiza uma propriedade específica no estado de configuração.
   * @param {string} field - O nome da propriedade a ser alterada.
   * @param {any} value - O novo valor.
   */
  const updateConfig = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-white shadow-lg rounded-xl border-none p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-3xl font-bold text-[#151928]">Configurações</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 space-y-8">
        
        {/* --- SELETOR DE DATA --- */}
        <div className="space-y-2">
          <Label htmlFor="deadline" className="text-base font-medium text-gray-700">
            Data limite para assinaturas
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="deadline"
                variant={"outline"}
                className="w-full justify-start text-left font-normal h-12 text-base bg-[#1c4ed8] text-white hover:bg-[#1c4ed8]/90 hover:text-white border-0"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {config.deadlineAt ? (
                  format(new Date(config.deadlineAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={config.deadlineAt ? new Date(config.deadlineAt) : null}
                onSelect={(date) => updateConfig('deadlineAt', date)}
                initialFocus
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Desabilita datas passadas
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* --- CHECKBOXES DE OPÇÕES --- */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="autoReminders"
              checked={config.autoReminders || false}
              onCheckedChange={(checked) => updateConfig('autoReminders', checked)}
            />
            <Label
              htmlFor="autoReminders"
              className="text-base font-medium text-gray-800"
            >
              Lembretes automáticos por email
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox 
              id="readConfirmation"
              checked={config.readConfirmation || false}
              onCheckedChange={(checked) => updateConfig('readConfirmation', checked)}
            />
            <Label
              htmlFor="readConfirmation"
              className="text-base font-medium text-gray-800"
            >
              Confirmar leitura de documento
            </Label>
          </div>
        </div>

      </CardContent>

      <CardFooter className="flex justify-between p-0 mt-10">
        <Button variant="outline" onClick={onBack} className="h-10">
          Anterior
        </Button>
        <Button onClick={onNext} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 h-10">
          Próximo
        </Button>
      </CardFooter>
    </Card>
  );
}