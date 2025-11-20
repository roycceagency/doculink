// src/app/validate/page.js
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    CheckCircle2, 
    XCircle, 
    UploadCloud, 
    FileText, 
    ShieldCheck, 
    Fingerprint,
    ArrowLeft,
    Search
} from 'lucide-react';

export default function ValidatePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile?.type !== 'application/pdf') {
        setError("Apenas arquivos PDF são aceitos.");
        return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
      onDrop, 
      multiple: false,
      accept: { 'application/pdf': ['.pdf'] } 
  });

  const handleValidate = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/documents/validate-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data); 
    } catch (err) {
      // Se der erro 404 ou outro, mostramos como inválido
      if (err.response && err.response.data) {
          setResult(err.response.data);
      } else {
          setError("Erro de conexão ao validar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
      setFile(null);
      setResult(null);
      setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-slate-50">
      
      <div className="mb-8 text-center">
        <Image src="/logo.png" alt="Doculink" width={160} height={40} className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Validador de Assinatura</h1>
        <p className="mt-2 text-gray-600">
            Envie o arquivo para confirmar se ele foi assinado digitalmente pela nossa plataforma.
        </p>
      </div>

      <Card className="w-full max-w-2xl bg-white shadow-xl border-0 overflow-hidden">
        
        {/* TELA 1: UPLOAD */}
        {!result && (
            <>
                <CardHeader className="border-b bg-gray-50/30 pb-8">
                    <div {...getRootProps()} className={`
                        mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-all cursor-pointer
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}
                    `}>
                        <input {...getInputProps()} />
                        <div className="p-4 bg-blue-50 rounded-full mb-4">
                            <UploadCloud className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700">Clique ou arraste o PDF aqui</p>
                    </div>

                    {file && (
                        <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-blue-600" />
                                <span className="text-sm font-bold text-blue-900">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Trocar</Button>
                        </div>
                    )}
                </CardHeader>

                {error && <div className="p-4 bg-red-50 text-red-600 text-center">{error}</div>}

                <CardFooter className="p-6">
                    <Button onClick={handleValidate} disabled={!file || loading} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                        {loading ? 'Verificando Assinaturas...' : 'Verificar Assinatura'}
                    </Button>
                </CardFooter>
            </>
        )}

        {/* TELA 2: VÁLIDO (SINAL VERDE) */}
        {result && result.valid && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-emerald-600 p-10 text-center text-white">
                    <div className="mx-auto bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                        <ShieldCheck className="h-14 w-14 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">DOCUMENTO ASSINADO</h2>
                    <p className="text-emerald-100 mt-2 text-lg">A integridade deste arquivo está confirmada.</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* HASH EM DESTAQUE */}
                    <div className="space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                            <Fingerprint className="h-5 w-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">Hash de Segurança</span>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 font-mono text-sm break-all text-gray-800 select-all">
                            {result.hashCalculated}
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-6">
                        <h3 className="font-bold text-gray-900 mb-4">Dados da Assinatura</h3>
                        
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Arquivo</span>
                            <span className="font-medium text-gray-900">{result.document.title}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Data da Finalização</span>
                            <span className="font-medium text-gray-900">
                                {format(new Date(result.document.signedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                        </div>
                        
                        <div className="pt-4">
                            <p className="text-sm text-gray-500 mb-3">Assinado por:</p>
                            <div className="space-y-2">
                                {result.document.signers.map((signer, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        <span className="font-medium text-gray-900">{signer.name}</span>
                                        <span className="text-gray-400 text-xs">({signer.email})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button onClick={reset} variant="outline" className="w-full h-12">
                        <Search className="mr-2 h-4 w-4" /> Validar outro documento
                    </Button>
                </div>
            </div>
        )}

        {/* TELA 3: INVÁLIDO (SINAL VERMELHO) */}
        {result && !result.valid && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-red-600 p-10 text-center text-white">
                    <div className="mx-auto bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="h-14 w-14 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">NÃO ASSINADO / INVÁLIDO</h2>
                    <p className="text-red-100 mt-2 text-lg">Este arquivo não possui uma assinatura válida registrada.</p>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="bg-red-50 rounded-xl border border-red-100 p-5 text-center">
                        <p className="text-red-800 font-medium">Motivo:</p>
                        <p className="text-red-600 text-sm mt-1">
                            {result.reason === 'NOT_SIGNED_YET' 
                                ? 'O documento existe na plataforma, mas o processo de assinatura AINDA NÃO foi finalizado.' 
                                : 'O Hash do arquivo não corresponde a nenhum documento finalizado na nossa base de dados.'}
                        </p>
                    </div>

                    {result.hashCalculated && (
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-1">Hash encontrado no arquivo (para conferência):</p>
                            <p className="font-mono text-xs text-gray-500 break-all">{result.hashCalculated}</p>
                        </div>
                    )}

                    <Button onClick={reset} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white">
                        Tentar Novamente
                    </Button>
                </div>
            </div>
        )}

      </Card>
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar para Home
        </Link>
      </div>

    </div>
  );
}