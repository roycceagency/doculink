// src/app/(dashboard)/admin/documents/page.js
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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
    Folder, FileText, Search, Plus, MoreVertical, 
    ChevronRight, Home, Trash2, CornerUpLeft, FolderOpen, Edit2, ArrowRight, User, Loader2
} from "lucide-react";

// Modal de Visualização (Reutilizado)
import Modal_ViewDocument from '@/components/dashboard/Modal_ViewDocument';

// --- COMPONENTES VISUAIS DO DRAG & DROP ---

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

const FolderItem = ({ folder, onClick, onDelete, onRename }) => {
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
                </CardContent>
            </Card>
        </div>
    );
};

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


// --- PÁGINA PRINCIPAL (ADMIN FILE MANAGER) ---

export default function AdminDocumentsPage() {
  const { user } = useAuth();
  
  // Estados de Seleção
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  
  // Estados do File Manager
  const [currentFolder, setCurrentFolder] = useState('root'); 
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Início' }]);
  const [content, setContent] = useState({ folders: [], documents: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Drag State
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  
  const [viewDocId, setViewDocId] = useState(null);
  const [moveConfirmation, setMoveConfirmation] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // 1. Buscar Lista de Tenants
  useEffect(() => {
      const fetchTenants = async () => {
          try {
              const { data } = await api.get('/tenants/all');
              setTenants(data);
          } catch (error) {
              console.error("Erro ao buscar tenants:", error);
          }
      };
      fetchTenants();
  }, []);

  // 2. Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 3. Buscar Conteúdo (Com targetTenantId)
  const fetchContents = useCallback(async () => {
    if (!selectedTenantId) return;

    setLoading(true);
    try {
        const params = {
            targetTenantId: selectedTenantId // Injeta o ID do cliente
        };
        
        if (debouncedSearch) params.search = debouncedSearch;
        else params.parentId = currentFolder;

        // --- CORREÇÃO AQUI: Alterado de /documents/folders para /folders ---
        const { data } = await api.get('/folders', { params });
        // ------------------------------------------------------------------

        setContent({ folders: data.folders || [], documents: data.documents || [] });

        if (!debouncedSearch && data.breadcrumbs) setBreadcrumbs(data.breadcrumbs);
    } catch (error) {
        console.error("Erro ao carregar:", error);
    } finally {
        setLoading(false);
    }
  }, [currentFolder, debouncedSearch, selectedTenantId]);

  // Reseta ao mudar de tenant
  useEffect(() => {
      setCurrentFolder('root');
      setBreadcrumbs([{ id: 'root', name: 'Início' }]);
      setSearch("");
  }, [selectedTenantId]);

  // Carrega dados
  useEffect(() => {
    if (selectedTenantId) fetchContents();
    else setContent({ folders: [], documents: [] });
  }, [fetchContents, selectedTenantId]);


  // --- AÇÕES ADMINISTRATIVAS ---

  const handleDeleteFolder = async (id) => {
    if(!confirm("Tem certeza? Esta ação é irreversível.")) return;
    try { 
        // Passa targetTenantId na query string para o DELETE
        await api.delete(`/folders/${id}?targetTenantId=${selectedTenantId}`); 
        fetchContents(); 
    } catch(e) { alert("Erro ao excluir."); }
  };

  const handleConfirmMove = async () => {
    if (!moveConfirmation) return;
    const { itemId, itemType, targetFolderId } = moveConfirmation;
    setMoveConfirmation(null);
    try {
        await api.post('/folders/move', { 
            itemId, itemType, targetFolderId,
            targetTenantId: selectedTenantId // Passa no body para o POST
        });
        fetchContents();
    } catch (error) { alert("Erro ao mover item."); fetchContents(); }
  };

  const handleRenameSubmit = async (e) => {
      e.preventDefault();
      const newName = e.target.folderName.value;
      try {
          await api.patch(`/folders/${folderToRename.id}`, { 
              name: newName,
              targetTenantId: selectedTenantId 
          });
          setIsRenameOpen(false);
          setFolderToRename(null);
          fetchContents();
      } catch (error) {
          alert("Erro ao renomear.");
      }
  };

  const handleCreateSubmit = async (e) => {
      e.preventDefault();
      const name = e.target.folderName.value;
      try {
          await api.post('/folders', { 
              name, 
              parentId: currentFolder === 'root' ? null : currentFolder,
              targetTenantId: selectedTenantId 
          });
          setIsCreateOpen(false);
          fetchContents();
      } catch (error) {
          alert("Erro ao criar pasta.");
      }
  };

  // --- NAVEGAÇÃO ---
  const handleEnterFolder = (f) => { setSearch(""); setCurrentFolder(f.id); };
  const handleBreadcrumbClick = (item) => { setSearch(""); setCurrentFolder(item.id); };
  const handleGoUp = () => { if (breadcrumbs.length > 1) handleBreadcrumbClick(breadcrumbs[breadcrumbs.length - 2]); };
  const handleOpenDocument = (docId) => setViewDocId(docId);
  
  const handleOpenRename = (folder) => {
      setFolderToRename(folder);
      setIsRenameOpen(true);
  };

  // --- DRAG HANDLERS ---
  const handleDragStart = (e) => { setActiveId(e.active.id); setActiveItem(e.active.data.current); };
  const handleDragEnd = (e) => {
    setActiveId(null); setActiveItem(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    if (over.data.current.type !== 'FOLDER') return;

    let targetFolderId = over.data.current.id;
    let targetName = over.data.current.name;

    if (targetFolderId === 'back' || over.id === 'folder-back') {
        if (breadcrumbs.length < 2) return;
        const parent = breadcrumbs[breadcrumbs.length - 2];
        targetFolderId = parent.id === 'root' ? null : parent.id;
        targetName = parent.name;
    }
    if (active.data.current.id === targetFolderId) return;

    setMoveConfirmation({
        itemId: active.data.current.id,
        itemType: active.data.current.type,
        targetFolderId,
        itemName: active.data.current.name || active.data.current.title,
        targetName
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Header leftContent={<h1 className="text-xl font-semibold text-gray-800">Explorador de Arquivos (Admin)</h1>} />

        <main className="flex-1 p-6 space-y-6 h-full flex flex-col">
            
            {/* TOOLBAR DE SELEÇÃO */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                
                {/* Select Tenant */}
                <div className="w-full md:w-72">
                    <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700">
                                <User className="h-4 w-4" />
                                <SelectValue placeholder="Selecione um Cliente" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {tenants.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Busca */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Buscar arquivos neste cliente..." 
                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={!selectedTenantId}
                    />
                </div>

                <Button onClick={() => setIsCreateOpen(true)} disabled={!selectedTenantId} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
                    <Plus className="mr-2 h-4 w-4" /> Nova Pasta
                </Button>
            </div>

            {/* ÁREA DE ARQUIVOS */}
            <div className="flex-1 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden relative min-h-[400px]">
                
                {!selectedTenantId ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <User className="h-16 w-16 mb-4 opacity-20" />
                        <p>Selecione um cliente acima para gerenciar.</p>
                    </div>
                ) : (
                    <>
                        {/* Breadcrumbs */}
                        {!debouncedSearch && (
                            <div className="flex items-center gap-2 p-4 border-b bg-gray-50/50 text-sm overflow-x-auto">
                                {currentFolder !== 'root' && <BackDropZone onClick={handleGoUp} />}
                                {breadcrumbs.map((item, index) => (
                                    <div key={item.id} className="flex items-center">
                                        <button onClick={() => handleBreadcrumbClick(item)} className={`flex items-center gap-1 px-2 py-1 rounded-md ${index === breadcrumbs.length - 1 ? "font-semibold text-gray-900 pointer-events-none" : "text-gray-500 hover:text-blue-600"}`}>
                                            {item.id === 'root' && <Home className="h-3.5 w-3.5 mb-0.5" />}
                                            {item.name}
                                        </button>
                                        {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Conteúdo Grid */}
                        <div className="flex-1 p-6 overflow-y-auto bg-[#FBFCFD]">
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                                </div>
                            ) : (
                                <div className="space-y-8 pb-20">
                                    {content.folders.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Pastas</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                {content.folders.map(f => (
                                                    <FolderItem key={f.id} folder={f} onClick={handleEnterFolder} onDelete={handleDeleteFolder} onRename={handleOpenRename} canEdit={true} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {content.documents.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Arquivos</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                {content.documents.map(d => (
                                                    <DocumentItem key={d.id} doc={d} onOpen={handleOpenDocument} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {content.folders.length === 0 && content.documents.length === 0 && (
                                        <div className="text-center py-10 text-gray-400">Pasta vazia</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>

        {/* Drag Overlay */}
        <DragOverlay>
            {activeId && activeItem ? <div className="w-48"><ItemVisual type={activeItem.type} name={activeItem.name || activeItem.title} isDragging /></div> : null}
        </DragOverlay>

        {/* MODAL VISUALIZAÇÃO */}
        <Modal_ViewDocument open={!!viewDocId} onOpenChange={(open) => !open && setViewDocId(null)} documentId={viewDocId} />

        {/* MODAL CONFIRMA MOVIMENTO */}
        <Dialog open={!!moveConfirmation} onOpenChange={(open) => !open && setMoveConfirmation(null)}>
            <DialogContent>
                <DialogHeader><DialogTitle>Mover Item (Admin)</DialogTitle><DialogDescription>Você está movendo um item na conta do cliente.</DialogDescription></DialogHeader>
                <div className="py-4 text-center text-gray-700">
                    Mover <strong>{moveConfirmation?.itemName}</strong> para <strong>{moveConfirmation?.targetName}</strong>?
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setMoveConfirmation(null)}>Cancelar</Button>
                    <Button onClick={handleConfirmMove}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* MODAL CRIAR PASTA ADMIN */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Nova Pasta (Admin)</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateSubmit}>
                    <div className="py-4"><Input name="folderName" placeholder="Nome da pasta" required autoFocus /></div>
                    <DialogFooter><Button type="submit">Criar</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* MODAL RENOMEAR ADMIN */}
        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Renomear Pasta</DialogTitle></DialogHeader>
                <form onSubmit={handleRenameSubmit}>
                    <div className="py-4"><Input name="folderName" defaultValue={folderToRename?.name} required autoFocus /></div>
                    <DialogFooter><Button type="submit">Salvar</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    </DndContext>
  );
}