"use client";

import React from 'react';
import { Grid, Paper, Box, Typography, Avatar } from '@mui/material';

// ✅ NOVO ESTILO PARA O STATCARD
export const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
  <Grid item xs={12} sm={6} lg={4}>
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', height: '100%' }}>
      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 56, height: 56, mr: 2 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="body1" color="text.secondary">{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      </Box>
    </Paper>
  </Grid>
);