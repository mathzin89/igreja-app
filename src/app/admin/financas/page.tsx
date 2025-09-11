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

interface Membro {
  id: string;
  nome: string;
}

interface UserProfile {
    igrejaId: string;
    role: string;
}

const COLORS = ['#00C49F', '#FF8042'];

const CATEGORY_OPTIONS = [
  'Dízimo',
  'Oferta',
  'Aluguel',
  'Salário',
  'Material de Limpeza',
  'Doação',
  'Outras Entradas',
  'Outras Saídas',
];

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

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(currentMonth);

  const resetForm = () => {
    setCurrentLancamento(null);
    setFormCategoria('');
    setFormData('');
    setFormDescricao('');
    setFormTipo('entrada');
    setFormValor('');
    setFormMembroId('');
    setFormMembroNome('');
  };

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
            if (userDocSnap.exists()) {
                setUserProfile(userDocSnap.data() as UserProfile);
            } else {
                console.warn("Documento de perfil de usuário não encontrado para o UID:", currentUser.uid);
                setUserProfile(null);
            }
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
    if (!user || userProfileLoading || !userProfile || !userProfile.igrejaId) {
      if (!user && !authLoading) {
          setLoading(false);
      }
      return;
    }

    setLoading(true);

    const userIgrejaId = userProfile.igrejaId;

    const q = query(
      collection(db, 'financas'),
      where('igrejaId', '==', userIgrejaId),
      orderBy('data', 'desc')
    );

    const unsubscribeFinancas = onSnapshot(q, (snapshot) => {
      const financasData: Lancamento[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Lancamento, 'id'>
      }));
      setLancamentos(financasData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar lançamentos:", error);
      setLoading(false);
    });

    const fetchMembros = async () => {
      try {
        const membrosCol = collection(db, 'membros');
        const membroSnapshot = await getDocs(membrosCol);
        const membrosList: Membro[] = membroSnapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
        }));
        setMembros(membrosList);
      } catch (error) {
        console.error("Erro ao carregar membros:", error);
      }
    };
    fetchMembros();

    return () => unsubscribeFinancas();
  }, [user, userProfileLoading, userProfile, authLoading]);

  const totalEntradas = useMemo(() => {
    return lancamentos.filter(lanc => lanc.tipo === 'entrada').reduce((sum, lanc) => sum + lanc.valor, 0);
  }, [lancamentos]);

  const totalSaidas = useMemo(() => {
    return lancamentos.filter(lanc => lanc.tipo === 'saida').reduce((sum, lanc) => sum + lanc.valor, 0);
  }, [lancamentos]);

  const saldoAtual = useMemo(() => {
    return totalEntradas - totalSaidas;
  }, [totalEntradas, totalSaidas]);

  const chartData = useMemo(() => [
    { name: 'Entradas', value: totalEntradas },
    { name: 'Saídas', value: totalSaidas },
  ], [totalEntradas, totalSaidas]);

  const handleSaveLancamento = useCallback(async () => {
    if (!user || !userProfile || !userProfile.igrejaId) {
      alert('Você precisa estar logado com um perfil de igreja válido para salvar lançamentos.');
      return;
    }

    if (formCategoria === 'Dízimo' && !formMembroId) {
        alert('Para lançamentos de Dízimo, selecione um membro.');
        return;
    }
    if (!formCategoria || !formDescricao || !formValor || !formTipo) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const lancamentoDataToSave: { [key: string]: any } = {
      categoria: formCategoria,
      data: formData || new Date().toISOString().split('T')[0],
      descricao: formDescricao,
      igrejaId: userProfile.igrejaId,
      tipo: formTipo,
      valor: parseFloat(formValor),
    };

    if (formMembroId) {
      lancamentoDataToSave.membroId = formMembroId;
      lancamentoDataToSave.membroNome = formMembroNome;
    }

    try {
      if (currentLancamento && currentLancamento.id) {
        const docRef = doc(db, 'financas', currentLancamento.id);
        await updateDoc(docRef, lancamentoDataToSave);
      } else {
        await addDoc(collection(db, 'financas'), lancamentoDataToSave);
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar lançamento:", error);
      alert("Erro ao salvar lançamento. Tente novamente.");
    }
  }, [user, userProfile, formTipo, formCategoria, formMembroId, formMembroNome, formData, formDescricao, formValor, currentLancamento, resetForm]);

  const handleEdit = useCallback((lancamento: Lancamento) => {
    if (!user || !userProfile || !userProfile.igrejaId) {
      alert('Você precisa estar logado para editar lançamentos.');
      return;
    }
    setCurrentLancamento(lancamento);
    setFormCategoria(lancamento.categoria);
    setFormData(lancamento.data);
    setFormDescricao(lancamento.descricao);
    setFormTipo(lancamento.tipo);
    setFormValor(lancamento.valor.toString());
    setFormMembroId(lancamento.membroId || '');
    setFormMembroNome(lancamento.membroNome || '');
    setModalOpen(true);
  }, [user, userProfile]);

  const handleDelete = useCallback(async (id: string) => {
    if (!user || !userProfile || !userProfile.igrejaId) {
      alert('Você precisa estar logado para deletar lançamentos.');
      return;
    }
    const lancamentoToDelete = lancamentos.find(l => l.id === id);
    if (lancamentoToDelete && lancamentoToDelete.igrejaId !== userProfile.igrejaId) {
        alert('Você não tem permissão para deletar este lançamento.');
        return;
    }

    if (window.confirm('Tem certeza que deseja deletar este lançamento?')) {
      try {
        await deleteDoc(doc(db, 'financas', id));
      } catch (error) {
        console.error("Erro ao deletar lançamento:", error);
        alert("Erro ao deletar lançamento. Tente novamente.");
      }
    }
  }, [user, userProfile, lancamentos]);

  const getMonthYearOptions = useMemo(() => {
    const options: string[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11

    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      options.push(`${year}-${month}`);
    }
    return options.sort((a,b) => b.localeCompare(a));
  }, []);

// =esversion: 6
// =================================================================================
// ==================== FUNÇÃO DE GERAR PDF ====================
const generatePdfReport = () => {
  if (!user || !userProfile || !userProfile.igrejaId) {
    alert('Você precisa estar logado com um perfil de igreja válido para gerar o relatório.');
    return;
  }

  const [filterYear, filterMonth] = selectedMonthYear.split('-').map(Number);

  // Filtrar lançamentos do mês selecionado de forma segura
  const filteredLancamentos = lancamentos
    .filter(l => {
      const dataStr = String(l.data ?? '');
      const [lancYear, lancMonth] = dataStr.split('-').map(Number);
      return lancYear === filterYear && lancMonth === filterMonth;
    })
    .sort((a, b) => String(a.data ?? '').localeCompare(String(b.data ?? '')));

  if (filteredLancamentos.length === 0) {
    alert(`Não há lançamentos para o mês ${new Date(filterYear, filterMonth - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.`);
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  const totalEntradasFiltrado = filteredLancamentos
    .filter(l => l.tipo === 'entrada')
    .reduce((sum, l) => sum + (l.valor ?? 0), 0);
  const totalSaidasFiltrado = filteredLancamentos
    .filter(l => l.tipo === 'saida')
    .reduce((sum, l) => sum + (l.valor ?? 0), 0);
  const saldoAtualFiltrado = totalEntradasFiltrado - totalSaidasFiltrado;

  // --- Cabeçalho ---
  const headerHeight = 15;
  doc.setFillColor(173, 216, 230);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Assembléia de Deus Plenitude', pageWidth / 2, headerHeight / 2 + 1, { align: 'center', baseline: 'middle' });

  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');

  // --- Título ---
  doc.setFontSize(18);
  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const displayMonth = monthNames[filterMonth - 1];
  doc.text(`Relatório de ${displayMonth} ${filterYear}`, pageWidth / 2, headerHeight + 10, { align: 'center' });

  // --- Tabela ---
  const tableColumn = ["Data", "Descrição", "Tipo", "Membro", "Categoria", "Valor"];
  const tableRows = filteredLancamentos.map(lanc => [
    new Date(String(lanc.data ?? '')).toLocaleDateString('pt-BR'),
    String(lanc.descricao ?? ''),
    lanc.tipo === 'entrada' ? 'Entrada' : 'Saída',
    String(lanc.membroNome ?? ''),
    String(lanc.categoria ?? ''),
    `R$ ${(lanc.valor ?? 0).toFixed(2).replace('.', ',')}`
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: headerHeight + 20,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
    columnStyles: { 5: { halign: 'right' } },
didDrawCell: function(data) {
  if (data.section !== 'body') return;

  const lancamento = filteredLancamentos[data.row.index];
  if (!lancamento) return;

  const isValueColumn = data.column.index === 5;
  const isTypeColumn = data.column.index === 2;

  if (isValueColumn || isTypeColumn) {
    const fillColor: [number, number, number] = lancamento.tipo === 'entrada'
      ? [220, 255, 220]
      : [255, 220, 220];
    doc.setFillColor(...fillColor);
    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');

    // Garantir que o texto nunca seja undefined
    const originalText = String(data.cell.text?.[0] ?? '');
    const textX = data.cell.x + (isValueColumn ? data.cell.width - 2 : 2);
    const textY = data.cell.y + data.cell.height / 2;

    doc.setTextColor(
      lancamento.tipo === 'entrada' ? 0 : 220,
      lancamento.tipo === 'entrada' ? 100 : 20,
      lancamento.tipo === 'entrada' ? 0 : 60
    );
    doc.text(originalText, textX, textY, { baseline: 'middle', align: isValueColumn ? 'right' : 'left' });
  }
},
    didDrawPage: (data) => {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${data.pageNumber}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
    }
  });

  // --- Resumo ---
  const tableBottomY = (doc as any).lastAutoTable.finalY;
  let summaryY = tableBottomY + 15;
  if (summaryY > pageHeight - 40) { doc.addPage(); summaryY = margin; }

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');

  const summaryXLabel = margin;
  const summaryXValue = pageWidth - margin;

  doc.setTextColor(50, 50, 50);
  doc.text("Valor total que entrou:", summaryXLabel, summaryY);
  doc.setTextColor(0, 128, 0);
  doc.text(`R$ ${totalEntradasFiltrado.toFixed(2).replace('.', ',')}`, summaryXValue, summaryY, { align: 'right' });
  summaryY += 8;

  doc.setTextColor(50, 50, 50);
  doc.text("Valor total que saiu:", summaryXLabel, summaryY);
  doc.setTextColor(220, 0, 0);
  doc.text(`R$ ${totalSaidasFiltrado.toFixed(2).replace('.', ',')}`, summaryXValue, summaryY, { align: 'right' });
  summaryY += 8;

  doc.setDrawColor(180, 180, 180);
  doc.line(margin, summaryY, pageWidth - margin, summaryY);
  summaryY += 8;

  doc.setFont(undefined, 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text("Saldo (Valor total que sobrou):", summaryXLabel, summaryY);
  doc.setTextColor(saldoAtualFiltrado >= 0 ? 0 : 220, saldoAtualFiltrado >= 0 ? 128 : 0, 0);
  doc.text(`R$ ${saldoAtualFiltrado.toFixed(2).replace('.', ',')}`, summaryXValue, summaryY, { align: 'right' });

  doc.save(`relatorio_financas_${selectedMonthYear}.pdf`);
};


  if (authLoading || userProfileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {authLoading ? 'Verificando autenticação...' : 'Carregando perfil do usuário...'}
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">Você precisa estar logado para acessar esta página.</Alert>
        <Button component={Link} href="/login" variant="contained" sx={{ mt: 2 }}>
          Fazer Login
        </Button>
      </Box>
    );
  }

  if (!userProfile || !userProfile.igrejaId) {
    return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="error">
                Perfil de usuário incompleto. Não foi possível determinar o ID da igreja.
            </Alert>
            <Typography variant="body2" sx={{ mt: 2 }}>
                Por favor, verifique se seu usuário tem um documento na coleção 'users' com um campo 'igrejaId'.
            </Typography>
            <Button component={Link} href="/logout" variant="contained" sx={{ mt: 2 }}>
                Tentar Sair e Entrar Novamente
            </Button>
        </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando dados financeiros da igreja "{userProfile.igrejaId}"...</Typography>
      </Box>
    );
  }

  const totalGeral = totalEntradas + totalSaidas;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lançamentos Financeiros da Igreja: {userProfile.igrejaId}
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => { resetForm(); setModalOpen(true); }}
        >
          Adicionar Lançamento
        </Button>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="select-month-year-label">Mês/Ano Relatório</InputLabel>
          <Select
            labelId="select-month-year-label"
            value={selectedMonthYear}
            label="Mês/Ano Relatório"
            onChange={(e) => setSelectedMonthYear(e.target.value)}
          >
            {getMonthYearOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {new Date(option + '-02T00:00:00Z').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<PrintIcon />}
          onClick={generatePdfReport}
        >
          Gerar Relatório PDF
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Entradas</Typography>
          <Typography variant="h5" color="success.main">R$ {totalEntradas.toFixed(2).replace('.', ',')}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Saídas</Typography>
          <Typography variant="h5" color="error.main">R$ {totalSaidas.toFixed(2).replace('.', ',')}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Saldo Atual</Typography>
          <Typography variant="h4" color={saldoAtual >= 0 ? 'primary.main' : 'error.main'}>
            R$ {saldoAtual.toFixed(2).replace('.', ',')}
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Membro</TableCell>
              <TableCell align="right">Valor (R$)</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lancamentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              lancamentos.map((lanc) => (
                <TableRow key={lanc.id}>
                  <TableCell>{new Date(lanc.data + 'T12:00:00Z').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{lanc.descricao}</TableCell>
                  <TableCell sx={{ color: lanc.tipo === 'entrada' ? 'success.main' : 'error.main' }}>
                    {lanc.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </TableCell>
                  <TableCell>{lanc.categoria}</TableCell>
                  <TableCell>{lanc.membroNome || '-'}</TableCell>
                  <TableCell align="right">R$ {lanc.valor.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(lanc)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => lanc.id && handleDelete(lanc.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
<Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>{currentLancamento ? 'Editar Lançamento' : 'Adicionar Novo Lançamento'}</DialogTitle>
  <DialogContent>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        {/* ID da Igreja */}
        <TextField
          margin="dense"
          label="ID da Igreja"
          type="text"
          fullWidth
          value={userProfile?.igrejaId || ''}
          InputProps={{ readOnly: true }}
        />

        {/* Tipo de lançamento */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="tipo-lancamento-label">Tipo</InputLabel>
          <Select
            labelId="tipo-lancamento-label"
            value={formTipo}
            onChange={(e) => setFormTipo(e.target.value as 'entrada' | 'saida')}
          >
            <MenuItem value="entrada">Entrada</MenuItem>
            <MenuItem value="saida">Saída</MenuItem>
          </Select>
        </FormControl>

        {/* Categoria */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="categoria-select-label">Categoria</InputLabel>
          <Select
            labelId="categoria-select-label"
            value={formCategoria}
            onChange={(e) => setFormCategoria(e.target.value)}
          >
            <MenuItem value=""><em>Nenhuma</em></MenuItem>
            {CATEGORY_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Membro (obrigatório para Dízimo, opcional para outros) */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="membro-select-label">
            {formCategoria === 'Dízimo' ? 'Membro (obrigatório)' : 'Membro (opcional)'}
          </InputLabel>
          <Select
            labelId="membro-select-label"
            value={formMembroId}
            onChange={(e) => {
              const id = e.target.value;
              setFormMembroId(id);
              const membro = membros.find(m => m.id === id);
              setFormMembroNome(membro?.nome || '');
            }}
          >
            <MenuItem value=""><em>Nenhum</em></MenuItem>
            {membros.map(m => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Descrição, Valor e Data */}
        <TextField
          margin="dense"
          label="Descrição"
          type="text"
          fullWidth
          value={formDescricao}
          onChange={(e) => setFormDescricao(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Valor"
          type="number"
          fullWidth
          value={formValor}
          onChange={(e) => setFormValor(e.target.value)}
          inputProps={{ step: "0.01" }}
        />
        <TextField
          margin="dense"
          label="Data"
          type="date"
          fullWidth
          value={formData}
          onChange={(e) => setFormData(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ mb: 2 }}>Distribuição Financeira</Typography>
        {totalGeral === 0 ? (
          <Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: 250, border: '1px dashed grey', borderRadius: 1
          }}>
            <Typography variant="body2" color="text.secondary">
              Sem dados para o gráfico. Adicione lançamentos.
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => {
                  const percent = totalGeral ? ((value as number) / totalGeral * 100).toFixed(0) : 0;
                  return `${name}: ${percent}%`;
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: string | number) => `R$ ${(parseFloat(value.toString())).toFixed(2).replace('.', ',')}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
    <Button onClick={handleSaveLancamento} color="primary" variant="contained">
      {currentLancamento ? 'Salvar Alterações' : 'Adicionar'}
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}