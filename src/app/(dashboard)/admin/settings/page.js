// src/app/(dashboard)/admin/settings/page.js
"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Lock, Smartphone, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
    const [loadingData, setLoadingData] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Estado das Configurações de Integração
    const [settings, setSettings] = useState({
        // Z-API
        zapiInstanceId: "",
        zapiToken: "",
        zapiClientToken: "",
        zapiActive: false,
        
        // Resend
        resendApiKey: "",
        supportEmail: "", 
        resendActive: false
    });

    // Estado da Troca de Senha
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // 1. Buscar configurações ao carregar
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');

                setSettings({
                    zapiInstanceId: data.zapiInstanceId || "",
                    zapiToken: data.zapiToken || "",
                    zapiClientToken: data.zapiClientToken || "",
                    zapiActive: data.zapiActive || false,
                    resendApiKey: data.resendApiKey || "",
                    supportEmail: data.supportEmail || "",
                    resendActive: data.resendActive || false,
                });
            } catch (error) {
                console.error("Erro ao carregar configurações:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchSettings();
    }, []);

    // Handlers de Integração
    const handleSettingChange = (e) => {
        setSettings(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };
    const handleSwitchChange = (field, checked) => {
        setSettings(prev => ({ ...prev, [field]: checked }));
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await api.patch('/settings', settings);
            alert("Integrações salvas com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar configurações.");
        } finally {
            setSavingSettings(false);
        }
    };

    // Handlers de Senha
    const handlePasswordChange = (e) => {
        setPasswordForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setSavingPassword(true);
        try {
            await api.patch('/users/me/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao alterar senha.' });
        } finally {
            setSavingPassword(false);
        }
    };

    const headerLeftContent = (
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
            <p className="text-sm text-muted-foreground">Gerencie integrações e segurança da conta.</p>
        </div>
    );

    return (
        <>
            <Header leftContent={headerLeftContent} actionButtonText={null} />

            <main className="flex-1 p-6 space-y-8">
                
                <Tabs defaultValue="integrations" className="w-full">
                    <TabsList className="bg-white p-1 border h-auto w-full justify-start gap-2 rounded-xl shadow-sm mb-6">
                        <TabsTrigger value="integrations" className="data-[state=active]:bg-gray-100 data-[state=active]:text-blue-700 px-4 py-2 h-10">
                            <Smartphone className="w-4 h-4 mr-2" /> Integrações (API)
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-gray-100 data-[state=active]:text-blue-700 px-4 py-2 h-10">
                            <Lock className="w-4 h-4 mr-2" /> Segurança (Admin)
                        </TabsTrigger>
                    </TabsList>

                    {/* --- ABA: INTEGRAÇÕES --- */}
                    <TabsContent value="integrations" className="space-y-6">
                        
                        {/* Z-API (WhatsApp) */}
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Smartphone className="h-6 w-6 text-green-700" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Z-API (WhatsApp)</CardTitle>
                                            <CardDescription>Configuração para envio de tokens via WhatsApp.</CardDescription>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={settings.zapiActive} 
                                        onCheckedChange={(c) => handleSwitchChange('zapiActive', c)}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="zapiInstanceId">ID da Instância</Label>
                                        <Input 
                                            id="zapiInstanceId" 
                                            placeholder="ex: 3B9F2..." 
                                            value={settings.zapiInstanceId} 
                                            onChange={handleSettingChange} 
                                            disabled={!settings.zapiActive}
                                            className="font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zapiToken">Token da Instância</Label>
                                        <Input 
                                            id="zapiToken" 
                                            type="password" 
                                            placeholder="Security Token..." 
                                            value={settings.zapiToken} 
                                            onChange={handleSettingChange} 
                                            disabled={!settings.zapiActive}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zapiClientToken">Client Token</Label>
                                        <Input 
                                            id="zapiClientToken" 
                                            type="password" 
                                            placeholder="Client Token..." 
                                            value={settings.zapiClientToken} 
                                            onChange={handleSettingChange} 
                                            disabled={!settings.zapiActive}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resend (Email) */}
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-900 rounded-lg">
                                            <Mail className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Resend (E-mail)</CardTitle>
                                            <CardDescription>Configuração para envio de e-mails transacionais.</CardDescription>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={settings.resendActive} 
                                        onCheckedChange={(c) => handleSwitchChange('resendActive', c)}
                                        className="data-[state=checked]:bg-slate-900"
                                    />
                                </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="resendApiKey">
                                            {`API Key (Começa com 're_')`}
                                        </Label>
                                        <Input 
                                            id="resendApiKey" 
                                            type="password"
                                            placeholder="re_123456789..." 
                                            value={settings.resendApiKey} 
                                            onChange={handleSettingChange} 
                                            disabled={!settings.resendActive}
                                            className="font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="supportEmail">Email do Remetente (Verificado no Resend)</Label>
                                        <Input 
                                            id="supportEmail" 
                                            type="email"
                                            placeholder="ex: nao-responda@suaempresa.com" 
                                            value={settings.supportEmail} 
                                            onChange={handleSettingChange} 
                                            disabled={!settings.resendActive}
                                        />
                                        <p className="text-xs text-muted-foreground">Este e-mail aparecerá como remetente para seus clientes.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button 
                                onClick={handleSaveSettings} 
                                disabled={savingSettings || loadingData}
                                size="lg"
                                className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90"
                            >
                                {savingSettings ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar Configurações</>}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* --- ABA: SEGURANÇA (SENHA) --- */}
                    <TabsContent value="security">
                        <Card className="border shadow-sm max-w-2xl">
                            <form onSubmit={handleUpdatePassword}>
                                <CardHeader>
                                    <CardTitle>Alterar Senha</CardTitle>
                                    <CardDescription>Atualize a senha de acesso do administrador atual.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Senha Atual</Label>
                                        <Input 
                                            id="currentPassword" 
                                            type="password" 
                                            required
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                        />
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">Nova Senha</Label>
                                            <Input 
                                                id="newPassword" 
                                                type="password" 
                                                required
                                                placeholder="Mínimo 6 caracteres"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                            <Input 
                                                id="confirmPassword" 
                                                type="password" 
                                                required
                                                placeholder="Repita a nova senha"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordChange}
                                            />
                                        </div>
                                    </div>

                                    {passwordMessage.text && (
                                        <div className={`flex items-center p-3 rounded-md text-sm ${
                                            passwordMessage.type === 'success' 
                                            ? 'bg-green-50 text-green-700' 
                                            : 'bg-red-50 text-red-700'
                                        }`}>
                                            {passwordMessage.type === 'success' ? <CheckCircle2 className="mr-2 h-4 w-4"/> : <AlertCircle className="mr-2 h-4 w-4"/>}
                                            {passwordMessage.text}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-end bg-gray-50/50 p-4 rounded-b-xl">
                                    <Button 
                                        type="submit" 
                                        disabled={savingPassword}
                                        className="bg-gray-900 hover:bg-gray-800 text-white"
                                    >
                                        {savingPassword ? "Atualizando..." : "Atualizar Senha"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}
