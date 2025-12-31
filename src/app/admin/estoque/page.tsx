// src/app/admin/estoque/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, TextField, Paper,
  List, ListItem, ListItemText, IconButton, CircularProgress,
  Alert, Card, CardContent, CardActions, Grid, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { db } from '@/firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

// Tipo para os itens do estoque
interface EstoqueItem {
  id: string;
  categoria: string;
  nome: string;
  detalhes?: string; // Adicionado campo detalhes (opcional)
  quantidade: number;
  igrejaId: 'SEDE' | '1 de maio';
  timestamp: Date;
}

// Opções pré-definidas para categorias e sub-itens
const categoriasOptions = [
  'Instrumento',
  'Mobiliário',
  'Áudio',
  'Informática',
  'Outros'
];

const subItemOptions: { [key: string]: string[] } = {
  'Instrumento': ['Guitarra', 'Contra Baixo', 'Bateria', 'Teclado', 'Piano'],
  'Mobiliário': ['Cadeira', 'Mesa', 'Púlpito'],
  'Áudio': ['Microfone', 'Mesa de Som', 'Caixa de Som', 'Fone de Ouvido'],
  'Informática': ['Computador', 'Projetor', 'Tela', 'Notebook'],
};

export default function AdminEstoquePage() {
  const [itens, setItens] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Novos estados para adicionar item
  const [newCategory, setNewCategory] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDetails, setNewItemDetails] = useState(''); // Estado para os detalhes
  const [newItemQuantity, setNewItemQuantity] = useState<number | ''>('');
  const [newItemIgreja, setNewItemIgreja] = useState<'SEDE' | '1 de maio'>('SEDE');
  const [addingItem, setAddingItem] = useState(false);

  const estoqueCollectionRef = collection(db, 'estoque');

  // --- Funções de Carregamento de Itens ---
  const fetchItens = async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(estoqueCollectionRef, orderBy('categoria', 'asc'), orderBy('nome', 'asc'));
      const snapshot = await getDocs(q);
      const fetchedItens: EstoqueItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        categoria: doc.data().categoria || 'Não Categorizado',
        nome: doc.data().nome,
        detalhes: doc.data().detalhes || '', // Pega os detalhes ou string vazia
        quantidade: doc.data().quantidade,
        igrejaId: doc.data().igrejaId,
        timestamp: doc.data().timestamp.toDate(),
      }));
      setItens(fetchedItens);
    } catch (err: any) {
      console.error("Erro ao buscar itens do estoque:", err);
      setError(`Não foi possível carregar os itens do estoque: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItens();
  }, []);

  // --- Função para Adicionar Item ---
  const handleAddItem = async () => {
    if (!newCategory || !newItemName.trim() || newItemQuantity === '' || newItemQuantity <= 0) {
      setError("Por favor, selecione uma categoria, preencha o nome do item e uma quantidade válida.");
      return;
    }
    setError(null);
    setAddingItem(true);

    try {
      // Objeto a ser salvo no Firestore
      const itemToSave: Omit<EstoqueItem, 'id' | 'timestamp'> = {
        categoria: newCategory,
        nome: newItemName.trim(),
        quantidade: newItemQuantity,
        igrejaId: newItemIgreja,
      };

      // Adiciona detalhes apenas se não estiver vazio
      if (newItemDetails.trim()) {
        itemToSave.detalhes = newItemDetails.trim();
      }

      await addDoc(estoqueCollectionRef, {
        ...itemToSave,
        timestamp: new Date(),
      });

      // Reseta os campos
      setNewCategory('');
      setNewItemName('');
      setNewItemDetails(''); // Reseta os detalhes
      setNewItemQuantity('');
      setNewItemIgreja('SEDE');
      await fetchItens();
    } catch (err: any) {
      console.error("Erro ao adicionar item:", err);
      setError(`Erro ao adicionar item ao estoque: ${err.message || String(err)}`);
    } finally {
      setAddingItem(false);
    }
  };

  // --- Função para Deletar Item ---
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o item '${itemName}'?`)) return;

    try {
      await deleteDoc(doc(db, 'estoque', itemId));
      await fetchItens();
    } catch (err: any) {
      console.error("Erro ao excluir item:", err);
      setError(`Não foi possível excluir o item: ${err.message || String(err)}`);
    }
  };

  const handleCategoryChange = (event: any) => {
    setNewCategory(event.target.value);
    setNewItemName('');
    setNewItemDetails(''); // Também limpa os detalhes ao mudar de categoria
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Gerenciar Estoque da Igreja
      </Typography>

      {/* Seção de Adição de Novo Item */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Adicionar Novo Item</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} alignItems="center">
          {/* Campo Categoria */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth disabled={addingItem}>
              <InputLabel id="category-select-label">Categoria</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={newCategory}
                label="Categoria"
                onChange={handleCategoryChange}
              >
                <MenuItem value=""><em>Selecione</em></MenuItem>
                {categoriasOptions.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Campo Nome do Item (condicional: Select ou TextField) */}
          <Grid item xs={12} sm={4}>
            {newCategory && subItemOptions[newCategory] ? (
              <FormControl fullWidth disabled={addingItem}>
                <InputLabel id="item-name-select-label">Nome do Item</InputLabel>
                <Select
                  labelId="item-name-select-label"
                  id="item-name-select"
                  value={newItemName}
                  label="Nome do Item"
                  onChange={(e) => setNewItemName(e.target.value)}
                >
                  <MenuItem value=""><em>Selecione</em></MenuItem>
                  {subItemOptions[newCategory].map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Nome do Item"
                variant="outlined"
                fullWidth
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                disabled={addingItem || !newCategory}
              />
            )}
          </Grid>

          {/* Campo Quantidade */}
          <Grid item xs={12} sm={2}>
            <TextField
              label="Quantidade"
              variant="outlined"
              fullWidth
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(Number(e.target.value))}
              inputProps={{ min: 1 }}
              disabled={addingItem}
            />
          </Grid>

          {/* Campo Igreja */}
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth disabled={addingItem}>
              <InputLabel id="igreja-select-label">Igreja</InputLabel>
              <Select
                labelId="igreja-select-label"
                id="igreja-select"
                value={newItemIgreja}
                label="Igreja"
                onChange={(e) => setNewItemIgreja(e.target.value as 'SEDE' | '1 de maio')}
              >
                <MenuItem value="SEDE">SEDE</MenuItem>
                <MenuItem value="1 de maio">1 de maio</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Campo Detalhes (nova linha) */}
          <Grid item xs={12}>
            <TextField
              label="Detalhes (opcional)"
              variant="outlined"
              fullWidth
              multiline // Permite múltiplas linhas de texto
              rows={2} // Altura inicial de 2 linhas
              value={newItemDetails}
              onChange={(e) => setNewItemDetails(e.target.value)}
              disabled={addingItem}
              sx={{ mt: 1 }} // Margem superior para separar do bloco acima
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddItem}
              startIcon={<AddIcon />}
              fullWidth
              disabled={addingItem || !newCategory || !newItemName.trim() || newItemQuantity === '' || newItemQuantity <= 0}
            >
              {addingItem ? <CircularProgress size={24} color="inherit" /> : 'Adicionar Item'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Seção de Itens Existentes */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Itens Atuais em Estoque</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error && !itens.length ? (
          <Alert severity="error">{error}</Alert>
        ) : itens.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nenhum item registrado no estoque. Adicione o primeiro!</Typography>
        ) : (
          <List>
            {itens.map((item) => (
              <Card key={item.id} sx={{ mb: 2, boxShadow: 1 }}>
                <CardContent>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <Typography variant="caption" color="text.secondary">{item.categoria}</Typography>
                      <Typography variant="h6">{item.nome}</Typography>
                      {item.detalhes && ( // Renderiza os detalhes APENAS se existirem
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Detalhes: {item.detalhes}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Igreja: {item.igrejaId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Typography variant="body1">
                        Quantidade: <strong>{item.quantidade}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                      <IconButton
                        aria-label="excluir"
                        onClick={() => handleDeleteItem(item.id, item.nome)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}