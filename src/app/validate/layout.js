// src/app/validate/layout.js
export const metadata = {
  title: "Validar Documento | Doculink",
  description: "Verifique a autenticidade e integridade de documentos assinados.",
};

export default function ValidateLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      {children}
    </div>
  );
}