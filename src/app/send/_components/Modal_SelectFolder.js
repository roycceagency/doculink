// src/app/send/_components/Modal_SelectFolder.js
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, ChevronRight, Home, Plus, Loader2, CornerUpLeft, MoreVertical, Edit2, Trash2 } from 'lucide-react';

// Imports dos modais auxiliares (Certifique-se que estes arquivos existem na pasta _components)
import Modal_CreateFolder from './Modal_CreateFolder';
import Modal_RenameFolder from './Modal_RenameFolder';

export default function Modal_SelectFolder({ open, onOpenChange, onSelect }) {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // Null representa a Raiz
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Início' }]);
  const [loading, setLoading] = useState(false);
  
  // Controles dos Modais Internos
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);

  // Busca as pastas
  const fetchFolders = async () => {
    setLoading(true);
    try {
      // CORREÇÃO PRINCIPAL: Alterado de '/documents/folders' para '/folders'
      const params = { parentId: currentFolder || 'root' };
      const { data } = await api.get('/folders', { params });
      
      // Ajuste conforme o retorno padrão da sua API de pastas
      setFolders(data.folders || data || []);
      
      // Se a API retornar breadcrumbs, usamos. Se não, mantemos o local logicamente.
      if (data.breadcrumbs) {
          setBreadcrumbs(data.breadcrumbs);
      } else {
         // Fallback se a API não devolver breadcrumbs (lógica manual básica)
         if (currentFolder === null) {
             setBreadcrumbs([{ id: null, name: 'Início' }]);
         }
      }
    } catch (error) {
      console.error("Erro ao carregar pastas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentFolder]);

  // Navegação: Entrar na pasta
  const handleNavigate = (folder) => {
    setCurrentFolder(folder.id);
    // Adiciona ao breadcrumb visualmente para navegação rápida
    setBreadcrumbs(prev => {
        // Evita duplicatas
        const exists = prev.find(b => b.id === folder.id);
        if (exists) return prev;
        return [...prev, { id: folder.id, name: folder.name }];
    });
  };

  // Navegação: Clicar no Breadcrumb
  const handleBreadcrumbClick = (item, index) => {
      setCurrentFolder(item.id);
      // Corta o array de breadcrumbs até o índice clicado
      setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  // Navegação: Voltar um nível
  const handleGoUp = () => {
    if (breadcrumbs.length > 1) {
      const parent = breadcrumbs[breadcrumbs.length - 2];
      handleBreadcrumbClick(parent, breadcrumbs.length - 2);
    }
  };

  // Ações de Item (Renomear/Excluir)
  const handleRenameClick = (folder, e) => {
    e.stopPropagation(); 
    setFolderToRename(folder);
  };

  const handleDeleteClick = async (folder, e) => {
    e.stopPropagation();
    if(!confirm(`Tem certeza que deseja excluir a pasta "${folder.name}"?`)) return;
    
    try {
        await api.delete(`/folders/${folder.id}`);
        fetchFolders(); 
    } catch (error) {
        alert("Erro ao excluir pasta.");
    }
  };

  // Seleção Final
  const handleConfirm = () => {
    // Pega o nome da pasta atual baseada no último item do breadcrumb
    const currentName = breadcrumbs[breadcrumbs.length - 1].name;
    
    onSelect({ 
        id: currentFolder, 
        name: currentName 
    });
    onOpenChange(false);
  };

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] h-[550px] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-4 border-b bg-white rounded-t-lg">
                <DialogTitle className="text-xl text-gray-800">Selecionar Pasta de Destino</DialogTitle>
            </DialogHeader>
            
            {/* Barra de Navegação (Breadcrumbs) */}
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                {currentFolder !== null && (
                    <button onClick={handleGoUp} className="mr-2 p-1.5 hover:bg-gray-200 rounded-full transition-colors" title="Voltar nível">
                        <CornerUpLeft className="h-4 w-4 text-gray-500" />
                    </button>
                )}
                <div className="flex items-center">
                    {breadcrumbs.map((item, index) => (
                        <div key={item.id || 'root'} className="flex items-center">
                            <button 
                                onClick={() => handleBreadcrumbClick(item, index)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                                    index === breadcrumbs.length - 1 
                                    ? "font-bold text-gray-900 pointer-events-none" 
                                    : "text-gray-500 hover:text-blue-600 hover:bg-gray-200"
                                }`}
                            >
                                {item.id === null && <Home className="h-3.5 w-3.5 mb-0.5" />}
                                {item.name}
                            </button>
                            {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-gray-300 mx-0.5" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lista de Pastas */}
            <ScrollArea className="flex-1 p-4 bg-white">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600"/></div>
                ) : folders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 mt-10">
                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                            <Folder className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="font-medium">Esta pasta está vazia</p>
                        <Button variant="link" onClick={() => setIsCreateOpen(true)} className="text-blue-600">
                            Criar primeira pasta
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => handleNavigate(folder)}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group cursor-pointer shadow-sm"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-md group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                        <Folder className="h-5 w-5 fill-yellow-500/20 group-hover:fill-blue-500/20" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[120px] group-hover:text-blue-700">
                                        {folder.name}
                                    </span>
                                </div>

                                {/* Menu de Ações */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onClick={(e) => handleRenameClick(folder, e)}>
                                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Renomear
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50" 
                                            onClick={(e) => handleDeleteClick(folder, e)}
                                        >
                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <DialogFooter className="p-4 border-t bg-gray-50 flex flex-row justify-between items-center sm:justify-between">
                <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="gap-2 bg-white hover:bg-gray-100">
                    <Plus className="h-4 w-4" /> Nova Pasta
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 shadow-sm">
                        Salvar aqui
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
        </Dialog>

        {/* Modal de Criação Aninhado */}
        <Modal_CreateFolder 
            open={isCreateOpen} 
            onOpenChange={setIsCreateOpen} 
            parentId={currentFolder || 'root'}
            onSuccess={fetchFolders}
        />

        {/* Modal de Renomear Aninhado */}
        <Modal_RenameFolder 
            open={!!folderToRename}
            onOpenChange={(val) => !val && setFolderToRename(null)}
            folder={folderToRename}
            onSuccess={fetchFolders}
        />
    </>
  );
}