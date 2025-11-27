// src/app/layout.js

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// SUBSTITUIR: AuthProvider pelo ClientProviders que criamos acima
import ClientProviders from "../components/providers/ClientProviders"; 
import 'react-international-phone/style.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Doculink",
  description: "Doculink",
};  

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Usamos o ClientProviders para envolver a aplicação com todos os contextos */}
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}