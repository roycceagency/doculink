// src/app/(dashboard)/folders/page.js
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// DND KIT (Drag and Drop)
import { 
    DndContext, useDraggable, useDroppable, DragOverlay, 
    closestCenter, PointerSensor, useSensor, useSensors 
} from '@dnd-kit/core';

// UI Components
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { 
    Folder, FileText, Search, Plus, MoreVertical, 
    ChevronRight, Home, Trash2, CornerUpLeft, FolderOpen, Edit2, UploadCloud, Loader2, ArrowRight
} from "lucide-react";

// Modais Auxiliares
import Modal_CreateFolder from './_components/Modal_CreateFolder';
import Modal_RenameFolder from './_components/Modal_RenameFolder';
import Modal_ViewDocument from '@/components/dashboard/Modal_ViewDocument';

// --- ITEM VISUAL (Ghost Image no Drag) ---
const ItemVisual = ({ type, name, subtitle, isOver, isDragging }) => {
    const isFolder = type === 'FOLDER';
    
    let bgClass = "bg-white";
    if (isDragging) bgClass = "bg-blue-50 border-blue-500 shadow-2xl opacity-90 scale-105 rotate-2";
    else if (isOver) bgClass = "bg-blue-50 border-blue-500 scale-105";

    return (
        <Card className={`h-full border-2 transition-all ${bgClass} ${isDragging ? 'cursor-grabbing' : 'cursor-pointer hover:shadow-md hover:border-blue-200'}`}>
            <CardContent className="p-4 flex items-center justify-between h-full">
                <div className="flex items-center gap-3 overflow-hidden w-full">
                    <div className={`p-2.5 rounded-lg shrink-0 ${isFolder ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                        {isFolder ? <Folder className="h-6 w-6 fill-current" /> : <FileText className="h-6 w-6" />}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-gray-800 truncate text-sm select-none">
                            {name}
                        </span>
                        {subtitle && <span className="text-[10px] text-gray-400 truncate">{subtitle}</span>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- ZONA DE DROP "VOLTAR" ---
const BackDropZone = ({ onClick }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'folder-back',
        data: { type: 'FOLDER', id: 'back', name: 'Pasta Anterior' }
    });

    return (
        <button 
            ref={setNodeRef}
            onClick={onClick} 
            className={`mr-2 p-2 rounded-full transition-all border-2 ${
                isOver 
                ? "bg-blue-100 border-blue-500 text-blue-700 scale-110 shadow-inner" 
                : "hover:bg-gray-200 border-transparent text-gray-500"
            }`}
            title="Voltar (Solte aqui para mover para a pasta anterior)"
        >
            <CornerUpLeft className="h-5 w-5" />
        </button>
    );
};

// --- COMPONENTE: PASTA ---
const FolderItem = ({ folder, onClick, onDelete, onRename, canEdit }) => {
    const draggable = useDraggable({ id: `folder-${folder.id}`, data: { type: 'FOLDER', id: folder.id, name: folder.name } });
    const droppable = useDroppable({ id: `folder-${folder.id}`, data: { type: 'FOLDER', id: folder.id, name: folder.name } });

    const setNodeRef = (node) => {
        draggable.setNodeRef(node);
        droppable.setNodeRef(node);
    };

    return (
        <div 
            ref={setNodeRef}
            {...draggable.listeners}
            {...draggable.attributes}
            style={{ opacity: draggable.isDragging ? 0.3 : 1 }}
            onClick={() => onClick(folder)}
        >
            <Card className={`group relative border-2 transition-all cursor-pointer ${droppable.isOver ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg' : 'border-transparent hover:shadow-md bg-white'}`}>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2.5 rounded-lg transition-colors ${droppable.isOver ? 'bg-blue-200 text-blue-700' : 'bg-yellow-50 text-yellow-600'}`}>
                            <Folder className="h-6 w-6 fill-current" />
                        </div>
                        <span className="font-medium text-gray-800 truncate text-sm select-none">{folder.name}</span>
                    </div>

                    {canEdit && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(folder); }}>
                                    <Edit2 className="mr-2 h-4 w-4" /> Renomear
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={(e) => { e.stopPropagation(); onDelete(folder.id); }}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// --- COMPONENTE: ARQUIVO ---
const DocumentItem = ({ doc, onOpen }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `doc-${doc.id}`,
        data: { type: 'DOCUMENT', id: doc.id, title: doc.title }
    });

    const formattedDate = format(new Date(doc.createdAt), "dd MMM yyyy", { locale: ptBR });

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes} 
            style={{ opacity: isDragging ? 0.5 : 1 }}
            onClick={() => onOpen(doc.id)}
        >
            <ItemVisual 
                type="DOCUMENT" 
                name={doc.title} 
                subtitle={formattedDate}
            />
        </div>
    );
};


// --- PÁGINA PRINCIPAL ---
export default function FoldersPage() {
  const { user } = useAuth();
  
  // Estados
  const [currentFolder, setCurrentFolder] = useState('root'); 
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Início' }]);
  const [content, setContent] = useState({ folders: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  // Drag State
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [renameFolder, setRenameFolder] = useState(null);
  const [viewDocId, setViewDocId] = useState(null);
  const [moveConfirmation, setMoveConfirmation] = useState(null);

  // Permissões
  const canEdit = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user?.role);

  // Sensores para DND
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  const fetchContents = useCallback(async () => {
    setLoading(true);
    try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        else params.parentId = currentFolder;

        // --- CORREÇÃO: Alterado de /documents/folders para /folders ---
        const { data } = await api.get('/folders', { params });
        // -----------------------------------------------------------

        setContent({ folders: data.folders || [], documents: data.documents || [] });

        if (!debouncedSearch && data.breadcrumbs) setBreadcrumbs(data.breadcrumbs);
    } catch (error) {
        console.error("Erro ao carregar:", error);
    } finally {
        setLoading(false);
    }
  }, [currentFolder, debouncedSearch]);

  useEffect(() => {
    if (user) fetchContents();
  }, [fetchContents, user]);

  // --- UPLOAD DIRETO ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('documentFile', file);
    formData.append('title', file.name);
    formData.append('folderId', currentFolder); 

    try {
        await api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        fetchContents(); 
    } catch (error) {
        alert("Erro ao enviar arquivo. Verifique limites do plano.");
    } finally {
        setUploading(false);
    }
  };

  // --- DRAG AND DROP LOGIC ---
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setActiveItem(event.active.data.current);
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    setActiveItem(null);
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const activeType = active.data.current.type;
    const overType = over.data.current.type;
    
    if (overType !== 'FOLDER') return;

    const itemId = active.data.current.id;
    let targetFolderId = over.data.current.id;
    let targetName = over.data.current.name;

    if (targetFolderId === 'back' || over.id === 'folder-back') {
        if (breadcrumbs.length < 2) return;
        const parentFolder = breadcrumbs[breadcrumbs.length - 2];
        targetFolderId = parentFolder.id === 'root' ? null : parentFolder.id;
        targetName = parentFolder.name;
    }

    if (itemId === targetFolderId) return;

    setMoveConfirmation({
        itemId,
        itemType: activeType,
        targetFolderId,
        itemName: active.data.current.name || active.data.current.title,
        targetName
    });
  };

  // --- CONFIRMAÇÃO DE MOVIMENTO ---
  const handleConfirmMove = async () => {
    if (!moveConfirmation) return;
    const { itemId, itemType, targetFolderId } = moveConfirmation;
    setMoveConfirmation(null);

    try {
        if(itemType === 'DOCUMENT') {
            setContent(prev => ({...prev, documents: prev.documents.filter(d => d.id !== itemId)}));
        } else {
            setContent(prev => ({...prev, folders: prev.folders.filter(f => f.id !== itemId)}));
        }

        await api.post('/folders/move', { itemId, itemType, targetFolderId });
        fetchContents();
    } catch (error) {
        alert("Erro ao mover item.");
        fetchContents();
    }
  };

  const handleEnterFolder = (folder) => { setSearch(""); setCurrentFolder(folder.id); };
  const handleBreadcrumbClick = (item) => { setSearch(""); setCurrentFolder(item.id); };
  const handleGoUp = () => { if (breadcrumbs.length > 1) handleBreadcrumbClick(breadcrumbs[breadcrumbs.length - 2]); };
  const handleDeleteFolder = async (id) => { if(!confirm("Tem certeza? Arquivos internos irão para a Raiz.")) return; try { await api.delete(`/folders/${id}`); fetchContents(); } catch(e) { alert("Erro ao excluir."); } };
  const handleOpenDocument = (docId) => { setViewDocId(docId); };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Header 
            leftContent={<h1 className="text-xl font-semibold text-gray-800">Gerenciador de Arquivos</h1>}
            actionButtonText={canEdit ? "Enviar Documento" : null}
        />

        <main className="flex-1 p-6 space-y-6 h-full flex flex-col">
            
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Buscar pastas ou arquivos..." 
                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                {canEdit && !debouncedSearch && (
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative">
                            <input type="file" id="upload-file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf" />
                            <label htmlFor="upload-file">
                                <Button asChild variant="outline" className="cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50" disabled={uploading}>
                                    <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />} Upload Aqui</span>
                                </Button>
                            </label>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
                            <Plus className="mr-2 h-4 w-4" /> Nova Pasta
                        </Button>
                    </div>
                )}
            </div>

            {/* ÁREA DE ARQUIVOS */}
            <div className="flex-1 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden relative">
                
                {!debouncedSearch && (
                    <div className="flex items-center gap-2 p-4 border-b bg-gray-50/50 text-sm overflow-x-auto">
                        {currentFolder !== 'root' && <BackDropZone onClick={handleGoUp} />}
                        {breadcrumbs.map((item, index) => (
                            <div key={item.id} className="flex items-center">
                                <button onClick={() => handleBreadcrumbClick(item)} className={`flex items-center gap-1 px-2 py-1 rounded-md ${index === breadcrumbs.length - 1 ? "font-semibold text-gray-900 bg-white shadow-sm pointer-events-none" : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"}`}>
                                    {item.id === 'root' && <Home className="h-3.5 w-3.5 mb-0.5" />}
                                    {item.name}
                                </button>
                                {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex-1 p-6 overflow-y-auto bg-[#FBFCFD]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                        </div>
                    ) : (
                        <>
                            {content.folders.length === 0 && content.documents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                                    <FolderOpen className="h-16 w-16 mb-4 opacity-20" />
                                    <p>Pasta vazia</p>
                                </div>
                            ) : (
                                <div className="space-y-8 pb-20">
                                    {content.folders.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Pastas</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                {content.folders.map(folder => (
                                                    <FolderItem key={folder.id} folder={folder} onClick={handleEnterFolder} onDelete={handleDeleteFolder} onRename={setRenameFolder} canEdit={canEdit} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {content.documents.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Arquivos</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                {content.documents.map(doc => (
                                                    <DocumentItem key={doc.id} doc={doc} onOpen={handleOpenDocument} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>

        <DragOverlay>
            {activeId && activeItem ? <div className="w-48"><ItemVisual type={activeItem.type} name={activeItem.name || activeItem.title} isDragging /></div> : null}
        </DragOverlay>

        <Modal_CreateFolder open={isCreateOpen} onOpenChange={setIsCreateOpen} parentId={currentFolder} onSuccess={fetchContents} />
        <Modal_RenameFolder open={!!renameFolder} onOpenChange={(open) => !open && setRenameFolder(null)} folder={renameFolder} onSuccess={fetchContents} />
        <Modal_ViewDocument open={!!viewDocId} onOpenChange={(open) => !open && setViewDocId(null)} documentId={viewDocId} />

        <Dialog open={!!moveConfirmation} onOpenChange={(open) => !open && setMoveConfirmation(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>Mover item?</DialogTitle><DialogDescription className="pt-2">Você está movendo este item de local.</DialogDescription></DialogHeader>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                    <div className="flex flex-col items-center w-[40%]">
                        <div className="mb-2 p-2 bg-white rounded-md border shadow-sm">{moveConfirmation?.itemType === 'FOLDER' ? <Folder className="h-6 w-6 text-yellow-500 fill-current" /> : <FileText className="h-6 w-6 text-red-500" />}</div>
                        <span className="text-xs font-medium text-center truncate w-full px-1" title={moveConfirmation?.itemName}>{moveConfirmation?.itemName}</span>
                    </div>
                    <div className="flex flex-col items-center text-gray-400"><ArrowRight className="h-5 w-5 animate-pulse text-blue-500" /></div>
                    <div className="flex flex-col items-center w-[40%]">
                        <div className="mb-2 p-2 bg-white rounded-md border shadow-sm">{moveConfirmation?.targetName === 'Pasta Anterior' ? <CornerUpLeft className="h-6 w-6 text-blue-500" /> : <Folder className="h-6 w-6 text-blue-500 fill-blue-100" />}</div>
                        <span className="text-xs font-medium text-center truncate w-full px-1" title={moveConfirmation?.targetName}>{moveConfirmation?.targetName}</span>
                    </div>
                </div>
                <DialogFooter className="mt-2">
                    <Button variant="ghost" onClick={() => setMoveConfirmation(null)}>Cancelar</Button>
                    <Button onClick={handleConfirmMove} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">Confirmar Movimento</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </DndContext>
  );
}