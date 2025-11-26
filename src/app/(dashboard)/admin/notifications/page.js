// src/app/(dashboard)/admin/settings/notifications/page.js
"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    Loader2, 
    Save, 
    Mail, 
    Eye, 
    RotateCcw, 
    Variable,
    PenTool,
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Quote
} from "lucide-react";

// Imports do Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Lista de variáveis disponíveis
const SYSTEM_VARIABLES = [
    { category: 'Documento', items: [
        { key: '{{doc_title}}', desc: 'Título do Documento' },
        { key: '{{doc_id}}', desc: 'ID único do Documento' },
        { key: '{{doc_link}}', desc: 'URL para download' },
    ]},
    { category: 'Signatário', items: [
        { key: '{{signer_name}}', desc: 'Nome do Signatário' },
        { key: '{{signer_email}}', desc: 'E-mail do Signatário' },
    ]},
    { category: 'Empresa', items: [
        { key: '{{tenant_name}}', desc: 'Nome da sua Organização' },
    ]}
];

const DEFAULT_TEMPLATE = `
<h2>Documento Finalizado</h2>
<p>Olá, <strong>{{signer_name}}</strong>,</p>
<p>O processo de assinatura do documento {{doc_title}} foi concluído com sucesso.</p>
<p>O documento possui validade jurídica garantida.</p>
<br>
<p>
    <a href="{{doc_link}}">Baixar Documento Assinado</a>
</p>
<br>
<p><small>Enviado por {{tenant_name}} via Doculink. Ref: {{doc_id}}</small></p>
`;

// Componente da Barra de Ferramentas do Tiptap
const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-md">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Negrito"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Itálico"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Tachado"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Título 1"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Título 2"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Título 3"
            >
                <Heading3 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Lista com Marcadores"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Lista Numerada"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-gray-200 text-black' : 'text-gray-600'}
                title="Citação"
            >
                <Quote className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default function NotificationSettingsPage() {
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Configuração do Editor Tiptap
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: '', // Começa vazio, preenchemos no useEffect
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
            },
        },
        onUpdate: ({ editor }) => {
            setHtmlContent(editor.getHTML());
        },
        immediatelyRender: false // <--- CORREÇÃO PARA NEXT.JS (SSR)
    });

    // 1. Carrega configurações iniciais
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                const content = data.finalEmailTemplate || DEFAULT_TEMPLATE;
                setHtmlContent(content);
                
                // Atualiza o editor se ele já estiver montado
                if (editor) {
                    editor.commands.setContent(content);
                }
            } catch (error) {
                console.error("Erro ao carregar template:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [editor]); // Dependência do editor para garantir que setContent funcione

    // 2. Função para inserir variável
    const insertVariable = (variable) => {
        if (editor) {
            editor.chain().focus().insertContent(variable + ' ').run();
        }
    };

    // 3. Salvar Configurações
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings/email-template', { htmlContent });
            alert('Modelo salvo com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar modelo.');
        } finally {
            setSaving(false);
        }
    };

    // 4. Resetar para padrão
    const handleReset = () => {
        if(confirm("Restaurar modelo padrão? Isso apagará suas alterações.")) {
            const content = DEFAULT_TEMPLATE;
            setHtmlContent(content);
            if(editor) editor.commands.setContent(content);
        }
    };

    // 5. Gerar Preview Visual
    const generatePreview = () => {
        if (!htmlContent) return { __html: '' };

        let previewHtml = htmlContent
            .replace(/{{signer_name}}/g, '<span class="var-tag">[Nome Signatário]</span>')
            .replace(/{{signer_email}}/g, '<span class="var-tag">[email@teste.com]</span>')
            .replace(/{{doc_title}}/g, '<span class="var-tag">[Contrato Exemplo.pdf]</span>')
            .replace(/{{doc_link}}/g, '#') 
            .replace(/{{doc_id}}/g, '<span class="var-tag-mono">[UUID-1234]</span>')
            .replace(/{{tenant_name}}/g, '<span class="var-tag">[Sua Empresa]</span>');
        
        return { __html: previewHtml };
    };

    const headerLeft = (
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Configuração de E-mail</h1>
            <p className="text-sm text-muted-foreground">Personalize o e-mail enviado após a conclusão da assinatura.</p>
        </div>
    );

    if (loading) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <>
            {/* Estilos globais para o conteúdo do editor e preview */}
            <style jsx global>{`
                .ProseMirror {
                    min-height: 350px;
                    outline: none;
                }
                .ProseMirror p {
                    margin: 0.5em 0;
                }
                .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
                    font-weight: bold;
                    margin-top: 1em;
                    margin-bottom: 0.5em;
                }
                .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5em;
                }
                .ProseMirror ul { list-style-type: disc; }
                .ProseMirror ol { list-style-type: decimal; }
                
                /* Estilos das variáveis no Preview */
                .var-tag {
                    background-color: #dbeafe;
                    color: #1e40af;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                    font-size: 0.9em;
                    border: 1px solid #93c5fd;
                }
                .var-tag-mono {
                    background-color: #f1f5f9;
                    color: #475569;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    border: 1px solid #cbd5e1;
                    font-size: 0.85em;
                }
                /* Área de Preview */
                .email-body-preview {
                    font-family: sans-serif;
                    line-height: 1.6;
                    color: #334155;
                }
                .email-body-preview a {
                    pointer-events: none;
                    cursor: default;
                    color: #2563eb;
                    text-decoration: underline;
                }
            `}</style>

            <Header leftContent={headerLeft} />
            
            <main className="flex-1 p-6 space-y-6 bg-slate-50/50 h-[calc(100vh-68px)] overflow-y-auto">
                
                {/* 1. BARRA DE VARIÁVEIS */}
                <Card className="border-blue-100 shadow-sm bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Variable className="h-4 w-4 text-blue-600" />
                            Variáveis Dinâmicas
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Clique nos botões abaixo para inserir dados automáticos no texto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6">
                            {SYSTEM_VARIABLES.map((group, idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        {group.category}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map((v) => (
                                            <Badge 
                                                key={v.key} 
                                                variant="secondary" 
                                                className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 border border-gray-200 transition-all px-3 py-1.5 text-xs font-mono active:scale-95"
                                                onClick={() => insertVariable(v.key)}
                                                title={`Inserir ${v.desc}`}
                                            >
                                                {v.key}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* 2. EDITOR WYSIWYG (TIPTAP) */}
                    <Card className="flex flex-col h-full shadow-sm border-gray-200 min-h-[600px]">
                        <CardHeader className="bg-gray-50/50 border-b py-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
                                    <PenTool className="h-4 w-4 text-gray-500" />
                                    Editor de Conteúdo
                                </CardTitle>
                                <Badge variant="outline" className="bg-white font-normal text-gray-500">
                                    Visual
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <div className="flex-1 flex flex-col">
                            <MenuBar editor={editor} />
                            <div className="p-4 flex-1 cursor-text bg-white" onClick={() => editor?.chain().focus().run()}>
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                        
                        <CardFooter className="justify-between border-t p-4 bg-gray-50">
                            <Button variant="ghost" onClick={handleReset} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restaurar Padrão
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 min-w-[140px]">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Salvar Modelo
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* 3. PREVIEW VISUAL */}
                    <Card className="flex flex-col h-full shadow-sm border-gray-200 border-l-4 border-l-blue-500">
                        <CardHeader className="bg-gray-50/50 border-b py-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
                                    <Eye className="h-4 w-4 text-gray-500" />
                                    Como o cliente verá
                                </CardTitle>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                    Simulação
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 bg-slate-100 p-6 overflow-auto max-h-[600px]">
                            {/* Simulação de Cliente de Email */}
                            <div className="mx-auto max-w-[600px] bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 min-h-[400px]">
                                {/* Cabeçalho Fake do Email */}
                                <div className="bg-gray-50 border-b px-6 py-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <span className="text-[10px] text-gray-400">Hoje, 10:30</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm">Assunto: Documento Finalizado: [Contrato]</h3>
                                    <p className="text-xs text-gray-500 mt-1">De: <span className="text-blue-600">noreply@doculink.com.br</span></p>
                                </div>
                                
                                {/* Corpo Renderizado */}
                                <div className="p-8 email-body-preview">
                                    <div dangerouslySetInnerHTML={generatePreview()} />
                                </div>
                            </div>
                            
                            <p className="text-center text-xs text-gray-400 mt-6 max-w-md mx-auto">
                                * Os campos destacados em <span className="bg-blue-100 text-blue-600 px-1 rounded">azul</span> mostram onde os dados reais (nomes, links, datas) serão inseridos automaticamente pelo sistema no momento do envio.
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </>
    );
}