"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// --- CORREÇÃO AQUI ---
// O caminho correto precisa de subir mais um nível para sair da pasta 'admin'
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../../../firebase/config'; 
// O resto do ficheiro continua igual...
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, RadioGroup, FormControlLabel, Radio,
  FormLabel, Avatar, CircularProgress, Divider, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const estadoInicialLancamento = {
    tipo: 'entrada',
    categoria: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0]
};

export default function PaginaFinancas() {
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [novoLancamento, setNovoLancamento] = useState(estadoInicialLancamento);
  const [lancamentoParaEditar, setLancamentoParaEditar] = useState<any>(null);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<any>(null);


  const fetchLancamentos = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "financas"), orderBy("data", "desc"));
      const querySnapshot = await getDocs(q);
      const lancamentosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLancamentos(lancamentosData);
    } catch (error) {
      console.error("Erro ao buscar lançamentos: ", error);
      alert("Falha ao carregar os dados financeiros.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLancamentos();
  }, [fetchLancamentos]);

  const handleAddClickOpen = () => { setNovoLancamento(estadoInicialLancamento); setAddModalOpen(true); };
  const handleAddClose = () => { setAddModalOpen(false); };
  
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const targetState = isEditModalOpen ? setLancamentoParaEditar : setNovoLancamento;
    targetState((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleSalvar = async () => {
    const lancamentoAtual = isEditModalOpen ? lancamentoParaEditar : novoLancamento;
    if (!lancamentoAtual.categoria || !lancamentoAtual.valor || !lancamentoAtual.descricao) {
      alert("Por favor, preencha Categoria, Descrição e Valor.");
      return;
    }
    const valorNumerico = parseFloat(lancamentoAtual.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
        alert("Por favor, insira um valor numérico válido e positivo.");
        return;
    }
    try {
      if (isEditModalOpen) {
        const lancamentoDocRef = doc(db, "financas", lancamentoAtual.id);
        const { id, ...dadosParaAtualizar } = lancamentoAtual;
        await updateDoc(lancamentoDocRef, { ...dadosParaAtualizar, valor: valorNumerico });
        alert(`Lançamento atualizado com sucesso!`);
        handleEditClose();
      } else {
        await addDoc(collection(db, "financas"), { ...novoLancamento, valor: valorNumerico });
        alert(`Lançamento salvo com sucesso!`);
        handleAddClose();
      }
      fetchLancamentos();
    } catch (e) {
      console.error("Erro ao salvar lançamento: ", e);
      alert("Ocorreu um erro ao salvar o lançamento.");
    }
  };

  const handleEditClickOpen = (lancamento: any) => { setLancamentoParaEditar(lancamento); setEditModalOpen(true); };
  const handleEditClose = () => { setEditModalOpen(false); setLancamentoParaEditar(null); };

  const handleDeleteClickOpen = (lancamento: any) => { setLancamentoSelecionado(lancamento); setDeleteModalOpen(true); };
  const handleDeleteClose = () => { setDeleteModalOpen(false); setLancamentoSelecionado(null); };
  const handleConfirmDelete = async () => {
    if (lancamentoSelecionado) {
      try {
        await deleteDoc(doc(db, "financas", lancamentoSelecionado.id));
        alert(`Lançamento excluído com sucesso.`);
        handleDeleteClose();
        fetchLancamentos();
      } catch (e) {
        console.error("Erro ao excluir lançamento: ", e);
        alert("Ocorreu um erro ao excluir o lançamento.");
      }
    }
  };

  const { totalEntradas, totalSaidas, saldoAtual } = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    lancamentos.forEach(lancamento => {
      const valor = Number(lancamento.valor);
      if (!isNaN(valor)) {
        if (lancamento.tipo === 'entrada') {
          entradas += valor;
        } else if (lancamento.tipo === 'saida') {
          saidas += valor;
        }
      }
    });
    return {
      totalEntradas: entradas,
      totalSaidas: saidas,
      saldoAtual: entradas - saidas
    };
  }, [lancamentos]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderFormFields = (data: any, handler: any) => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}><FormControl component="fieldset"><RadioGroup row name="tipo" value={data.tipo} onChange={handler}><FormControlLabel value="entrada" control={<Radio />} label="Entrada (Receita)" /><FormControlLabel value="saida" control={<Radio />} label="Saída (Despesa)" /></RadioGroup></FormControl></Grid>
        <Grid item xs={12}><FormControl fullWidth><InputLabel id="categoria-label">Categoria</InputLabel><Select labelId="categoria-label" name="categoria" value={data.categoria} label="Categoria" onChange={handler}>{data.tipo === 'entrada' ? ([<MenuItem key="dizimo" value="Dízimo">Dízimo</MenuItem>,<MenuItem key="oferta" value="Oferta">Oferta</MenuItem>,<MenuItem key="doacao" value="Doação Especial">Doação Especial</MenuItem>,<MenuItem key="outras-entradas" value="Outras Entradas">Outras Entradas</MenuItem>]) : ([<MenuItem key="aluguel" value="Aluguel">Aluguel</MenuItem>,<MenuItem key="contas" value="Contas (Água, Luz, etc.)">Contas (Água, Luz, etc.)</MenuItem>,<MenuItem key="material" value="Materiais de Consumo">Materiais de Consumo</MenuItem>,<MenuItem key="salarios" value="Salários/Ajuda de Custo">Salários/Ajuda de Custo</MenuItem>,<MenuItem key="doacoes" value="Doações Realizadas">Doações Realizadas</MenuItem>,<MenuItem key="eventos" value="Despesas de Eventos">Despesas de Eventos</MenuItem>,<MenuItem key="transporte" value="Transporte">Transporte</MenuItem>,<MenuItem key="outros" value="Outras Despesas">Outras Despesas</MenuItem>])}</Select></FormControl></Grid>
        <Grid item xs={12}><TextField name="descricao" label="Descrição" fullWidth value={data.descricao} onChange={handler}/></Grid>
        <Grid item xs={6}><TextField name="valor" label="Valor" type="number" fullWidth value={data.valor} onChange={handler} inputProps={{ step: "0.01" }} /></Grid>
        <Grid item xs={6}><TextField name="data" label="Data" type="date" fullWidth value={data.data} onChange={handler} InputLabelProps={{ shrink: true }}/></Grid>
    </Grid>
  );

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Lançamentos Financeiros</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddClickOpen}>Adicionar Lançamento</Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}><Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e8f5e9' }}><Avatar sx={{ bgcolor: 'success.main' }}><ArrowUpwardIcon /></Avatar><Box><Typography variant="subtitle1" color="textSecondary">Entradas</Typography><Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.dark' }}>{formatCurrency(totalEntradas)}</Typography></Box></Paper></Grid>
        <Grid item xs={12} sm={4}><Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffebee' }}><Avatar sx={{ bgcolor: 'error.main' }}><ArrowDownwardIcon /></Avatar><Box><Typography variant="subtitle1" color="textSecondary">Saídas</Typography><Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.dark' }}>{formatCurrency(totalSaidas)}</Typography></Box></Paper></Grid>
        <Grid item xs={12} sm={4}><Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e3f2fd' }}><Avatar sx={{ bgcolor: 'primary.main' }}><AttachMoneyIcon /></Avatar><Box><Typography variant="subtitle1" color="textSecondary">Saldo Atual</Typography><Typography variant="h5" sx={{ fontWeight: 'bold', color: saldoAtual >= 0 ? 'primary.dark' : 'error.main' }}>{formatCurrency(saldoAtual)}</Typography></Box></Paper></Grid>
      </Grid>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                  <TableCell sx={{fontWeight: 'bold'}}>Data</TableCell><TableCell sx={{fontWeight: 'bold'}}>Tipo</TableCell><TableCell sx={{fontWeight: 'bold'}}>Categoria</TableCell>
                  <TableCell sx={{fontWeight: 'bold'}}>Descrição</TableCell><TableCell sx={{fontWeight: 'bold', textAlign: 'right'}}>Valor (R$)</TableCell><TableCell sx={{fontWeight: 'bold', textAlign: 'center'}}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (<TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>) : lancamentos.length === 0 ? (<TableRow><TableCell colSpan={6} align="center">Nenhum lançamento encontrado.</TableCell></TableRow>) : (
                lancamentos.map((lancamento) => (
                    <TableRow hover key={lancamento.id}>
                        <TableCell>{new Date(lancamento.data + 'T00:00:00-03:00').toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell><Typography sx={{color: lancamento.tipo === 'entrada' ? 'green' : 'red', textTransform: 'capitalize'}}>{lancamento.tipo}</Typography></TableCell>
                        <TableCell>{lancamento.categoria}</TableCell><TableCell>{lancamento.descricao}</TableCell>
                        <TableCell sx={{textAlign: 'right', fontWeight: 'bold', color: lancamento.tipo === 'entrada' ? 'green' : 'red'}}>{formatCurrency(Number(lancamento.valor))}</TableCell>
                        <TableCell sx={{textAlign: 'center'}}>
                          <IconButton color="primary" size="small" onClick={() => handleEditClickOpen(lancamento)}><EditIcon /></IconButton>
                          <IconButton color="error" size="small" onClick={() => handleDeleteClickOpen(lancamento)}><DeleteIcon /></IconButton>
                        </TableCell>
                    </TableRow>
                )))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={isAddModalOpen} onClose={handleAddClose} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Novo Lançamento</DialogTitle>
        <DialogContent>{renderFormFields(novoLancamento, handleChange)}</DialogContent>
        <DialogActions><Button onClick={handleAddClose}>Cancelar</Button><Button onClick={handleSalvar} variant="contained">Salvar Lançamento</Button></DialogActions>
      </Dialog>
      <Dialog open={isEditModalOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Lançamento</DialogTitle>
        <DialogContent>{lancamentoParaEditar && renderFormFields(lancamentoParaEditar, handleChange)}</DialogContent>
        <DialogActions><Button onClick={handleEditClose}>Cancelar</Button><Button onClick={handleSalvar} variant="contained">Salvar Alterações</Button></DialogActions>
      </Dialog>
      <Dialog open={isDeleteModalOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent><Typography>Tem a certeza de que deseja excluir o lançamento <strong>"{lancamentoSelecionado?.descricao}"</strong>?</Typography><Typography color="error" variant="body2" sx={{mt: 1}}>Esta ação não pode ser desfeita.</Typography></DialogContent>
        <DialogActions><Button onClick={handleDeleteClose}>Cancelar</Button><Button onClick={handleConfirmDelete} variant="contained" color="error">Confirmar Exclusão</Button></DialogActions>
      </Dialog>
    </>
  );
}