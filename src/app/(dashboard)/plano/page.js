// src/app/(dashboard)/plano/page.js
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Zap, CreditCard, Loader2 } from "lucide-react";

// --- UTILITÁRIOS DE MÁSCARA ---
const masks = {
    card: (v) => v.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19),
    expiry: (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5),
    cpf: (v) => v
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .slice(0, 14),
    phone: (v) => v.replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2")
        .slice(0, 15),
    ccv: (v) => v.replace(/\D/g, "").slice(0, 4),
    cep: (v) => v.replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .slice(0, 9),
};

// --- MODAL CHECKOUT SEM PIX ---
function CheckoutDialog({ open, onOpenChange, plan, user }) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        holderName: user?.name || "",
        number: "",
        expiry: "",
        ccv: "",
        cpfCnpj: user?.cpf || "",
        phone: user?.phoneWhatsE164 || "",
        postalCode: "",
        addressNumber: ""
    });

    useEffect(() => {
        if (open) {
            setLoading(false);
        }
    }, [open]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        let formatted = value;

        if (id === "number") formatted = masks.card(value);
        if (id === "expiry") formatted = masks.expiry(value);
        if (id === "ccv") formatted = masks.ccv(value);
        if (id === "cpfCnpj") formatted = masks.cpf(value);
        if (id === "phone") formatted = masks.phone(value);
        if (id === "postalCode") formatted = masks.cep(value);

        setFormData(prev => ({ ...prev, [id]: formatted }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (!formData.postalCode || formData.postalCode.length < 9) {
                alert("Por favor, insira um CEP válido.");
                setLoading(false);
                return;
            }

            const [expMonth, expYear] = formData.expiry.split("/");

            const payload = {
                planSlug: plan.slug,
                billingType: "CREDIT_CARD",
                creditCard: {
                    holderName: formData.holderName,
                    number: formData.number.replace(/\s/g, ""),
                    expiryMonth: expMonth,
                    expiryYear: `20${expYear}`,
                    ccv: formData.ccv
                },
                creditCardHolderInfo: {
                    name: formData.holderName,
                    email: user.email,
                    cpfCnpj: formData.cpfCnpj.replace(/\D/g, ""),
                    postalCode: formData.postalCode.replace(/\D/g, ""),
                    addressNumber: formData.addressNumber || "0",
                    phone: formData.phone.replace(/\D/g, "")
                }
            };

            await api.post("/subscription", payload);

            alert("Assinatura realizada com sucesso!");
            window.location.reload();

        } catch (error) {
            console.error("Erro:", error);
            alert(error.response?.data?.message || "Erro ao processar pagamento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">

                <DialogHeader>
                    <DialogTitle>Assinar Plano {plan?.name}</DialogTitle>
                    <DialogDescription>
                        Valor: <strong>R$ {plan?.price}</strong>/mês.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="CREDIT_CARD" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 mb-4">
                        <TabsTrigger value="CREDIT_CARD">
                            <CreditCard className="w-4 h-4 mr-2" /> Cartão
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="CREDIT_CARD" className="space-y-4">

                        <div className="grid gap-2">
                            <Label>Nome no Cartão</Label>
                            <Input id="holderName" value={formData.holderName} onChange={handleInputChange} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Número do Cartão</Label>
                            <Input id="number" value={formData.number} onChange={handleInputChange} maxLength={19} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Validade (MM/AA)</Label>
                                <Input id="expiry" value={formData.expiry} onChange={handleInputChange} maxLength={5} />
                            </div>
                            <div className="grid gap-2">
                                <Label>CVC</Label>
                                <Input id="ccv" value={formData.ccv} onChange={handleInputChange} maxLength={4} />
                            </div>
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Dados do Titular
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>CPF/CNPJ</Label>
                                <Input id="cpfCnpj" value={formData.cpfCnpj} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Celular</Label>
                                <Input id="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>CEP</Label>
                                <Input id="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Número</Label>
                                <Input id="addressNumber" value={formData.addressNumber} onChange={handleInputChange} />
                            </div>
                        </div>

                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Assinatura
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}

// --- COMPONENTE AUXILIAR DE BARRA DE USO ---
const UsageBar = ({ label, value, total, unit }) => {
    const limit = total || 1;
    const percentage = Math.min((value / limit) * 100, 100);
    const isLimitReached = value >= limit;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className={`text-xs font-bold ${isLimitReached ? "text-red-600" : "text-gray-500"}`}>
                    {value} / {total === 999999 ? "Ilimitado" : total} {unit}
                </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isLimitReached ? "bg-red-500" : "bg-blue-600"}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isLimitReached && (
                <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Limite atingido. Faça upgrade.
                </p>
            )}
        </div>
    );
};

// --- PLANOS ---
const AVAILABLE_PLANS = [
    {
        name: "Gratuito",
        slug: "gratuito",
        price: "0.00",
        features: ["Até 3 Documentos", "1 Usuário", "Acesso disponível sempre", "Validade jurídica"],
        highlight: false
    },
    {
        name: "Básico",
        slug: "basico",
        price: "29.90",
        features: ["Até 20 Documentos", "3 Usuários", "Suporte via WhatsApp", "Armazenamento seguro"],
        highlight: false
    },
    {
        name: "Profissional",
        slug: "profissional",
        price: "49.90",
        features: ["Até 50 Documentos", "5 Usuários", "Templates personalizados", "API básica", "Suporte prioritário"],
        highlight: true,
        tag: "MAIS POPULAR"
    },
    {
        name: "Empresa",
        slug: "empresa",
        price: "79.90",
        features: ["Até 100 Documentos", "10 Usuários", "API completa", "Branding completo", "Suporte dedicado"],
        highlight: false
    }
];

// --- PÁGINA PRINCIPAL ---
export default function PlanPage() {
    const { user } = useAuth();
    const [tenantData, setTenantData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        const fetchTenantData = async () => {
            try {
                const { data } = await api.get("/tenants/my");
                setTenantData(data);
            } catch (error) {
                console.error("Erro ao buscar dados do plano:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTenantData();
    }, []);

    const handleUpgradeClick = (plan) => {
        setSelectedPlan(plan);
        setCheckoutOpen(true);
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Tem certeza que deseja cancelar sua assinatura?")) return;

        try {
            await api.delete("/subscription");
            alert("Assinatura cancelada.");
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || "Erro ao cancelar assinatura.");
        }
    };

    const canManageBilling = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

    const headerLeftContent = (
        <h1 className="text-xl font-semibold text-gray-800">Meu Plano</h1>
    );

    if (loading) {
        return (
            <>
                <Header leftContent={headerLeftContent} actionButtonText="Enviar Documento" />
                <main className="p-6">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </main>
            </>
        );
    }

    const currentPlan = tenantData?.plan;
    const currentSlug = currentPlan?.slug || "gratuito";

    const limits = {
        documents: currentPlan?.documentLimit || 3,
        users: currentPlan?.userLimit || 1
    };

    const usage = {
        documents: tenantData?.usage?.documents || 0,
        users: tenantData?.usage?.users || 0
    };

    return (
        <>
            <Header leftContent={headerLeftContent} actionButtonText="Enviar Documento" />

            <main className="flex-1 p-6 space-y-8">

                {/* SEÇÃO DE USO */}
                <Card className="bg-white shadow-sm border-l-4 border-blue-600">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">Plano Atual: {currentPlan?.name || "Gratuito"}</CardTitle>
                                <CardDescription>Gerencie seus limites abaixo:</CardDescription>
                            </div>

                            {currentSlug !== "gratuito" && canManageBilling && (
                                <Button
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleCancelSubscription}
                                >
                                    Cancelar Assinatura
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <UsageBar label="Documentos Enviados" value={usage.documents} total={limits.documents} unit="docs" />
                            <UsageBar label="Usuários da Equipe" value={usage.users} total={limits.users} unit="usuários" />
                        </div>
                    </CardContent>
                </Card>

                {/* PLANOS */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Planos Disponíveis</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {AVAILABLE_PLANS.map(plan => {
                            const isCurrent = plan.slug === currentSlug;

                            return (
                                <Card
                                    key={plan.slug}
                                    className={`relative flex flex-col ${
                                        isCurrent ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/30" : ""
                                    }`}
                                >
                                    {plan.tag && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-3 py-1 rounded-full">
                                            {plan.tag}
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle>{plan.name}</CardTitle>
                                            {isCurrent && <Badge className="bg-blue-600">Atual</Badge>}
                                        </div>

                                        <div className="mt-2">
                                            <span className="text-3xl font-bold">R$ {plan.price}</span>
                                            <span className="text-gray-500">/mês</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <ul className="space-y-3">
                                            {plan.features.map((f, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        {isCurrent ? (
                                            <Button disabled className="w-full bg-gray-200 text-gray-600 cursor-not-allowed">
                                                Plano Atual
                                            </Button>
                                        ) : (
                                            <Button
                                                disabled={!canManageBilling}
                                                className={`w-full ${plan.highlight ? "bg-purple-600 text-white" : "border border-blue-600 text-blue-600"}`}
                                                onClick={() => handleUpgradeClick(plan)}
                                            >
                                                {canManageBilling ? "Fazer Upgrade" : "Contate o Admin"}
                                                <Zap className="h-4 w-4 ml-2" />
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* MODAL CHECKOUT */}
            <CheckoutDialog
                open={checkoutOpen}
                onOpenChange={setCheckoutOpen}
                plan={selectedPlan}
                user={user}
            />
        </>
    );
}
