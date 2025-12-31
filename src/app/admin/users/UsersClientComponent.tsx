"use client";

import React, { useState } from 'react';
import { UserData } from './page';
// ✅ CORREÇÃO: Caminho de importação ajustado para ser absoluto
import { updateUserRole } from '@/app/admin/users/actions';

import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, Button, CircularProgress, Alert
} from '@mui/material';

interface Props {
  initialUsers: UserData[];
  roles: { id: string, nome: string }[];
}

export default function UsersClientComponent({ initialUsers, roles }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRoleChange = (uid: string, newRole: string) => {
    setUsers(prev =>
      prev.map(user => (user.uid === uid ? { ...user, role: newRole } : user))
    );
  };

  const handleSave = async (uid: string, newRole: string) => {
    setLoadingId(uid);
    setError(null);
    setSuccess(null);

    const result = await updateUserRole(uid, newRole);

    if (result.success) {
      setSuccess('Cargo atualizado com sucesso!');
    } else {
      setError(result.message || 'Ocorreu um erro.');
      // Reverte a alteração visual em caso de erro
      setUsers(initialUsers);
    }
    
    setLoadingId(null);
    // Limpa a mensagem após 3 segundos
    setTimeout(() => {
        setSuccess(null);
        setError(null);
    }, 3000);
  };

  return (
    <>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Igreja</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell align="center">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.igrejaNome}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    {roles.map(role => (
                      <MenuItem key={role.id} value={role.id}>{role.nome}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSave(user.uid, user.role)}
                    disabled={loadingId === user.uid}
                  >
                    {loadingId === user.uid ? <CircularProgress size={20} /> : 'Salvar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

