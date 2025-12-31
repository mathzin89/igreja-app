// src/app/devocionais/[id]/page.tsx
"use client"; // ✅ A página agora é um Client Component.

import { getDevotionalById } from "../../actions";
import { Box, Container, Typography, Divider, CircularProgress } from '@mui/material';
import { notFound, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface Devotional {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
}

export default function DevotionalPage() {
  const params = useParams();
  const id = params?.id as string;

  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      async function fetchDevotional() {
        setLoading(true);
        const data = await getDevotionalById(id);
        if (!data) {
          notFound();
        } else {
          setDevotional(data);
        }
        setLoading(false);
      }
      fetchDevotional();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!devotional) {
    return null; // O notFound() já terá redirecionado
  }

  return (
    <Box sx={{ backgroundColor: 'white', py: 8, minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', textAlign: 'center' }}>
          {devotional.title}
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
          Por {devotional.author} em {new Date(devotional.createdAt).toLocaleDateString('pt-BR')}
        </Typography>
        <Divider sx={{ my: 4 }} />
        <Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '1.1rem' }}>
          {devotional.content}
        </Typography>
      </Container>
    </Box>
  );
}