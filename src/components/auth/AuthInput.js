// src/components/auth/AuthInput.js
"use client"

import * as React from "react";
// <<< REMOVER IMPORT DO InputMask >>>
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// <<< ADICIONAR FUNÇÃO DE MÁSCARA >>>
const applyMask = (value, mask) => {
  let i = 0;
  const v = value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
  return mask.replace(/9/g, () => v[i++] || ""); // Substitui cada '9' na máscara por um dígito
};


export function AuthInput({ id, label, type = "text", mask, required, onChange, ...props }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";

  // <<< ADICIONAR ESTADO PARA O VALOR DO INPUT >>>
  const [currentValue, setCurrentValue] = React.useState("");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  // <<< CRIAR HANDLER PARA A MUDANÇA DE VALOR >>>
  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    if (mask) {
      const maskedValue = applyMask(rawValue, mask);
      setCurrentValue(maskedValue);
      // Opcional: chamar o onChange do pai com o valor mascarado
      if (onChange) {
        e.target.value = maskedValue;
        onChange(e);
      }
    } else {
      setCurrentValue(rawValue);
      if (onChange) {
        onChange(e);
      }
    }
  };

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[#151928] font-medium">
        {label} *
      </Label>
      <div className="relative">
        {/* <<< USAR SEMPRE O INPUT PADRÃO E CONTROLAR SEU ESTADO >>> */}
        <Input
          id={id}
          type={inputType}
          required={required}
          value={currentValue}
          onChange={handleInputChange}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}