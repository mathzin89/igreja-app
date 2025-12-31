'use client';

import { useState, useEffect } from "react";
import { db } from "@/firebase/config"; 
import { collection, query, onSnapshot } from "firebase/firestore";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  ButtonGroup,
  Grid
} from "@mui/material";

// Ícones
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Calendar e Date-fns
import { Calendar, dateFnsLocalizer, Event as CalendarEventType, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, setMonth, addWeeks, addDays, setYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Interfaces
interface EventoFirestore {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  descricao: string;
  tipo: 'igreja' | 'feriado';
}

interface EventoCalendario extends CalendarEventType {
  resource: EventoFirestore;
}

export default function AgendaPublicaCalendario() {
  // --- ESTADOS ---
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  const [anchorElMes, setAnchorElMes] = useState<null | HTMLElement>(null);
  const [anchorElAno, setAnchorElAno] = useState<null | HTMLElement>(null);

  const [eventosIgreja, setEventosIgreja] = useState<EventoCalendario[]>([]);
  const [feriados, setFeriados] = useState<EventoCalendario[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoFirestore | null>(null);

  // --- 1. BUSCAR EVENTOS DA IGREJA ---
  useEffect(() => {
    const q = query(collection(db, "agenda"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Mapeamento inicial pode conter NULL
      const listaBruta = snapshot.docs.map((doc) => {
          const d = doc.data() as any; 
          
          if (!d.data || !d.titulo) return null;

          let dataString = d.data;
          if (d.hora) {
            dataString += `T${d.hora}:00`;
          } else {
            dataString += `T12:00:00`; 
          }
          
          const startDate = new Date(dataString);

          // Retornamos o objeto tipado como EventoCalendario
          const evento: EventoCalendario = {
            title: d.titulo,
            start: startDate,
            end: new Date(startDate.getTime() + 3600000),
            allDay: !d.hora,
            resource: { 
              id: doc.id, 
              titulo: d.titulo,
              data: d.data,
              hora: d.hora,
              descricao: d.descricao,
              tipo: 'igreja' as const
            },
          };
          return evento;
        });

      // CORREÇÃO DOS ERROS AQUI:
      // Filtramos os nulos e forçamos o tipo final para o TypeScript entender
      const listaLimpa = listaBruta.filter((item) => item !== null) as EventoCalendario[];

      setEventosIgreja(listaLimpa);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar agenda:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. BUSCAR FERIADOS ---
  useEffect(() => {
    const buscarFeriados = async () => {
      try {
        const anoAtual = new Date().getFullYear();
        const anosParaBuscar = [anoAtual, anoAtual + 1, anoAtual + 2];
        let listaTotal: any[] = [];

        for (const ano of anosParaBuscar) {
          const resp = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
          if (resp.ok) {
            const dados = await resp.json();
            listaTotal = [...listaTotal, ...dados];
          }
        }
        
        const feriadosFormatados: EventoCalendario[] = listaTotal.map((f: any) => ({
           title: f.name,
           start: new Date(f.date + "T12:00:00"),
           end: new Date(f.date + "T12:00:00"),
           allDay: true,
           resource: { 
             id: `feriado-${f.date}`, 
             titulo: f.name, 
             data: f.date, 
             hora: "", 
             descricao: "Feriado Nacional", 
             tipo: 'feriado' as const
            }
        }));
        
        setFeriados(feriadosFormatados);
      } catch (e) { console.error("Erro feriados:", e); }
    };
    buscarFeriados();
  }, []);

  const todosEventos = [...eventosIgreja, ...feriados];

  // --- NAVEGAÇÃO ---
  const onNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    let newDate = new Date(date);
    if (action === 'TODAY') newDate = new Date();
    else if (action === 'PREV') {
      switch (view) {
        case Views.MONTH: newDate = addMonths(date, -1); break;
        case Views.WEEK: newDate = addWeeks(date, -1); break;
        case Views.DAY: newDate = addDays(date, -1); break;
        default: newDate = addMonths(date, -1);
      }
    } else if (action === 'NEXT') {
       switch (view) {
        case Views.MONTH: newDate = addMonths(date, 1); break;
        case Views.WEEK: newDate = addWeeks(date, 1); break;
        case Views.DAY: newDate = addDays(date, 1); break;
        default: newDate = addMonths(date, 1);
      }
    }
    setDate(newDate);
  };

  const handleSelecionarMes = (index: number) => {
    setDate(setMonth(date, index));
    setAnchorElMes(null);
  };
  const handleSelecionarAno = (ano: number) => {
    setDate(setYear(date, ano));
    setAnchorElAno(null);
  };

  const anoAtual = new Date().getFullYear();
  const listaAnos = Array.from({ length: 8 }, (_, i) => anoAtual - 2 + i);
  const mesesDoAno = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const labelMes = format(date, "MMMM", { locale: ptBR });
  const labelAno = format(date, "yyyy", { locale: ptBR });

  const eventStyleGetter = (event: EventoCalendario) => {
    const isFeriado = event.resource.tipo === 'feriado';
    return {
      style: {
        backgroundColor: isFeriado ? '#d32f2f' : '#1976d2',
        borderColor: isFeriado ? '#b71c1c' : '#115293',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const BigCalendar = Calendar as any;

  return (
    <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2, bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
        <ButtonGroup variant="outlined" size="small">
          <Button onClick={() => onNavigate('TODAY')} startIcon={<TodayIcon />}>Hoje</Button>
          <Button onClick={() => onNavigate('PREV')}><ArrowBackIcon fontSize="small" /></Button>
          <Button onClick={() => onNavigate('NEXT')}><ArrowForwardIcon fontSize="small" /></Button>
        </ButtonGroup>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={(e) => setAnchorElMes(e.currentTarget)}
            endIcon={<ArrowDropDownIcon />}
            sx={{ textTransform: 'capitalize', fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 'bold', color: '#1976d2' }}
          >
            {labelMes}
          </Button>

          <Button 
            onClick={(e) => setAnchorElAno(e.currentTarget)}
            endIcon={<ArrowDropDownIcon />}
            sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 'bold', color: '#555' }}
          >
            {labelAno}
          </Button>
          
          <Menu anchorEl={anchorElMes} open={Boolean(anchorElMes)} onClose={() => setAnchorElMes(null)} PaperProps={{ sx: { width: 300, p: 1 } }}>
            <Grid container spacing={1}>
              {mesesDoAno.map((mes, index) => (
                <Grid item xs={4} key={mes}>
                  <MenuItem onClick={() => handleSelecionarMes(index)} selected={date.getMonth() === index} sx={{ justifyContent: 'center', borderRadius: 1, fontSize: '0.9rem' }}>
                    {mes.substring(0, 3)}
                  </MenuItem>
                </Grid>
              ))}
            </Grid>
          </Menu>

          <Menu anchorEl={anchorElAno} open={Boolean(anchorElAno)} onClose={() => setAnchorElAno(null)} PaperProps={{ sx: { width: 150, p: 1 } }}>
             <Grid container spacing={1}>
              {listaAnos.map((ano) => (
                <Grid item xs={12} key={ano}>
                  <MenuItem onClick={() => handleSelecionarAno(ano)} selected={date.getFullYear() === ano} sx={{ justifyContent: 'center', borderRadius: 1 }}>
                    {ano}
                  </MenuItem>
                </Grid>
              ))}
            </Grid>
          </Menu>
        </Box>

        <ButtonGroup variant="outlined" size="small">
          <Button variant={view === Views.MONTH ? 'contained' : 'outlined'} onClick={() => setView(Views.MONTH)}>Mês</Button>
          <Button variant={view === Views.WEEK ? 'contained' : 'outlined'} onClick={() => setView(Views.WEEK)}>Semana</Button>
          <Button variant={view === Views.DAY ? 'contained' : 'outlined'} onClick={() => setView(Views.DAY)}>Dia</Button>
          <Button variant={view === Views.AGENDA ? 'contained' : 'outlined'} onClick={() => setView(Views.AGENDA)}>Lista</Button>
        </ButtonGroup>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1, alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, boxShadow: 3, p: 2, borderRadius: 2, bgcolor: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <BigCalendar
            localizer={localizer}
            events={todosEventos}
            date={date}
            onNavigate={(newDate: Date) => setDate(newDate)}
            view={view}
            onView={(newView: View) => setView(newView)}
            toolbar={false} 
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', width: '100%' }}
            culture='pt-BR'
            onSelectEvent={(e: EventoCalendario) => setEventoSelecionado(e.resource)}
            eventPropGetter={eventStyleGetter}
          />
        </Box>
      )}

      <Dialog 
        open={Boolean(eventoSelecionado)} 
        onClose={() => setEventoSelecionado(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, borderTop: `6px solid ${eventoSelecionado?.tipo === 'feriado' ? '#d32f2f' : '#1976d2'}` } }}
      >
        {eventoSelecionado && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{eventoSelecionado.titulo}</Typography>
              <IconButton onClick={() => setEventoSelecionado(null)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">{format(new Date(eventoSelecionado.data + "T12:00:00"), "dd/MM/yyyy")}</Typography>
              </Box>
              {eventoSelecionado.hora && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6">{eventoSelecionado.hora}</Typography>
                </Box>
              )}
              {eventoSelecionado.descricao && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', mt: 2 }}>
                    <DescriptionIcon color="action" sx={{ mr: 2 }} />
                    <Typography>{eventoSelecionado.descricao}</Typography>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setEventoSelecionado(null)} variant="outlined">Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}