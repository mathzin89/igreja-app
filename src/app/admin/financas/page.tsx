"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getIgrejaNome } from '../../../firebase/utils';
import { getLocalFilesAsBase64 } from './actions';

// Importações do date-fns para manipulação de datas
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Box, Typography, Button, CircularProgress, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Alert,
  Card // ✅ NOVO: Importando o Card
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

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

const CATEGORY_OPTIONS = ['Dízimo', 'Oferta', 'Aluguel', 'Material de Limpeza', 'Doação', 'Outras Entradas', 'Outras Saídas'];

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
  const [igrejaNome, setIgrejaNome] = useState<string>('');

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const resetForm = useCallback(() => {
    setCurrentLancamento(null);
    setFormCategoria('');
    setFormData(new Date().toISOString().split('T')[0]);
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
    if (userProfile?.igrejaId) {
      getIgrejaNome(userProfile.igrejaId).then(nome => {
        setIgrejaNome(nome);
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user || userProfileLoading || !userProfile?.igrejaId) {
      if (!authLoading) setLoading(false);
      return;
    }
    setLoading(true);

    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);

    const q = query(
      collection(db, 'financas'),
      where('igrejaId', '==', userProfile.igrejaId),
      where('data', '>=', format(startDate, 'yyyy-MM-dd')),
      where('data', '<=', format(endDate, 'yyyy-MM-dd')),
      orderBy('data', 'desc')
    );

    const unsubscribeFinancas = onSnapshot(q, (snapshot) => {
      const lancamentosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lancamento));
      setLancamentos(lancamentosData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar lançamentos:", error);
      setLoading(false);
    });

    const fetchMembros = async () => {
      const membroQuery = query(collection(db, 'membros'), where('igrejaId', '==', userProfile.igrejaId), orderBy('nome', 'asc'));
      const membroSnapshot = await getDocs(membroQuery);
      setMembros(membroSnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome } as Membro)));
    };
    fetchMembros();

    return () => unsubscribeFinancas();
  }, [user, userProfileLoading, userProfile, authLoading, currentMonth]);

  const totalEntradasMes = useMemo(() => lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0), [lancamentos]);
  const totalSaidasMes = useMemo(() => lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0), [lancamentos]);
  const saldoMes = useMemo(() => totalEntradasMes - totalSaidasMes, [totalEntradasMes, totalSaidasMes]);

  const handleSaveLancamento = useCallback(async () => {
    if (!userProfile?.igrejaId) { alert('Perfil de igreja inválido.'); return; }
    if (formCategoria === 'Dízimo' && !formMembroId) { alert('Para Dízimo, selecione um membro.'); return; }
    if (!formCategoria || !formValor || !formTipo) { alert('Preencha os campos obrigatórios.'); return; }

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
    const reportStartDate = new Date(filterYear, filterMonth - 1, 1);
    const reportEndDate = endOfMonth(reportStartDate);

    setLoading(true);
    let filteredLancamentos: Lancamento[] = [];
    try {
      const reportQuery = query(
        collection(db, 'financas'),
        where('igrejaId', '==', userProfile.igrejaId),
        where('data', '>=', format(reportStartDate, 'yyyy-MM-dd')),
        where('data', '<=', format(reportEndDate, 'yyyy-MM-dd')),
        orderBy('data', 'asc')
      );
      const reportSnapshot = await getDocs(reportQuery);
      filteredLancamentos = reportSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lancamento));
    } catch (error) {
      console.error("Erro ao buscar dados para o relatório:", error);
      alert("Falha ao buscar dados para o relatório.");
      setLoading(false);
      return;
    }
    setLoading(false);

    if (filteredLancamentos.length === 0) {
      alert(`Não há lançamentos para o mês selecionado no relatório.`);
      return;
    }

    let templatePage1Base64 = '';
    let templateContinuationBase64 = '';
    let logoBase64 = '';
    try {
      const result = await getLocalFilesAsBase64(['Ficha.jpg', 'Ficha_fundo.jpg', 'logo-plenitude.png']);
      if (result.success && result.images && result.images.length >= 3) {
        templatePage1Base64 = result.images[0];
        templateContinuationBase64 = result.images[1];
        logoBase64 = result.images[2];
      } else {
        throw new Error(result.message || "Falha ao buscar imagens no servidor.");
      }
    } catch (error) {
      console.error("Erro ao carregar imagens para o PDF:", error);
    }

    const docPDF = new jsPDF('p', 'pt', 'a4');
    const pageWidth = docPDF.internal.pageSize.getWidth();
    const pageHeight = docPDF.internal.pageSize.getHeight();
    const margin = 40;
    const rowsPerPage = 22;
    const chunks = [];
    for (let i = 0; i < filteredLancamentos.length; i += rowsPerPage) {
      chunks.push(filteredLancamentos.slice(i, i + rowsPerPage));
    }

    let finalY = 0;
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const displayMonth = monthNames[filterMonth - 1];

    chunks.forEach((chunk, index) => {
      if (index > 0) {
        docPDF.addPage();
      }
      const pageNumber = index + 1;
      
      const applyTemplateAndWatermark = () => {
        if (pageNumber === 1) {
          if (templatePage1Base64) docPDF.addImage(templatePage1Base64, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
        } else {
          if (templateContinuationBase64) docPDF.addImage(templateContinuationBase64, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
        }
        if (logoBase64) {
          const watermarkWidth = 300;
          const watermarkHeight = (watermarkWidth / 45) * 30;
          const watermarkX = (pageWidth - watermarkWidth) / 2;
          const watermarkY = (pageHeight - watermarkHeight) / 2;
          docPDF.setGState(new (docPDF as any).GState({ opacity: 0.15 }));
          docPDF.addImage(logoBase64, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight, undefined, 'NONE');
          docPDF.setGState(new (docPDF as any).GState({ opacity: 1 }));
        }
      };
      
      applyTemplateAndWatermark();

      if (pageNumber === 1) {
        docPDF.setFontSize(18);
        docPDF.setFont('helvetica', 'bold');
        docPDF.setTextColor(0, 0, 0);
        docPDF.text(`Relatório de ${displayMonth} ${filterYear}`, pageWidth / 2, 160, { align: 'center' });
      } else {
        docPDF.setFontSize(18);
        docPDF.setFont('helvetica', 'bold');
        docPDF.setTextColor(0, 0, 0);
        docPDF.text(`Relatório de ${displayMonth} ${filterYear} (Cont.)`, pageWidth / 2, 80, { align: 'center' });
      }

      const tableRowsForChunk = chunk.map(lanc => [
        new Date(lanc.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        lanc.descricao,
        lanc.tipo.charAt(0).toUpperCase() + lanc.tipo.slice(1),
        lanc.membroNome || '-',
        lanc.categoria,
        `R$ ${lanc.valor.toFixed(2).replace('.', ',')}`
      ]);

      autoTable(docPDF, {
        head: [["Data", "Descrição", "Tipo", "Membro", "Categoria", "Valor"]],
        body: tableRowsForChunk,
        startY: pageNumber === 1 ? 180 : 100,
        theme: 'grid',
        margin: { top: 0, bottom: 0, left: 40, right: 40 },
        styles: {
            cellPadding: 4,
            fontSize: 9,
            valign: 'middle',
        },
        headStyles: {
            fillColor: [230, 230, 230],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 50 },
            3: { cellWidth: 100 },
            4: { cellWidth: 80 },
            5: { cellWidth: 80, halign: 'right' },
        },
        didParseCell: (data) => {
            const lancamento = chunk[data.row.index];
            if (!lancamento) return;
            
            if (data.section === 'body' && (data.column.index === 2 || data.column.index === 5)) {
              if (lancamento.tipo === 'entrada') {
                  data.cell.styles.textColor = [0, 100, 0];
              } else if (lancamento.tipo === 'saida') {
                  data.cell.styles.textColor = [200, 0, 0];
              }
            }
        },
      });
      finalY = (docPDF as any).lastAutoTable.finalY;
    });

    const totalEntradasFiltrado = filteredLancamentos.filter(l => l.tipo === 'entrada').reduce((sum, l) => sum + l.valor, 0);
    const totalSaidasFiltrado = filteredLancamentos.filter(l => l.tipo === 'saida').reduce((sum, l) => sum + l.valor, 0);
    const saldoAtualFiltrado = totalEntradasFiltrado - totalSaidasFiltrado;

    const summaryRows: RowInput[] = [
      [{ content: 'Total Entradas:', styles: { halign: 'right', fontStyle: 'bold' } }, { content: `R$ ${totalEntradasFiltrado.toFixed(2).replace('.', ',')}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 128, 0] } }],
      [{ content: 'Total Saídas:', styles: { halign: 'right', fontStyle: 'bold' } }, { content: `R$ ${totalSaidasFiltrado.toFixed(2).replace('.', ',')}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [220, 0, 0] } }],
      [{ content: 'Saldo Total do Mês:', styles: { halign: 'right', fontStyle: 'bold' } }, { content: `R$ ${saldoAtualFiltrado.toFixed(2).replace('.', ',')}`, styles: { halign: 'right', fontStyle: 'bold', textColor: saldoAtualFiltrado >= 0 ? [0, 0, 200] : [220, 0, 0] } }],
    ];
    
    if (finalY + 100 > pageHeight - margin) {
        docPDF.addPage();
        if (templateContinuationBase64) docPDF.addImage(templateContinuationBase64, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
        finalY = 100;
    } else {
        finalY += 20;
    }

    autoTable(docPDF, {
      body: summaryRows,
      startY: finalY,
      theme: 'plain',
      tableWidth: 300,
      margin: { left: pageWidth - margin - 300 },
      columnStyles: { 0: { cellWidth: 200 }, 1: { cellWidth: 100 } },
    });

    const signatureY = pageHeight - margin - 50;
    docPDF.setFontSize(10);
    docPDF.setFont('helvetica', 'normal');
    docPDF.setTextColor(0, 0, 0);
    const signatureLineLength = 180;
    const signatureCenterX_Left = pageWidth / 4 + 20;
    const signatureCenterX_Right = (pageWidth / 4) * 3 - 20;
    docPDF.line(signatureCenterX_Left - (signatureLineLength / 2), signatureY, signatureCenterX_Left + (signatureLineLength / 2), signatureY);
    docPDF.text("Assinatura do Pastor Local", signatureCenterX_Left, signatureY + 12, { align: 'center' });
    docPDF.line(signatureCenterX_Right - (signatureLineLength / 2), signatureY, signatureCenterX_Right + (signatureLineLength / 2), signatureY);
    docPDF.text("Assinatura do Presidente", signatureCenterX_Right, signatureY + 12, { align: 'center' });

    docPDF.save(`relatorio_financeiro_${selectedMonthYear}.pdf`);
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

  return (
    <>
      <Typography variant="h4" sx={{ mb: 1 }}>Lançamentos Financeiros: {igrejaNome}</Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => { resetForm(); setModalOpen(true); }}>Adicionar Lançamento</Button>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Mês/Ano Relatório</InputLabel>
          <Select value={selectedMonthYear} label="Mês/Ano Relatório" onChange={(e) => setSelectedMonthYear(e.target.value)}>
            {getMonthYearOptions.map((option) => (<MenuItem key={option} value={option}>{new Date(option + '-02T00:00:00Z').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</MenuItem>))}
          </Select>
        </FormControl>
        <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={generatePdfReport}>Gerar Relatório PDF</Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1 }}>
        <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography variant="h6" sx={{ textTransform: 'capitalize', width: '200px', textAlign: 'center' }}>
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </Typography>
        <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      <Paper elevation={3} sx={{ p: 1.5, mb: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ textAlign: 'center' }}><Typography variant="body1">Entradas no Mês</Typography><Typography variant="h5" color="success.main">R$ {totalEntradasMes.toFixed(2).replace('.', ',')}</Typography></Box>
        <Box sx={{ textAlign: 'center' }}><Typography variant="body1">Saídas no Mês</Typography><Typography variant="h5" color="error.main">R$ {totalSaidasMes.toFixed(2).replace('.', ',')}</Typography></Box>
        <Box sx={{ textAlign: 'center' }}><Typography variant="body1">Saldo do Mês</Typography><Typography variant="h4" color={saldoMes >= 0 ? 'primary.main' : 'error.main'}>R$ {saldoMes.toFixed(2).replace('.', ',')}</Typography></Box>
      </Paper>

      {/* ÁREA DA TABELA MODIFICADA */}
      <Card sx={{ 
        p: 2, 
        height: '70vh', // Define uma altura fixa (70% da altura da tela)
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {loading ? (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : lancamentos.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>Nenhum lançamento encontrado para {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Motivo/Culto</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Membro</TableCell>
                  <TableCell align="right">Valor (R$)</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lancamentos.map((lanc) => (
                  <TableRow key={lanc.id} hover>
                    <TableCell>{new Date(lanc.data + 'T12:00:00Z').toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{lanc.descricao}</TableCell>
                    <TableCell sx={{ color: lanc.tipo === 'entrada' ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                      {lanc.tipo.charAt(0).toUpperCase() + lanc.tipo.slice(1)}
                    </TableCell>
                    <TableCell>{lanc.categoria}</TableCell>
                    <TableCell>{lanc.membroNome || '-'}</TableCell>
                    <TableCell align="right">R$ {lanc.valor.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(lanc)}><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => lanc.id && handleDelete(lanc.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
          >
            <TextField label="ID da Igreja" type="text" fullWidth value={userProfile?.igrejaId || ''} InputProps={{ readOnly: true }} size="small" />
            <TextField label="Valor" type="number" fullWidth value={formValor} onChange={(e) => setFormValor(e.target.value)} inputProps={{ step: "0.01" }} size="small" />
            <TextField label="Data" type="date" fullWidth value={formData} onChange={(e) => setFormData(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select value={formTipo} label="Tipo" onChange={(e) => setFormTipo(e.target.value as 'entrada' | 'saida')}>
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select value={formCategoria} label="Categoria" onChange={(e) => setFormCategoria(e.target.value)}>
                {CATEGORY_OPTIONS.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>{formCategoria === 'Dízimo' ? 'Membro (obrigatório)' : 'Membro (opcional)'}</InputLabel>
              <Select value={formMembroId} label={formCategoria === 'Dízimo' ? 'Membro (obrigatório)' : 'Membro (opcional)'} onChange={(e) => { const id = e.target.value; setFormMembroId(id); setFormMembroNome(membros.find(m => m.id === id)?.nome || ''); }}>
                <MenuItem value=""><em>Nenhum</em></MenuItem>
                {membros.map(m => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Motivo/Culto (Opcional)" type="text" fullWidth value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} size="small" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveLancamento} color="primary" variant="contained">{currentLancamento ? 'Salvar Alterações' : 'Adicionar'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}