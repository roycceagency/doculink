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

// Imports dos modais auxiliares
import Modal_CreateFolder from './Modal_CreateFolder';
import Modal_RenameFolder from './Modal_RenameFolder'; // Importando o arquivo que acabamos de criar

export default function Modal_SelectFolder({ open, onOpenChange, onSelect }) {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Início' }]);
  const [loading, setLoading] = useState(false);
  
  // Controles dos Modais Internos
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);

  // Busca as pastas
  const fetchFolders = async () => {
    setLoading(true);
    try {
      const params = { parentId: currentFolder };
      const { data } = await api.get('/documents/folders', { params });
      
      setFolders(data.folders || []);
      if (data.breadcrumbs) setBreadcrumbs(data.breadcrumbs);
    } catch (error) {
      console.error("Erro ao carregar pastas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchFolders();
  }, [open, currentFolder]);

  // Navegação
  const handleNavigate = (folderId) => {
    setCurrentFolder(folderId);
  };

  const handleGoUp = () => {
    if (breadcrumbs.length > 1) {
      handleNavigate(breadcrumbs[breadcrumbs.length - 2].id);
    }
  };

  // Ações de Item (Renomear/Excluir)
  const handleRenameClick = (folder, e) => {
    e.stopPropagation(); // Impede de entrar na pasta
    setFolderToRename(folder);
  };

  const handleDeleteClick = async (folder, e) => {
    e.stopPropagation();
    if(!confirm(`Tem certeza que deseja excluir a pasta "${folder.name}"?`)) return;
    
    try {
        await api.delete(`/folders/${folder.id}`);
        fetchFolders(); // Recarrega lista
    } catch (error) {
        alert("Erro ao excluir pasta.");
    }
  };

  // Seleção Final
  const handleConfirm = () => {
    const currentName = breadcrumbs[breadcrumbs.length - 1].name;
    onSelect({ 
        id: currentFolder === 'root' ? null : currentFolder, 
        name: currentName 
    });
    onOpenChange(false);
  };

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] h-[500px] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle className="text-xl text-gray-800">Selecionar Pasta de Destino</DialogTitle>
            </DialogHeader>
            
            {/* Barra de Navegação (Breadcrumbs) */}
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b text-sm overflow-x-auto whitespace-nowrap">
                {currentFolder !== 'root' && (
                    <button onClick={handleGoUp} className="mr-2 p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <CornerUpLeft className="h-4 w-4 text-gray-500" />
                    </button>
                )}
                {breadcrumbs.map((item, index) => (
                    <div key={item.id} className="flex items-center">
                        <button 
                            onClick={() => handleNavigate(item.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                                index === breadcrumbs.length - 1 
                                ? "font-semibold text-gray-900 pointer-events-none" 
                                : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                            }`}
                        >
                            {item.id === 'root' && <Home className="h-3.5 w-3.5 mb-0.5" />}
                            {item.name}
                        </button>
                        {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
                    </div>
                ))}
            </div>

            {/* Lista de Pastas */}
            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600"/></div>
                ) : folders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <Folder className="h-10 w-10 mb-2 opacity-20" />
                        <p>Esta pasta está vazia</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => handleNavigate(folder.id)}
                                className="flex items-center justify-between p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-md group-hover:bg-white group-hover:text-blue-600">
                                        <Folder className="h-5 w-5 fill-current" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{folder.name}</span>
                                </div>

                                {/* Menu de Ações (Renomear/Excluir) */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical className="h-3 w-3 text-gray-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="z-[150]">
                                        <DropdownMenuItem onClick={(e) => handleRenameClick(folder, e)}>
                                            <Edit2 className="mr-2 h-3 w-3" /> Renomear
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50" 
                                            onClick={(e) => handleDeleteClick(folder, e)}
                                        >
                                            <Trash2 className="mr-2 h-3 w-3" /> Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <DialogFooter className="p-4 border-t bg-gray-50 flex justify-between sm:justify-between items-center">
                <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Nova Pasta
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
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
            parentId={currentFolder}
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