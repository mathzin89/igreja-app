"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { MonthlyData } from './types';

interface DashboardGraphsProps {
    monthlyData: MonthlyData[];
}

// Função para formatar os números do eixo Y para Reais (ex: 2500 -> R$ 2,5k)
const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
        return `R$ ${(tickItem / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
    }
    return `R$ ${tickItem}`;
};

export default function DashboardGraphs({ monthlyData }: DashboardGraphsProps) {
    if(!monthlyData || monthlyData.length === 0){
        return null;
    }

    return (
        <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Visão Geral Financeira (Últimos 6 Meses)
            </Typography>
            <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        {/* ✅ CORREÇÃO DA MOEDA: Usa a nova função de formatação */}
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip 
                            formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                            cursor={{fill: 'rgba(244, 246, 248, 0.5)'}}
                        />
                        <Legend />
                        <Bar dataKey="Entradas" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Saídas" fill="#D32F2F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}