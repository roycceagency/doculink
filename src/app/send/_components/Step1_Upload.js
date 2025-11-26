// src/app/send/_components/Step1_Upload.js
"use client";

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { XCircle, FolderOpen, UploadCloud, FileText, Edit2 } from 'lucide-react';
import api from '@/lib/api';

import Modal_SelectFolder from './Modal_SelectFolder';

export default function Step1_Upload({ onNext, onDocumentUploaded, onCancel }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Estado da pasta selecionada (Default: Raiz)
  const [selectedFolder, setSelectedFolder] = useState({ id: null, name: 'Início (Raiz)' });
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
      onDrop, 
      multiple: false,
      accept: { 'application/pdf': ['.pdf'] }
  });

  const handleNext = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('documentFile', file);
    formData.append('title', file.name);
    
    // Envia o ID da pasta selecionada (se não for null)
    if (selectedFolder.id) {
        formData.append('folderId', selectedFolder.id);
    } else {
        // Se for raiz, opcionalmente manda 'root' ou nada, o backend trata
        formData.append('folderId', 'root');
    }

    try {
      const { data } = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onDocumentUploaded(data); 
      onNext();
    } catch (error) {
      console.error("Falha no upload:", error);
      const msg = error.response?.data?.message || "Erro ao enviar o documento.";
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Envie seu documento</h2>
        <p className="text-muted-foreground mt-2">Escolha o arquivo e a pasta de destino</p>
      </div>
      
      {/* ÁREA DE UPLOAD (Só aparece se não tiver arquivo) */}
      {!file && (
          <div {...getRootProps()} className={`
            flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all
            ${isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          `}>
            <input {...getInputProps()} />
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
                <UploadCloud className="h-10 w-10" />
            </div>
            <p className="text-lg font-semibold text-gray-700">Clique ou arraste seu PDF aqui</p>
            <p className="text-sm text-gray-500 mt-1">Tamanho máximo: 20MB</p>
          </div>
      )}

      {/* DETALHES DO ARQUIVO (Aparece após selecionar) */}
      {file && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Card do Arquivo */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <FileText className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Documento Selecionado</p>
                            <p className="text-lg font-bold text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                        <XCircle className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Seletor de Pasta */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                        <FolderOpen className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Salvar em</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedFolder.name}</span>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsFolderModalOpen(true)} className="gap-2">
                    <Edit2 className="h-3 w-3" /> Alterar
                </Button>
            </div>

            {/* Ações */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onCancel} className="h-11 px-6">Cancelar</Button>
                <Button onClick={handleNext} disabled={loading} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 h-11 px-8 text-base">
                    {loading ? 'Enviando...' : 'Continuar'}
                </Button>
            </div>
        </div>
      )}

      {/* Modal de Seleção de Pasta */}
      <Modal_SelectFolder 
        open={isFolderModalOpen} 
        onOpenChange={setIsFolderModalOpen} 
        onSelect={setSelectedFolder} 
      />
    </div>
  );
}