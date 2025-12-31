"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, where, QueryDocumentSnapshot, DocumentData, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/firebase/AuthContext';
import { Box, Typography, Grid, Paper, CircularProgress, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { DashboardStats, ChurchFinanceSummary, RecentRequest, MonthlyData } from './types';

interface Props {
    igrejas: { id: string; nome: string; }[];
}

// ✅ 1. Defina aqui os cargos que PODEM ver este dashboard
const ROLES_PERMITIDAS = [
    'pastor_presidente',
    'dirigente',
    'secretario',
    'tesoureiro'
];

export default function DashboardClientView({ igrejas }: Props) {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({ userCount: 0, memberCount: 0, pendingRequestCount: 0 });
    const [financeSummaries, setFinanceSummaries] = useState<ChurchFinanceSummary[]>([]);
    const [totalSaldo, setTotalSaldo] = useState(0);
    const [monthlyDataByChurch, setMonthlyDataByChurch] = useState<{ [key: string]: MonthlyData[] }>({});
    const [loading, setLoading] = useState(true);

    const igrejasMap = useMemo(() => {
        const map = new Map<string, string>();
        igrejas.forEach(igreja => map.set(igreja.id, igreja.nome));
        return map;
    }, [igrejas]);

    useEffect(() => {
        if (!userProfile) {
            setLoading(false);
            return;
        }
        
        // ✅ Se o usuário não tem permissão, nem tenta buscar os dados
        if (!ROLES_PERMITIDAS.includes(userProfile.role)) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Listener para Users (geralmente todos os admins podem ver isso)
        const unsubUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
            setStats(prev => ({ ...prev, userCount: snapshot.size }));
        });

        // ✅ ALTERADO: Listener para Members AGORA puxa TODOS os cadastrados (contagem geral)
        const qMembers = query(collection(db, 'membros'));
        const unsubMembers = onSnapshot(qMembers, (snapshot) => {
            setStats(prev => ({ ...prev, memberCount: snapshot.size }));
        });

        // Listener apenas para a CONTAGEM de Solicitações Pendentes (geralmente só para presidentes, mas mantido para o contador)
        const qRequests = query(collection(db, 'registrationRequests'), where('status', '==', 'pendente'));
        const unsubRequests = onSnapshot(qRequests, (snapshot) => {
            setStats(prev => ({ ...prev, pendingRequestCount: snapshot.size }));
        });

        // ✅ CORREÇÃO: Listener Principal para Finanças SEMPRE filtrado pela igreja do usuário
        const qFinancas = query(collection(db, 'financas'), where('igrejaId', '==', userProfile.igrejaId));

        const unsubFinancas = onSnapshot(qFinancas, (financasSnapshot) => {
            const financeByChurch: { [key: string]: { totalEntradas: number; totalSaidas: number } } = {};
            const newMonthlyDataByChurch: { [key: string]: any } = {};

            // Apenas inicializa os dados para a igreja do usuário logado
            const userChurchId = userProfile.igrejaId;
            newMonthlyDataByChurch[userChurchId] = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setUTCMonth(d.getUTCMonth() - i, 1);
                d.setUTCHours(0, 0, 0, 0);
                return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear(), entradas: 0, saidas: 0 };
            }).reverse();

            financasSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
                const data = doc.data();
                const igrejaId = data.igrejaId;

                // Processa apenas os dados da igreja do usuário
                if (igrejaId === userChurchId) {
                    if (!financeByChurch[igrejaId]) financeByChurch[igrejaId] = { totalEntradas: 0, totalSaidas: 0 };
                    if (data.tipo === 'entrada') financeByChurch[igrejaId].totalEntradas += data.valor || 0;
                    else if (data.tipo === 'saida') financeByChurch[igrejaId].totalSaidas += data.valor || 0;
                    
                    if (data.data) {
                        const [year, month] = data.data.split('-').map(Number);
                        if(newMonthlyDataByChurch[igrejaId]) {
                            const monthData = newMonthlyDataByChurch[igrejaId].find((m: any) => m.month === month && m.year === year);
                            if (monthData) {
                                if (data.tipo === 'entrada') monthData.entradas += data.valor || 0;
                                else if (data.tipo === 'saida') monthData.saidas += data.valor || 0;
                            }
                        }
                    }
                }
            });

            const newFinanceSummaries: ChurchFinanceSummary[] = [userChurchId].map(igrejaId => {
                const totals = financeByChurch[igrejaId] || { totalEntradas: 0, totalSaidas: 0 };
                return {
                    igrejaId,
                    igrejaNome: igrejasMap.get(igrejaId) || igrejaId,
                    ...totals,
                    saldoAtual: totals.totalEntradas - totals.totalSaidas,
                };
            });
            
            setFinanceSummaries(newFinanceSummaries);
            
            const newTotalSaldo = newFinanceSummaries.reduce((sum, summary) => sum + summary.saldoAtual, 0);
            setTotalSaldo(newTotalSaldo);

            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            Object.keys(newMonthlyDataByChurch).forEach(igrejaId => {
                newMonthlyDataByChurch[igrejaId] = newMonthlyDataByChurch[igrejaId].map((m: any) => ({
                    name: monthNames[m.month - 1],
                    Entradas: m.entradas,
                    Saídas: m.saidas,
                }));
            });
            setMonthlyDataByChurch(newMonthlyDataByChurch);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao ouvir a coleção 'financas':", error);
            setLoading(false);
        });

        // Limpa todos os listeners quando o componente for desmontado
        return () => {
            unsubUsers();
            unsubMembers();
            unsubRequests();
            unsubFinancas();
        };
    }, [userProfile, igrejasMap]);
    
    // O gráfico agora sempre pega os dados da igreja do usuário
    const chartData = (userProfile && monthlyDataByChurch[userProfile.igrejaId]) || [];

    // ✅ 2. Primeira verificação: Carregando
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;
    }

    // ✅ 3. Segunda verificação: Permissão (A MUDANÇA PRINCIPAL)
    if (!userProfile || !ROLES_PERMITIDAS.includes(userProfile.role)) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" color="error">
                    Acesso Negado
                </Typography>
                <Typography>
                    Você não tem permissão para visualizar esta página.
                </Typography>
            </Box>
        );
    }

    // ✅ 4. Se passou em tudo, renderiza o dashboard
    return (
        <Grid container spacing={3}>
            {/* Cards de Estatísticas */}
            <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Membros</Typography><Typography variant="h4">{stats.memberCount}</Typography></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Usuários</Typography><Typography variant="h4">{stats.userCount}</Typography></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Solicitações</Typography><Typography variant="h4">{stats.pendingRequestCount}</Typography></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Saldo da Igreja</Typography><Typography variant="h4" color={totalSaldo >= 0 ? "green" : "red"}>R$ {totalSaldo.toFixed(2)}</Typography></Paper></Grid>

            {/* Gráfico financeiro agora ocupa a largura total */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2, height: 400 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Visão Financeira (Últimos 6 Meses)</Typography>
                        {/* O seletor de igrejas foi removido */}
                    </Box>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `R$ ${value}`} />
                            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="Entradas" fill="#4caf50" />
                            <Bar dataKey="Saídas" fill="#f44336" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
    );
}