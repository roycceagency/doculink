// src/components/CheckoutDialog/CheckoutDialog.js
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, QrCode, Loader2, Copy, Check } from "lucide-react";

const masks = {
    card: (v) => v.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19),
    expiry: (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5),
    cpf: (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})/, "$1-$2").slice(0, 14),
    phone: (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2").slice(0, 15),
    ccv: (v) => v.replace(/\D/g, "").slice(0, 4),
    cep: (v) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9)
};

export default function CheckoutDialog({ open, onOpenChange, plan, user }) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
    const [pixData, setPixData] = useState(null);
    const [copied, setCopied] = useState(false);
    
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

    // Reset ao abrir
    useEffect(() => {
        if (open) {
            setPixData(null);
            setLoading(false);
            // Pré-preencher dados se user mudar
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    holderName: user.name || "",
                    cpfCnpj: user.cpf ? masks.cpf(user.cpf) : "",
                    phone: user.phoneWhatsE164 ? masks.phone(user.phoneWhatsE164) : ""
                }));
            }
        }
    }, [open, user]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        let formattedValue = value;
        
        if (id === 'number') formattedValue = masks.card(value);
        if (id === 'expiry') formattedValue = masks.expiry(value);
        if (id === 'ccv') formattedValue = masks.ccv(value);
        if (id === 'cpfCnpj') formattedValue = masks.cpf(value);
        if (id === 'phone') formattedValue = masks.phone(value);
        if (id === 'postalCode') formattedValue = masks.cep(value);

        setFormData(prev => ({ ...prev, [id]: formattedValue }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                planSlug: plan.slug,
                billingType: paymentMethod,
            };

            if (paymentMethod === 'CREDIT_CARD') {
                if (!formData.postalCode || formData.postalCode.length < 9) {
                    alert("Por favor, preencha um CEP válido.");
                    setLoading(false);
                    return;
                }

                const [expMonth, expYear] = formData.expiry.split('/');
                
                payload.creditCard = {
                    holderName: formData.holderName,
                    number: formData.number.replace(/\s/g, ""),
                    expiryMonth: expMonth,
                    expiryYear: `20${expYear}`,
                    ccv: formData.ccv
                };
                
                payload.creditCardHolderInfo = {
                    name: formData.holderName,
                    email: user.email,
                    cpfCnpj: formData.cpfCnpj.replace(/\D/g, ""),
                    postalCode: formData.postalCode.replace(/\D/g, ""),
                    addressNumber: formData.addressNumber || "0",
                    phone: formData.phone.replace(/\D/g, "")
                };
            }

            const { data } = await api.post('/subscription', payload);

            if (paymentMethod === 'CREDIT_CARD') {
                alert("Assinatura realizada com sucesso!");
                window.location.reload(); 
            } else if (paymentMethod === 'PIX') {
                if (data.pixInfo) {
                    setPixData(data.pixInfo);
                } else {
                    throw new Error("Erro ao gerar PIX: Dados não recebidos.");
                }
            }

        } catch (error) {
            console.error("Erro no pagamento:", error);
            const msg = error.response?.data?.message || "Erro ao processar pagamento.";
            alert(msg);
        } finally {
            if (paymentMethod !== 'PIX') setLoading(false); 
            else if (!pixData) setLoading(false);
        }
    };

    const copyPixCode = () => {
        if (pixData?.payload) {
            navigator.clipboard.writeText(pixData.payload);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!plan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Assinar Plano {plan?.name}</DialogTitle>
                    <DialogDescription>
                        Valor: <strong>R$ {plan?.price}</strong>/mês. Cobrança segura via Asaas.
                    </DialogDescription>
                </DialogHeader>

                {!pixData ? (
                    <Tabs defaultValue="CREDIT_CARD" onValueChange={setPaymentMethod} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="CREDIT_CARD">
                                <CreditCard className="w-4 h-4 mr-2" /> Cartão
                            </TabsTrigger>
                            <TabsTrigger value="PIX">
                                <QrCode className="w-4 h-4 mr-2" /> PIX
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="CREDIT_CARD" className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="holderName">Nome no Cartão</Label>
                                <Input id="holderName" value={formData.holderName} onChange={handleInputChange} placeholder="Como está no cartão" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="number">Número do Cartão</Label>
                                <Input id="number" value={formData.number} onChange={handleInputChange} placeholder="0000 0000 0000 0000" maxLength={19} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="expiry">Validade (MM/AA)</Label>
                                    <Input id="expiry" value={formData.expiry} onChange={handleInputChange} placeholder="MM/AA" maxLength={5} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ccv">CVC</Label>
                                    <Input id="ccv" value={formData.ccv} onChange={handleInputChange} placeholder="123" maxLength={4} />
                                </div>
                            </div>
                            
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Dados do Titular</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                                    <Input id="cpfCnpj" value={formData.cpfCnpj} onChange={handleInputChange} placeholder="000.000.000-00" maxLength={18} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Celular</Label>
                                    <Input id="phone" value={formData.phone} onChange={handleInputChange} placeholder="(11) 99999-9999" maxLength={15} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="postalCode">CEP</Label>
                                    <Input id="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="00000-000" maxLength={9} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="addressNumber">Número (Endereço)</Label>
                                    <Input id="addressNumber" value={formData.addressNumber} onChange={handleInputChange} placeholder="123" />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="PIX" className="py-4 text-center text-sm text-gray-500">
                            <p>Ao clicar em &quot;Pagar com PIX&quot;, um QR Code será gerado.</p>
                            <p>A liberação do plano ocorre em alguns instantes após o pagamento.</p>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                        <div className="text-center space-y-1">
                            <h3 className="font-semibold text-lg text-green-600">QR Code Gerado!</h3>
                            <p className="text-sm text-muted-foreground">Escaneie para pagar ou use o Copia e Cola.</p>
                        </div>
                        
                        <div className="border-4 border-white shadow-lg rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={`data:image/png;base64,${pixData.encodedImage}`} 
                                alt="QR Code PIX" 
                                className="w-48 h-48 object-contain"
                            />
                        </div>

                        <div className="w-full max-w-xs">
                            <Label className="text-xs text-gray-500 mb-1 block text-left">Pix Copia e Cola</Label>
                            <div className="flex gap-2">
                                <Input readOnly value={pixData.payload} className="h-9 text-xs font-mono bg-gray-50" />
                                <Button size="icon" variant="outline" onClick={copyPixCode} className="shrink-0">
                                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        
                        <p className="text-xs text-gray-400 pt-2">
                           Aguardando confirmação do banco... <br/>
                           A tela atualizará automaticamente ou recarregue a página após pagar.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    {!pixData ? (
                        <Button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {paymentMethod === 'CREDIT_CARD' ? 'Confirmar Assinatura' : 'Gerar QR Code PIX'}
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                            Já realizei o pagamento
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}