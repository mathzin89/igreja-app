"use client";

import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Divider, Tabs, Tab, Button } from '@mui/material';
import Link from 'next/link';

// Componente TabPanel (sem alterações)
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SobreNosPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ backgroundColor: '#fff', py: 6 }}>
      <Container maxWidth="lg">
        {/* Seção de Título e História (Intacta) */}
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          textAlign="center" 
          sx={{ fontWeight: 'bold', fontFamily: 'var(--font-merriweather)', color: '#1c3d5a' }}
        >
          Sobre a AD Plenitude
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          textAlign="center" 
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          O início de um ministério abençoado por Deus
        </Typography>
        <Divider sx={{ mb: 6 }} />
        <Box sx={{ my: 5 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontFamily: 'var(--font-merriweather)', color: '#333' }}>
            Nossa História
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555' }}>
            O ministério Plenitude... (seu texto completo da história aqui)
          </Typography>
        </Box>
        
        <Divider sx={{ my: 6 }} />

        {/* Seção Liderança Pastoral e Congregações */}
        <Box sx={{ my: 5, textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontFamily: 'var(--font-merriweather)', mb: 4, color: '#1c3d5a' }}>
            Nossa Liderança Pastoral
          </Typography>
          <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Igreja Sede" />
              <Tab label="Primeiro de Maio" />
              <Tab label="Paraná" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={8} md={5}>
                <Card>
                  <CardMedia component="img" height="350" image="/images/casal-pastoral.jpg" alt="Foto dos Pastores Presidentes" />
                  <CardContent>
                    <Typography variant="h6">Pastor Josenildo e Pastora Maria Lucia</Typography>
                    <Typography variant="body2" color="text.secondary">Pastores Presidentes</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={8} md={5}>
                <Card>
                  <CardMedia component="img" height="350" image="/images/pastor-antonio.jpg" alt="Foto do Pastor Antonio" />
                  <CardContent>
                    <Typography variant="h6">Pastor Antonio</Typography>
                    <Typography variant="body2" color="text.secondary">Pastor</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={8} md={5}>
                <Card>
                  <CardMedia component="img" height="350" image="/images/pastor-delson.jpg" alt="Foto do Pastor Delson" />
                  <CardContent>
                    <Typography variant="h6">Pastor Delson</Typography>
                    <Typography variant="body2" color="text.secondary">Pastor</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Liderança Primeiro de Maio */}
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia component="img" height="300" image="/images/lider-placeholder.jpg" alt="Dirigentes" />
                  <CardContent>
                    <Typography variant="h6">Pastor Igor Henrique e Pastora Jéssica</Typography>
                    <Typography variant="body2" color="text.secondary">Dirigentes da Congregação Primeiro de Maio</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Liderança Paraná */}
             <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia component="img" height="300" image="/images/lider-placeholder.jpg" alt="Foto do Líder" />
                  <CardContent>
                    <Typography variant="h6">[Nome do Dirigente]</Typography>
                    <Typography variant="body2" color="text.secondary">Dirigente da Congregação</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" component={Link} href="/ministerios">
            Conheça Todos os Nossos Ministérios
          </Button>
        </Box>
      </Container>
    </Box>
  );
}