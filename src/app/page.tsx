"use client";

import React, { useState, useEffect, useCallback } from 'react';
// Imports do Firebase com o caminho corrigido
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from '../firebase/config'; // <-- CORREÇÃO AQUI
// Imports do Material-UI
import { Box, Typography, Button, Container, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function HomePage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os 3 próximos eventos do Firebase
  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "eventos"), orderBy("data", "asc"), limit(3));
      const querySnapshot = await getDocs(q);
      const eventosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(eventosData);
    } catch (error) {
      console.error("Erro ao buscar eventos: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString + 'T00:00:00-03:00'); // Considera o fuso horário de Carapicuíba/SP
    return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <Box>
      {/* SECÇÃO DE BOAS-VINDAS (HERO) */}
      <Box 
        sx={{ 
          py: 10, 
          textAlign: 'center', 
          backgroundColor: '#e3f2fd',
          color: '#1C2536'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
            Bem-vindo à AD Plenitude
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Um lugar para pertencer, crer e crescer. Junte-se a nós nos nossos cultos e eventos.
          </Typography>
          <Button variant="contained" size="large" color="primary">
            Nossos Horários
          </Button>
        </Container>
      </Box>

      {/* SECÇÃO DE PRÓXIMOS EVENTOS */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{fontWeight: 'bold', mb: 4}}>
          Próximos Eventos
        </Typography>
        {loading ? (
          <Box sx={{display: 'flex', justifyContent: 'center'}}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={4}>
            {eventos.map((evento) => (
              <Grid item xs={12} md={4} key={evento.id}>
                <Card elevation={2} sx={{height: '100%'}}>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>{evento.titulo}</Typography>
                    <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                      <CalendarMonthIcon fontSize="small" sx={{mr: 1}} />
                      <Typography variant="body2">{formatarData(evento.data)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                      <AccessTimeIcon fontSize="small" sx={{mr: 1}} />
                      <Typography variant="body2">{evento.horario}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={2} color="text.secondary">
                      <LocationOnIcon fontSize="small" sx={{mr: 1}} />
                      <Typography variant="body2">{evento.local || 'Sede da Igreja'}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.primary">{evento.descricao}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}