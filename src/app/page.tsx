"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Imports do Firebase
import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from '@/firebase/config';

// Imports do Material-UI e Ícones
import { Box, Typography, Button, Container, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';      // Ícone para Culto de Ensino
import SchoolIcon from '@mui/icons-material/School';        // Ícone para EBD
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom'; // Ícone para Culto da Família

interface Evento {
  id: string;
  titulo: string;
  data: string;
  horario: string;
  local?: string;
  descricao?: string;
}

// DADOS PARA OS HORÁRIOS FIXOS
const horariosFixos = [
  {
    titulo: "Culto de Ensino",
    dia: "Toda Quarta-Feira",
    horario: "19:30",
    icon: <MenuBookIcon sx={{ fontSize: 32 }} />
  },
  {
    titulo: "Culto ciclo de Oração",
    dia: "Toda Sexta-Feira",
    horario: "19:30",
    icon: <MenuBookIcon sx={{ fontSize: 32 }} />
  },
  {
    titulo: "Culto de Santa Ceia",
    dia: "Todo 1° Primeiro Sábado do Mês",
    horario: "19:00",
    icon: <MenuBookIcon sx={{ fontSize: 32 }} />
  },
  {
    titulo: "Escola Bíblica Dominical",
    dia: "Todo Domingo",
    horario: "09:00",
    icon: <SchoolIcon sx={{ fontSize: 32 }} />
  },
  {
    titulo: "Culto da Família",
    dia: "Todo Domingo",
    horario: "18:30",
    icon: <FamilyRestroomIcon sx={{ fontSize: 32 }} />
  }
];

export default function HomePage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, "eventos"), 
        where("data", ">=", hoje),
        orderBy("data", "asc"), 
        limit(3)
      );
      const querySnapshot = await getDocs(q);
      const eventosData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Evento));
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
    if (!dataString) return 'Data a confirmar';
    const data = new Date(dataString + 'T00:00:00-03:00'); 
    return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <Box>
      {/* SECÇÃO DE BOAS-VINDAS (HERO) */}
      <Box 
        sx={{ 
          py: 12, 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
          color: 'var(--text-primary)',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        {/* ... (código da seção de boas-vindas que você já tem) ... */}
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/logo-plenitude.png?alt=media&token=1a61b486-b9a6-49ab-bfc1-56140700f9cb"
              alt="Logo AD Plenitude"
              width={300}
              height={85}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{fontWeight: 'bold', fontFamily: 'var(--font-merriweather)', color: 'var(--text-primary)'}}
          >
            Bem-vindo à AD Plenitude
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 5, maxWidth: '700px', mx: 'auto' }}>
            Um lugar para pertencer, crer e crescer. Junte-se a nós nos nossos cultos e eventos.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            className="hero-button"
            component={Link}
            href="/eventos"
          >
            Ver Todos os Eventos
          </Button>
        </Container>
      </Box>

      {/* SECÇÃO DE PRÓXIMOS EVENTOS */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom 
          sx={{fontWeight: 'bold', fontFamily: 'var(--font-merriweather)', mb: 6}}
        >
          Próximos Eventos
        </Typography>
        {loading ? (
          <Box sx={{display: 'flex', justifyContent: 'center', py: 5}}><CircularProgress /></Box>
        ) : eventos.length === 0 ? (
          <Typography align="center" color="text.secondary" variant="h6" sx={{py: 5}}>Nenhum evento especial agendado no momento.</Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {eventos.map((evento) => (
              <Grid item xs={12} sm={8} md={4} key={evento.id}>
                <Card className="home-event-card">
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom sx={{fontWeight: 600}}>{evento.titulo}</Typography>
                    <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                      <CalendarMonthIcon fontSize="small" sx={{mr: 1, color: 'var(--primary-main)'}} />
                      <Typography variant="body2">{formatarData(evento.data)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                      <AccessTimeIcon fontSize="small" sx={{mr: 1, color: 'var(--primary-main)'}} />
                      <Typography variant="body2">{evento.horario}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={2} color="text.secondary">
                      <LocationOnIcon fontSize="small" sx={{mr: 1, color: 'var(--primary-main)'}} />
                      <Typography variant="body2">{evento.local || 'Sede da Igreja'}</Typography>
                    </Box>
                    {evento.descricao && (
                      <Typography variant="body2" color="text.secondary">{evento.descricao}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* --- NOVA SEÇÃO DE HORÁRIOS FIXOS --- */}
      <Box className="schedule-section" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom 
            sx={{fontWeight: 'bold', fontFamily: 'var(--font-merriweather)', mb: 6}}
          >
            Nossos Horários
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {horariosFixos.map((horario) => (
              <Grid item xs={12} sm={6} md={4} key={horario.titulo}>
                <Card className="schedule-card" variant="outlined">
                  <Box className="schedule-icon-wrapper">
                    {horario.icon}
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }} gutterBottom>
                    {horario.titulo}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {horario.dia}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    às {horario.horario}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

    </Box>
  );
}