// src/app/onboarding/layout.js

export default function OnboardingLayout({ children }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f1f5f9] p-4">
      {children}
    </main>
  );
}