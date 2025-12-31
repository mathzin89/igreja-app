"use client";

import React, { useState } from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
// ✅ CORREÇÃO: Usa um caminho de importação absoluto para a ação
import { migrateMembersData } from '@/app/admin/migrate/actions';

export default function MigrationClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleMigration = async () => {
    if (!confirm('Tem a certeza de que deseja iniciar a migração de dados? Esta ação não pode ser desfeita.')) {
      return;
    }
    setLoading(true);
    setResult(null);
    const response = await migrateMembersData();
    setResult(response);
    setLoading(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleMigration}
        disabled={loading}
        sx={{ minWidth: 150 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Iniciar Migração'}
      </Button>

      {result && (
        <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 3 }}>
          {result.message}
        </Alert>
      )}
    </Box>
  );
}

