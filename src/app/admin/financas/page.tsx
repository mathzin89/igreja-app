"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import {
  Box, Typography, Button, CircularProgress, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Alert,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Interfaces
interface Lancamento {
  id?: string;
  categoria: string;
  data: string;
  descricao: string;
  igrejaId: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  membroId?: string;
  membroNome?: string;
}
interface Membro { id: string; nome: string; }
interface UserProfile { igrejaId: string; role: string; }

const COLORS = ['#00C49F', '#FF8042'];
const CATEGORY_OPTIONS = ['Dízimo', 'Oferta', 'Aluguel', 'Salário', 'Material de Limpeza', 'Doação', 'Outras Entradas', 'Outras Saídas'];

export default function FinancasPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLancamento, setCurrentLancamento] = useState<Lancamento | null>(null);
  const [formCategoria, setFormCategoria] = useState('');
  const [formData, setFormData] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formTipo, setFormTipo] = useState<'entrada' | 'saida'>('entrada');
  const [formValor, setFormValor] = useState('');
  const [formMembroId, setFormMembroId] = useState('');
  const [formMembroNome, setFormMembroNome] = useState('');
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(new Date().toISOString().slice(0, 7));

  const resetForm = useCallback(() => {
    setCurrentLancamento(null);
    setFormCategoria('');
    setFormData('');
    setFormDescricao('');
    setFormTipo('entrada');
    setFormValor('');
    setFormMembroId('');
    setFormMembroNome('');
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setUserProfileLoading(true);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          setUserProfile(userDocSnap.exists() ? userDocSnap.data() as UserProfile : null);
        } catch (error) {
          console.error("Erro ao carregar perfil do usuário:", error);
          setUserProfile(null);
        } finally {
          setUserProfileLoading(false);
        }
      } else {
        setUserProfile(null);
        setUserProfileLoading(false);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || userProfileLoading || !userProfile?.igrejaId) {
      if (!authLoading) setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'financas'), where('igrejaId', '==', userProfile.igrejaId), orderBy('data', 'desc'));
    const unsubscribeFinancas = onSnapshot(q, (snapshot) => {
      setLancamentos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lancamento)));
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar lançamentos:", error);
      setLoading(false);
    });
    const fetchMembros = async () => {
      const membroSnapshot = await getDocs(collection(db, 'membros'));
      setMembros(membroSnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })));
    };
    fetchMembros();
    return () => unsubscribeFinancas();
  }, [user, userProfileLoading, userProfile, authLoading]);

  const totalEntradas = useMemo(() => lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0), [lancamentos]);
  const totalSaidas = useMemo(() => lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0), [lancamentos]);
  const saldoAtual = useMemo(() => totalEntradas - totalSaidas, [totalEntradas, totalSaidas]);
  const chartData = useMemo(() => [{ name: 'Entradas', value: totalEntradas }, { name: 'Saídas', value: totalSaidas }], [totalEntradas, totalSaidas]);

  const handleSaveLancamento = useCallback(async () => {
    if (!userProfile?.igrejaId) { alert('Perfil de igreja inválido.'); return; }
    if (formCategoria === 'Dízimo' && !formMembroId) { alert('Para Dízimo, selecione um membro.'); return; }
    if (!formCategoria || !formDescricao || !formValor || !formTipo) { alert('Preencha todos os campos.'); return; }
    const lancamentoData = {
      categoria: formCategoria, data: formData || new Date().toISOString().split('T')[0], descricao: formDescricao,
      igrejaId: userProfile.igrejaId, tipo: formTipo, valor: parseFloat(formValor),
      membroId: formMembroId, membroNome: formMembroNome,
    };
    try {
      if (currentLancamento?.id) {
        await updateDoc(doc(db, 'financas', currentLancamento.id), lancamentoData);
      } else {
        await addDoc(collection(db, 'financas'), lancamentoData);
      }
      setModalOpen(false);
      resetForm();
    } catch (error) { console.error("Erro ao salvar:", error); alert("Erro ao salvar."); }
  }, [userProfile, formTipo, formCategoria, formMembroId, formMembroNome, formData, formDescricao, formValor, currentLancamento, resetForm]);

  const handleEdit = useCallback((lancamento: Lancamento) => {
    setCurrentLancamento(lancamento); setFormCategoria(lancamento.categoria); setFormData(lancamento.data);
    setFormDescricao(lancamento.descricao); setFormTipo(lancamento.tipo); setFormValor(lancamento.valor.toString());
    setFormMembroId(lancamento.membroId || ''); setFormMembroNome(lancamento.membroNome || '');
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!userProfile?.igrejaId) { alert('Você não tem permissão.'); return; }
    if (window.confirm('Tem certeza que deseja deletar?')) {
      try { await deleteDoc(doc(db, 'financas', id)); }
      catch (error) { console.error("Erro ao deletar:", error); alert("Erro ao deletar."); }
    }
  }, [userProfile]);

  const getMonthYearOptions = useMemo(() => {
    const options = []; const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      options.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
    }
    return options;
  }, []);

  const generatePdfReport = async () => {
    if (!userProfile) { alert('Você precisa estar logado.'); return; }
    
    const [filterYear, filterMonth] = selectedMonthYear.split('-').map(Number);
    const filteredLancamentos = lancamentos.filter(l => {
      const [lancYear, lancMonth] = String(l.data ?? '').split('-').map(Number);
      return lancYear === filterYear && lancMonth === filterMonth;
    }).sort((a, b) => String(a.data ?? '').localeCompare(String(b.data ?? '')));

    if (filteredLancamentos.length === 0) { alert(`Não há lançamentos para o mês selecionado.`); return; }

    let templateBase64 = '';
    let logoBase64 = '';
    try {
      const templateUrl = "https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/Ficha.jpg?alt=media&token=f5858592-130f-4956-9952-2da2ec771737";
      const logoUrl = "https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/logo-plenitude.png?alt=media&token=1a61b486-b9a6-49ab-bfc1-56140700f9cb";

      const fetchAsBase64 = async (url: string) => {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
          });
      };
      templateBase64 = await fetchAsBase64(templateUrl);
      logoBase64 = await fetchAsBase64(logoUrl);

    } catch (error) { console.error("Erro ao carregar imagens para o PDF:", error); }

    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    const addPageTemplateAndWatermark = () => {
      if (templateBase64) {
        const templateData = templateBase64.substring(templateBase64.indexOf(',') + 1);
        doc.addImage(templateData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
      }
      if (logoBase64) {
        const logoData = logoBase64.substring(logoBase64.indexOf(',') + 1);
        const watermarkWidth = 300;
        const watermarkHeight = (watermarkWidth / 45) * 30;
        const watermarkX = (pageWidth - watermarkWidth) / 2;
        const watermarkY = (pageHeight - watermarkHeight) / 2;
        doc.setGState(new (doc as any).GState({opacity: 0.30}));
        doc.addImage(logoData, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight, undefined, 'NONE');
        doc.setGState(new (doc as any).GState({opacity: 1}));
      }
    };
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const displayMonth = monthNames[filterMonth - 1];
    doc.text(`Relatório de ${displayMonth} ${filterYear}`, pageWidth / 2, 160, { align: 'center' });

    const tableColumn = ["Data", "Descrição", "Tipo", "Membro", "Categoria", "Valor"];
    const tableRows = filteredLancamentos.map(lanc => [
        new Date(String(lanc.data ?? '')).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
        String(lanc.descricao ?? ''),
        lanc.tipo === 'entrada' ? 'Entrada' : 'Saída',
        String(lanc.membroNome ?? ''),
        String(lanc.categoria ?? ''),
        `R$ ${(lanc.valor ?? 0).toFixed(2).replace('.', ',')}`
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 180,
        theme: 'grid',
        headStyles: { fillColor: '#f2f2f2', textColor: '#333', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        willDrawPage: (data) => {
            addPageTemplateAndWatermark();
        },
        didParseCell: (data) => {
            if (data.section !== 'body') return;
            const lancamento = filteredLancamentos[data.row.index];
            if (!lancamento) return;
            if (data.column.index === 2 || data.column.index === 5) {
                if (lancamento.tipo === 'entrada') {
                    data.cell.styles.fillColor = '#dcfce7';
                    data.cell.styles.textColor = '#166534';
                } else if (lancamento.tipo === 'saida') {
                    data.cell.styles.fillColor = '#fee2e2';
                    data.cell.styles.textColor = '#991b1b';
                }
            }
        },
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    const footerStartY = pageHeight - 120;
    
    let summaryY = finalY + 20;
    if (summaryY > footerStartY - 80) {
        doc.addPage();
        summaryY = 180;
    }
    
    const totalEntradasFiltrado = filteredLancamentos.filter(l => l.tipo === 'entrada').reduce((sum, l) => sum + (l.valor ?? 0), 0);
    const totalSaidasFiltrado = filteredLancamentos.filter(l => l.tipo === 'saida').reduce((sum, l) => sum + (l.valor ?? 0), 0);
    const saldoAtualFiltrado = totalEntradasFiltrado - totalSaidasFiltrado;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text("Entrada:", margin, summaryY);
    doc.setTextColor(0, 128, 0);
    doc.text(`R$ ${totalEntradasFiltrado.toFixed(2).replace('.', ',')}`, pageWidth - margin, summaryY, { align: 'right' });
    summaryY += 18;
    doc.setTextColor(50, 50, 50);
    doc.text("Saida:", margin, summaryY);
    doc.setTextColor(220, 0, 0);
    doc.text(`R$ ${totalSaidasFiltrado.toFixed(2).replace('.', ',')}`, pageWidth - margin, summaryY, { align: 'right' });
    summaryY += 18;
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, summaryY, pageWidth - margin, summaryY);
    summaryY += 18;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text("Saldo Total:", margin, summaryY);
    doc.setTextColor(saldoAtualFiltrado >= 0 ? '#0d47a1' : '#d32f2f');
    doc.text(`R$ ${saldoAtualFiltrado.toFixed(2).replace('.', ',')}`, pageWidth - margin, summaryY, { align: 'right' });

    let signatureY = footerStartY + 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const signatureLineLength = 180;
    const signatureCenterX_Left = pageWidth / 4 + 20;
    const signatureCenterX_Right = (pageWidth / 4) * 3 - 20;

    doc.line(signatureCenterX_Left - (signatureLineLength/2), signatureY, signatureCenterX_Left + (signatureLineLength/2), signatureY);
    doc.text("Assinatura do Pastor Local", signatureCenterX_Left, signatureY + 12, { align: 'center' });
    doc.line(signatureCenterX_Right - (signatureLineLength/2), signatureY, signatureCenterX_Right + (signatureLineLength/2), signatureY);
    doc.text("Assinatura do Presidente Presidente", signatureCenterX_Right, signatureY + 12, { align: 'center' });

    doc.save(`relatorio_financeiro_${selectedMonthYear}.pdf`);
  };

  if (authLoading || userProfileLoading) {
    return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Carregando...</Typography></Box>);
  }
  if (!user) {
    return (<Box sx={{ p: 3, textAlign: 'center' }}><Alert severity="error">Acesso negado.</Alert><Button component={Link} href="/login" variant="contained" sx={{ mt: 2 }}>Fazer Login</Button></Box>);
  }
  if (!userProfile?.igrejaId) {
    return (<Box sx={{ p: 3, textAlign: 'center' }}><Alert severity="error">Perfil de usuário incompleto.</Alert></Box>);
  }
  if (loading) {
    return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Carregando dados...</Typography></Box>);
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Lançamentos Financeiros da Igreja: {userProfile.igrejaId}</Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => { resetForm(); setModalOpen(true); }}>Adicionar Lançamento</Button>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Mês/Ano Relatório</InputLabel>
          <Select value={selectedMonthYear} label="Mês/Ano Relatório" onChange={(e) => setSelectedMonthYear(e.target.value)}>
            {getMonthYearOptions.map((option) => (<MenuItem key={option} value={option}>{new Date(option + '-02T00:00:00Z').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</MenuItem>))}
          </Select>
        </FormControl>
        <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={generatePdfReport}>Gerar Relatório PDF</Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ textAlign: 'center' }}><Typography variant="h6">Entradas</Typography><Typography variant="h5" color="success.main">R$ {totalEntradas.toFixed(2).replace('.', ',')}</Typography></Box>
        <Box sx={{ textAlign: 'center' }}><Typography variant="h6">Saídas</Typography><Typography variant="h5" color="error.main">R$ {totalSaidas.toFixed(2).replace('.', ',')}</Typography></Box>
        <Box sx={{ textAlign: 'center' }}><Typography variant="h6">Saldo Atual</Typography><Typography variant="h4" color={saldoAtual >= 0 ? 'primary.main' : 'error.main'}>R$ {saldoAtual.toFixed(2).replace('.', ',')}</Typography></Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow><TableCell>Data</TableCell><TableCell>Descrição</TableCell><TableCell>Tipo</TableCell><TableCell>Categoria</TableCell><TableCell>Membro</TableCell><TableCell align="right">Valor (R$)</TableCell><TableCell align="center">Ações</TableCell></TableRow></TableHead>
          <TableBody>
            {lancamentos.length === 0 ? (<TableRow><TableCell colSpan={7} align="center">Nenhum lançamento encontrado.</TableCell></TableRow>) : (
              lancamentos.map((lanc) => (
                <TableRow key={lanc.id}>
                  <TableCell>{new Date(lanc.data + 'T12:00:00Z').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{lanc.descricao}</TableCell>
                  <TableCell sx={{ color: lanc.tipo === 'entrada' ? 'success.main' : 'error.main' }}>{lanc.tipo.charAt(0).toUpperCase() + lanc.tipo.slice(1)}</TableCell>
                  <TableCell>{lanc.categoria}</TableCell>
                  <TableCell>{lanc.membroNome || '-'}</TableCell>
                  <TableCell align="right">R$ {lanc.valor.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(lanc)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => lanc.id && handleDelete(lanc.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField margin="dense" label="ID da Igreja" type="text" fullWidth value={userProfile?.igrejaId || ''} InputProps={{ readOnly: true }} />
              <FormControl fullWidth margin="normal"><InputLabel>Tipo</InputLabel><Select value={formTipo} onChange={(e) => setFormTipo(e.target.value as 'entrada' | 'saida')}><MenuItem value="entrada">Entrada</MenuItem><MenuItem value="saida">Saída</MenuItem></Select></FormControl>
              <FormControl fullWidth margin="normal"><InputLabel>Categoria</InputLabel><Select value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)}>{CATEGORY_OPTIONS.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}</Select></FormControl>
              <FormControl fullWidth margin="normal"><InputLabel>{formCategoria === 'Dízimo' ? 'Membro (obrigatório)' : 'Membro (opcional)'}</InputLabel><Select value={formMembroId} onChange={(e) => { const id = e.target.value; setFormMembroId(id); setFormMembroNome(membros.find(m => m.id === id)?.nome || ''); }}><MenuItem value=""><em>Nenhum</em></MenuItem>{membros.map(m => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}</Select></FormControl>
              <TextField margin="dense" label="Descrição" type="text" fullWidth value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} />
              <TextField margin="dense" label="Valor" type="number" fullWidth value={formValor} onChange={(e) => setFormValor(e.target.value)} inputProps={{ step: "0.01" }} />
              <TextField margin="dense" label="Data" type="date" fullWidth value={formData} onChange={(e) => setFormData(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(totalEntradas + totalSaidas) === 0 ? (<Box sx={{ height: 250, display: 'flex', alignItems: 'center' }}><Typography color="text.secondary">Sem dados para gráfico.</Typography></Box>) : (
                <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${((value as number) / (totalEntradas + totalSaidas) * 100).toFixed(0)}%`} >{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value: string | number) => `R$ ${parseFloat(value.toString()).toFixed(2).replace('.', ',')}`} /><Legend /></PieChart></ResponsiveContainer>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveLancamento} color="primary" variant="contained">{currentLancamento ? 'Salvar' : 'Adicionar'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}