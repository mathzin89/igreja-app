"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- AQUI ESTÁ A CORREÇÃO PRINCIPAL ---
// Importamos as instâncias já iniciadas do seu arquivo config.ts
// O '@' representa a pasta src/ do seu projeto. 
// Se der erro no '@', troque por '../../config'
import { db, auth } from "@/firebase/config"; 
// --------------------------------------

import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";

// Componentes do Material UI
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminAgenda() {
  const router = useRouter();

  // Estados para o formulário
  const [titulo, setTitulo] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [horaEvento, setHoraEvento] = useState("");
  const [descricao, setDescricao] = useState("");

  // Estado para a lista de eventos
  const [eventos, setEventos] = useState<any[]>([]);
  
  // Feedback visual
  const [aviso, setAviso] = useState({ open: false, msg: "", tipo: "success" as "success" | "error" });

  // 1. Verificar Autenticação ao carregar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login"); // Manda pro login se não tiver usuário
      } else {
        buscarEventos(); // Se tiver logado, busca os dados
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Buscar Eventos no Firestore (Read)
  const buscarEventos = async () => {
    try {
      // Ordena pela data para aparecer organizado
      const q = query(collection(db, "agenda"), orderBy("data", "asc"));
      const querySnapshot = await getDocs(q);
      
      const listaTemporaria = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setEventos(listaTemporaria);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  // 3. Adicionar Evento (Create)
  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !dataEvento) {
      setAviso({ open: true, msg: "Preencha título e data!", tipo: "error" });
      return;
    }

    try {
      await addDoc(collection(db, "agenda"), {
        titulo: titulo,
        data: dataEvento,
        hora: horaEvento,
        descricao: descricao,
        criadoEm: new Date() // útil para auditoria interna
      });

      setAviso({ open: true, msg: "Evento adicionado com sucesso!", tipo: "success" });
      
      // Limpar formulário
      setTitulo("");
      setDataEvento("");
      setHoraEvento("");
      setDescricao("");
      
      // Atualizar a lista
      buscarEventos();

    } catch (error) {
      console.error("Erro ao adicionar:", error);
      setAviso({ open: true, msg: "Erro ao salvar evento.", tipo: "error" });
    }
  };

  // 4. Deletar Evento (Delete)
  const handleDeletar = async (id: string) => {
    if(!confirm("Tem certeza que deseja apagar este evento?")) return;

    try {
      await deleteDoc(doc(db, "agenda", id));
      setAviso({ open: true, msg: "Evento removido.", tipo: "success" });
      buscarEventos(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setAviso({ open: true, msg: "Erro ao deletar.", tipo: "error" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Gerenciar Agenda da Igreja
      </Typography>

      {/* Formulário de Cadastro */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Novo Evento</Typography>
        <Box component="form" onSubmit={handleAdicionar} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Título do Evento" 
            variant="outlined" 
            fullWidth 
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Data" 
              type="date" 
              variant="outlined" 
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
              required
            />
            <TextField 
              label="Horário" 
              type="time" 
              variant="outlined" 
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={horaEvento}
              onChange={(e) => setHoraEvento(e.target.value)}
            />
          </Box>

          <TextField 
            label="Descrição (Opcional)" 
            variant="outlined" 
            multiline 
            rows={2} 
            fullWidth 
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <Button type="submit" variant="contained" size="large">
            Salvar Evento
          </Button>
        </Box>
      </Paper>

      {/* Lista de Eventos Cadastrados */}
      <Typography variant="h6" gutterBottom>Próximos Eventos</Typography>
      <Paper elevation={1}>
        <List>
          {eventos.map((evento) => (
            <div key={evento.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeletar(evento.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={evento.titulo}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.hora}
                      </Typography>
                      {evento.descricao && ` — ${evento.descricao}`}
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </div>
          ))}
          {eventos.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center', color: 'gray' }}>
              Nenhum evento cadastrado.
            </Box>
          )}
        </List>
      </Paper>

      {/* Componente de Aviso (Snackbar) */}
      <Snackbar 
        open={aviso.open} 
        autoHideDuration={4000} 
        onClose={() => setAviso({ ...aviso, open: false })}
      >
        <Alert severity={aviso.tipo} sx={{ width: '100%' }}>
          {aviso.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}