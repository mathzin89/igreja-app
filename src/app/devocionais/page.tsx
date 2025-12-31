// src/app/devocionais/page.tsx
"use client"; // ✅ PASSO 1: A página agora é um Client Component.

import { getAllDevotionals } from "../actions";
import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress } from '@mui/material';
import Link from "next/link";
import React, { useState, useEffect } from 'react'; // ✅ Importa os hooks

interface Devotional {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
}

export default function DevotionalsListPage() {
  // ✅ PASSO 2: A lógica de busca de dados agora está dentro de um useEffect.
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevotionals() {
      setLoading(true);
      const data = await getAllDevotionals();
      setDevotionals(data);
      setLoading(false);
    }
    fetchDevotionals();
  }, []); // Executa uma vez quando a página carrega

  return (
    <Box sx={{ backgroundColor: 'rgb(249 250 251)', py: 8, minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', textAlign: 'center', mb: 2 }}>
          Devocionais
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 8, maxWidth: '700px', mx: 'auto' }}>
          Uma palavra de fé e esperança para o seu dia. Explore as nossas últimas reflexões.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : devotionals.length > 0 ? (
          <Grid container spacing={4}>
              {devotionals.map((devotional: Devotional) => (
                <Grid item xs={12} key={devotional.id}>
                    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                                {devotional.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Por {devotional.author} em {new Date(devotional.createdAt).toLocaleDateString('pt-BR')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ 
                                display: '-webkit-box', 
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {devotional.content}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button component={Link} href={`/devocionais/${devotional.id}`} size="small">Ler Mais</Button>
                        </CardActions>
                    </Card>
                </Grid>
              ))}
          </Grid>
        ) : (
          <Typography align="center" color="text.secondary" sx={{ mt: 8 }}>
            Nenhuma publicação encontrada. Volte em breve!
          </Typography>
        )}
      </Container>
    </Box>
  );
}