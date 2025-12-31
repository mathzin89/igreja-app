import React from 'react';
import { Box, Typography } from '@mui/material';
import MigrationClient from './MigrationClient';

export default function MigratePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Migração de Dados dos Membros
      </Typography>
      <Typography paragraph>
        Esta página contém uma ferramenta para atualizar a estrutura de dados dos membros antigos. O script irá adicionar o campo `igrejaId` a todos os membros que ainda não o possuem, com base no nome da sua congregação.
      </Typography>
      <Typography paragraph sx={{ fontWeight: 'bold' }}>
        Atenção: Execute esta ação apenas uma vez.
      </Typography>
      
      <MigrationClient />
    </Box>
  );
}
