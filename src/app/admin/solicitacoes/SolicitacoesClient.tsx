"use client";

import React, { useState } from 'react';
import { Solicitacao } from './page';
import { acceptRequest, rejectRequest } from './actions';

import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, Button, CircularProgress, Alert, Box, FormControl, InputLabel, SelectChangeEvent
} from '@mui/material';

interface Props {
  initialSolicitacoes: Solicitacao[];
  igrejas: { id: string, nome: string }[];
  roles: { id: string, nome: string }[];
}

export default function SolicitacoesClient({ initialSolicitacoes, igrejas, roles }: Props) {
  const [solicitacoes, setSolicitacoes] = useState(initialSolicitacoes);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // ✅ CORREÇÃO: Estado para guardar as seleções de cada linha
  const [selections, setSelections] = useState<{ [key: string]: { igrejaId: string; role: string } }>({});

  const handleSelectionChange = (solicitacaoId: string, field: 'igrejaId' | 'role', value: string) => {
    setSelections(prev => ({
      ...prev,
      [solicitacaoId]: {
        ...(prev[solicitacaoId] || { igrejaId: '', role: 'membro' }), // Garante que o objeto existe
        [field]: value
      }
    }));
  };

  const handleAction = async (action: 'accept' | 'reject', solicitacaoId: string) => {
    setLoadingId(solicitacaoId);
    setError(null);
    setSuccess(null);

    let result;
    if (action === 'accept') {
      // ✅ CORREÇÃO: Lê os valores do estado em vez de diretamente do DOM
      const currentSelection = selections[solicitacaoId] || { igrejaId: '', role: 'membro' };
      const { igrejaId, role } = currentSelection;

      if (!igrejaId || !role) {
        setError('Por favor, selecione uma igreja e um cargo para aprovar.');
        setLoadingId(null);
        return;
      }
      result = await acceptRequest(solicitacaoId, igrejaId, role);
    } else {
      if (!confirm('Tem a certeza de que deseja rejeitar esta solicitação? A ação não pode ser desfeita.')) {
          setLoadingId(null);
          return;
      }
      result = await rejectRequest(solicitacaoId);
    }

    if (result.success) {
      setSuccess(result.message);
      setSolicitacoes(prev => prev.filter(s => s.id !== solicitacaoId));
    } else {
      setError(result.message || 'Ocorreu um erro.');
    }
    
    setLoadingId(null);
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  };

  if (solicitacoes.length === 0 && !loadingId) {
    return <Alert severity="info">Não há solicitações de cadastro pendentes no momento.</Alert>;
  }

  return (
    <>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Igreja</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {solicitacoes.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.nome}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Igreja</InputLabel>
                    {/* ✅ CORREÇÃO: Controla o valor e a alteração com o estado */}
                    <Select
                      label="Igreja"
                      value={selections[s.id]?.igrejaId || ''}
                      onChange={(e: SelectChangeEvent) => handleSelectionChange(s.id, 'igrejaId', e.target.value)}
                    >
                      {igrejas.map(i => <MenuItem key={i.id} value={i.id}>{i.nome}</MenuItem>)}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Cargo</InputLabel>
                    {/* ✅ CORREÇÃO: Controla o valor e a alteração com o estado */}
                    <Select
                      label="Cargo"
                      value={selections[s.id]?.role || 'membro'}
                      onChange={(e: SelectChangeEvent) => handleSelectionChange(s.id, 'role', e.target.value)}
                    >
                      {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>)}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button variant="contained" size="small" color="success" onClick={() => handleAction('accept', s.id)} disabled={loadingId === s.id}>
                      {loadingId === s.id ? <CircularProgress size={20} /> : 'Aceitar'}
                    </Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => handleAction('reject', s.id)} disabled={loadingId === s.id}>
                      Rejeitar
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}