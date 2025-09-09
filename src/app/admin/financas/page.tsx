"use client";

import React, { useState, useEffect, useMemo } from 'react'; // useRef e useCallback foram removidos
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, where, getDoc } from "firebase/firestore";
import { db } from '../../../firebase/config';
import { useAuth } from '../../../firebase/AuthContext'; // Certifique-se de que o caminho está correto
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TextField, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, RadioGroup, FormControlLabel, Radio,
    InputLabel, FormControl, Select, MenuItem, Avatar, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PrintIcon from '@mui/icons-material/Print';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// A importação do useReactToPrint foi removida

interface Lancamento { id?: string; igrejaId: string; tipo: 'entrada' | 'saida'; categoria: string; descricao: string; valor: number; data: string; }
interface UserProfile { email: string; nome: string; role: 'pastor_presidente' | 'dirigente'; igrejaId: string; }
const igrejas = [{ id: 'sede', nome: 'Sede' }, { id: '1demaio', nome: '1º de Maio' }];
const estadoInicialLancamento: Lancamento = { igrejaId: 'sede', tipo: 'entrada', categoria: '', descricao: '', valor: 0, data: new Date().toISOString().split('T')[0] };

function RenderFormFields({ data, handler }: { data: Lancamento; handler: (e: any) => void }) {
    // ... (O conteúdo desta função não muda)
    return (
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Igreja</InputLabel>
                    <Select name="igrejaId" value={data.igrejaId} label="Igreja" disabled>
                        {igrejas.map(igreja => <MenuItem key={igreja.id} value={igreja.id}>{igreja.nome}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
                <FormControl>
                    <RadioGroup row name="tipo" value={data.tipo} onChange={handler}>
                        <FormControlLabel value="entrada" control={<Radio />} label="Entrada" />
                        <FormControlLabel value="saida" control={<Radio />} label="Saída" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select name="categoria" value={data.categoria} label="Categoria" onChange={handler}>
                        {data.tipo === 'entrada'
                            ? [<MenuItem key="dizimo" value="Dízimo">Dízimo</MenuItem>, <MenuItem key="oferta" value="Oferta">Oferta</MenuItem>]
                            : [<MenuItem key="aluguel" value="Aluguel">Aluguel</MenuItem>, <MenuItem key="contas" value="Contas">Contas</MenuItem>]}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
                <TextField name="descricao" label="Descrição" fullWidth value={data.descricao} onChange={handler} />
            </Grid>
            <Grid item xs={6}>
                <TextField name="valor" label="Valor" type="number" fullWidth value={data.valor} onChange={handler} />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    name="data"
                    label="Data"
                    type="date"
                    fullWidth
                    value={data.data}
                    onChange={handler}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
        </Grid>
    );
}

export default function PaginaFinancas() {
    const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [novoLancamento, setNovoLancamento] = useState<Lancamento>(estadoInicialLancamento);
    const [lancamentoParaEditar, setLancamentoParaEditar] = useState<Lancamento | null>(null);
    const [lancamentoSelecionado, setLancamentoSelecionado] = useState<Lancamento | null>(null);
    const { user, loading: authLoading, userProfile, setUserProfile } = useAuth();
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

    // Toda a lógica do react-to-print (useState, useRef, useCallback, useReactToPrint) foi removida daqui.

    useEffect(() => {
        if (user && !userProfile) {
            const fetchProfile = async () => {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists()) setUserProfile(docSnap.data() as UserProfile);
            };
            fetchProfile();
        }
    }, [user, userProfile, setUserProfile]);

    const fetchLancamentos =
        useMemo(() => async () => {
            if (!userProfile) return;
            setLoading(true);
            try {
                const q = query(collection(db, "financas"), where("igrejaId", "==", userProfile.igrejaId), orderBy("data", "desc"));
                const querySnapshot = await getDocs(q);
                setLancamentos(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lancamento)));
            } catch (error) {
                console.error("Erro: ", error);
            } finally {
                setLoading(false);
            }
        }, [userProfile]);

    useEffect(() => {
        fetchLancamentos();
    }, [fetchLancamentos]);

    const handleAddClickOpen = () => {
        if (userProfile) {
            setNovoLancamento({ ...estadoInicialLancamento, igrejaId: userProfile.igrejaId, data: new Date().toISOString().split('T')[0] });
            setAddModalOpen(true);
        }
    };
    const handleAddClose = () => setAddModalOpen(false);
    const handleEditClose = () => { setEditModalOpen(false); setLancamentoParaEditar(null); };
    const handleDeleteClose = () => { setDeleteModalOpen(false); setLancamentoSelecionado(null); };

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        const v = name === 'valor' ? parseFloat(value) || 0 : value;
        if (isEditModalOpen) setLancamentoParaEditar(p => p ? { ...p, [name]: v } : null);
        else setNovoLancamento(p => ({ ...p, [name]: v }));
    };

    const handleSalvar = async () => {
        const lancamento = isEditModalOpen ? lancamentoParaEditar : novoLancamento;
        if (!lancamento?.categoria || !lancamento?.descricao || !lancamento?.valor) {
            alert("Preencha todos os campos.");
            return;
        }
        try {
            if (isEditModalOpen && lancamento.id) {
                const { id, ...data } = lancamento;
                await updateDoc(doc(db, "financas", id), data);
            } else {
                await addDoc(collection(db, "financas"), novoLancamento);
            }
            fetchLancamentos();
            handleAddClose();
            handleEditClose();
        } catch (e) {
            console.error("Erro: ", e);
        }
    };

    const handleEditClickOpen = (l: Lancamento) => { setLancamentoParaEditar(l); setEditModalOpen(true); };
    const handleDeleteClickOpen = (l: Lancamento) => { setLancamentoSelecionado(l); setDeleteModalOpen(true); };
    const handleConfirmDelete = async () => {
        if (lancamentoSelecionado?.id) {
            await deleteDoc(doc(db, "financas", lancamentoSelecionado.id));
            fetchLancamentos();
        }
        handleDeleteClose();
    };

    const { totalEntradas, totalSaidas, saldoAtual } = useMemo(() =>
        lancamentos.reduce((acc, l) => {
            const v = parseFloat(String(l.valor)) || 0;
            if (l.tipo === 'entrada') acc.totalEntradas += v;
            else acc.totalSaidas += v;
            acc.saldoAtual = acc.totalEntradas - acc.totalSaidas;
            return acc;
        }, { totalEntradas: 0, totalSaidas: 0, saldoAtual: 0 }), [lancamentos]);

    const dadosMensais = useMemo(() => {
        const totais = Array(12).fill(0).map(() => ({ entradas: 0, saidas: 0 }));
        lancamentos
            .filter(l => new Date(l.data + 'T00:00:00-03:00').getFullYear() === anoSelecionado)
            .forEach(l => {
                const mes = new Date(l.data + 'T00:00:00-03:00').getMonth();
                const v = parseFloat(String(l.valor)) || 0;
                if (l.tipo === 'entrada') totais[mes].entradas += v;
                else totais[mes].saidas += v;
            });
        return totais;
    }, [lancamentos, anoSelecionado]);

    const formatCurrency = (v: number) =>
        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const getNomeIgreja = (id: string) =>
        igrejas.find(i => i.id === id)?.nome || 'Desconhecida';

    if (authLoading || !userProfile) {
        return (
            <Box
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Box className="non-printable" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Lançamentos Financeiros</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<PrintIcon />}
                        onClick={() => window.print()}
                    >
                        Imprimir Relatório
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddClickOpen}>
                        Adicionar Lançamento
                    </Button>
                </Box>
            </Box>

            <Box className="printable-content">
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e8f5e9' }}>
                            <Avatar sx={{ bgcolor: 'success.main' }}><ArrowUpwardIcon /></Avatar>
                            <Box>
                                <Typography variant="subtitle1">Entradas</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                                    {formatCurrency(totalEntradas)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffebee' }}>
                            <Avatar sx={{ bgcolor: 'error.main' }}><ArrowDownwardIcon /></Avatar>
                            <Box>
                                <Typography variant="subtitle1">Saídas</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.dark' }}>
                                    {formatCurrency(totalSaidas)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e3f2fd' }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}><AttachMoneyIcon /></Avatar>
                            <Box>
                                <Typography variant="subtitle1">Saldo Atual</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: saldoAtual >= 0 ? 'primary.dark' : 'error.main' }}>
                                    {formatCurrency(saldoAtual)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
                    <Paper sx={{ p: 2, mt: 4, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Resumo Mensal</Typography>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Ano</InputLabel>
                                <Select value={anoSelecionado} label="Ano"
                                    onChange={e => setAnoSelecionado(e.target.value as number)}>
                                    <MenuItem value={2025}>2025</MenuItem>
                                    <MenuItem value={2024}>2024</MenuItem>
                                    <MenuItem value={2023}>2023</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Bar
                            options={{
                                responsive: true,
                                plugins: { legend: { position: 'top' }, title: { display: true, text: `Movimentações de ${anoSelecionado}` } },
                                scales: {
                                    y: {
                                        ticks: {
                                            callback: v =>
                                                typeof v === 'number'
                                                    ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                    : ''
                                        }
                                    }
                                }
                            }}
                            data={{
                                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                                datasets: [
                                    { label: 'Entradas', data: dadosMensais.map(d => d.entradas), backgroundColor: 'rgba(75, 192, 192, 0.5)' },
                                    { label: 'Saídas', data: dadosMensais.map(d => d.saidas), backgroundColor: 'rgba(255, 99, 132, 0.5)' }
                                ]
                            }}
                        />
                    </Paper>
                </Box>

                <Paper sx={{ width: '100%', overflow: 'hidden', mt: 4 }}>
                    <TableContainer sx={{ maxHeight: 640 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Igreja</TableCell>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Categoria</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell align="right">Valor (R$)</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
                                ) : lancamentos.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center">Nenhum lançamento encontrado.</TableCell></TableRow>
                                ) : (
                                    lancamentos.map(lancamento => (
                                        <TableRow hover key={lancamento.id}>
                                            <TableCell>{getNomeIgreja(lancamento.igrejaId)}</TableCell>
                                            <TableCell>
                                                {new Date(lancamento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </TableCell>
                                            <TableCell>
                                                <Typography color={lancamento.tipo === 'entrada' ? 'success.main' : 'error.main'} sx={{ textTransform: 'capitalize' }}>
                                                    {lancamento.tipo}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{lancamento.categoria}</TableCell>
                                            <TableCell>{lancamento.descricao}</TableCell>
                                            <TableCell align="right" sx={{ color: lancamento.tipo === 'entrada' ? 'success.main' : 'error.main' }}>
                                                {formatCurrency(lancamento.valor)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton color="primary" size="small" onClick={() => handleEditClickOpen(lancamento)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" size="small" onClick={() => handleDeleteClickOpen(lancamento)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <div className="non-printable">
                <Dialog open={isAddModalOpen} onClose={handleAddClose}>
                    <DialogTitle>Adicionar Lançamento</DialogTitle>
                    <DialogContent><RenderFormFields data={novoLancamento} handler={handleChange} /></DialogContent>
                    <DialogActions><Button onClick={handleAddClose}>Cancelar</Button><Button onClick={handleSalvar} variant="contained">Salvar</Button></DialogActions>
                </Dialog>

                <Dialog open={isEditModalOpen} onClose={handleEditClose}>
                    <DialogTitle>Editar Lançamento</DialogTitle>
                    <DialogContent>{lancamentoParaEditar && <RenderFormFields data={lancamentoParaEditar} handler={handleChange} />}</DialogContent>
                    <DialogActions><Button onClick={handleEditClose}>Cancelar</Button><Button onClick={handleSalvar} variant="contained">Salvar</Button></DialogActions>
                </Dialog>

                <Dialog open={isDeleteModalOpen} onClose={handleDeleteClose}>
                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                    <DialogContent><Typography>Deseja excluir o lançamento <strong>"{lancamentoSelecionado?.descricao}"</strong>?</Typography></DialogContent>
                    <DialogActions><Button onClick={handleDeleteClose}>Cancelar</Button><Button onClick={handleConfirmDelete} variant="contained" color="error">Excluir</Button></DialogActions>
                </Dialog>
            </div>
        </>
    );
}