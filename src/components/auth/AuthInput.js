// src/components/auth/AuthInput.js
"use client"

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const applyMask = (value, mask) => {
  let i = 0;
  const v = value.replace(/\D/g, "");
  return mask.replace(/9/g, () => v[i++] || "");
};

export function AuthInput({ id, label, type = "text", mask, required, onChange, ...props }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";
  const [currentValue, setCurrentValue] = React.useState("");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    if (mask) {
      const maskedValue = applyMask(rawValue, mask);
      setCurrentValue(maskedValue);
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
        {label} {required && "*"}
      </Label>
      <div className="relative">
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
            {/* LÓGICA DO ÍCONE INVERTIDA CONFORME SOLICITADO */}
            {showPassword ? (
              <EyeIcon className="size-4" /> // Senha visível = Ícone de olho aberto
            ) : (
              <EyeOffIcon className="size-4" /> // Senha oculta (padrão) = Ícone de olho fechado
            )}
          </button>
        )}
      </div>
    </div>
  );
}