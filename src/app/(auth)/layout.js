// src/app/(auth)/layout.js

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f1f5f9]">
      {children}
    </main>
  );
}