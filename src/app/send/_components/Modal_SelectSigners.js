// src/app/send/_components/Modal_SelectSigners.js
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import api from '@/lib/api';

export default function Modal_SelectSigners({ open, onOpenChange, onSelect }) {
  const [savedSigners, setSavedSigners] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca os signatários salvos quando o modal é aberto
  useEffect(() => {
    if (open) {
      setLoading(true);
      api.get('/contacts')
        .then(res => {
          setSavedSigners(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar signatários:", err);
          setLoading(false);
        });
    }
  }, [open]);

  const handleSelect = (signer) => {
    setSelected(prev =>
      prev.some(s => s.email === signer.email)
        ? prev.filter(s => s.email !== signer.email) // Desmarca
        : [...prev, signer] // Marca
    );
  };

  const handleConfirmSelection = () => {
    onSelect(selected); // Envia a lista de selecionados para o componente pai
    onOpenChange(false); // Fecha o modal
    setSelected([]); // Limpa a seleção para a próxima vez
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 
          CORREÇÃO NO CONTAINER DO MODAL:
          - sm:max-w-3xl: Largura máxima em telas grandes.
          - w-[95vw]: Ocupa 95% da largura em celulares (evita corte).
          - max-h-[90vh]: Garante que o modal não ultrapasse a altura da tela.
          - flex flex-col: Para organizar Header, Tabela e Footer verticalmente.
      */}
      <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">Selecione os Signatários</DialogTitle>
        </DialogHeader>

        {/* 
            CORREÇÃO DE SCROLL:
            - flex-1: Ocupa o espaço restante disponível.
            - overflow-y-auto: Scroll vertical se a lista for longa.
            - overflow-x-auto: Scroll horizontal se a tabela for larga.
            - p-1: Pequeno padding para evitar cortes na sombra do focus.
        */}
        <div className="flex-1 py-4 overflow-y-auto overflow-x-auto p-1">
          {/* min-w-[600px] força a tabela a ter um tamanho mínimo, ativando o scroll horizontal se necessário */}
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Celular</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell>
                </TableRow>
              ) : savedSigners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum contato salvo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                savedSigners.map(signer => (
                  <TableRow key={signer.email}>
                    <TableCell>
                      <Checkbox
                        checked={selected.some(s => s.email === signer.email)}
                        onCheckedChange={() => handleSelect(signer)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{signer.name}</TableCell>
                    <TableCell>{signer.email}</TableCell>
                    <TableCell>{signer.phoneWhatsE164 || signer.phone}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirmSelection} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90">
            Selecionar ({selected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}