"use client";

import React, { useState, useEffect, useCallback } from 'react';
// Imports do Firebase com a função UPDATE
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
// Imports do Material-UI
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField,
  FormLabel, RadioGroup, FormControlLabel, Radio, IconButton, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Ícone de edição
import VisibilityIcon from '@mui/icons-material/Visibility';

const estadoInicialFormulario = {
    nome: '', foto: '', endereco: '', numero: '', complemento: '', bairro: '',
    cidade: '', estado: '', cep: '', rg: '', cpf: '', dataNascimento: '',
    estadoCivil: '', tel: '', celular: '', filiacaoMae: '', filiacaoPai: '',
    batizadoEspiritoSanto: 'Nao', batismoAguasData: '', cargo: '', recebidoMinisterioData: '',
    status: 'Ativo'
};

const DetalheCampo = ({ label, value }: { label: string, value?: string }) => (
    <Grid item xs={12} sm={6} md={4}>
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {label.toUpperCase()}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {value || 'Não informado'}
            </Typography>
        </Box>
    </Grid>
);

export default function PaginaMembros() {
  const [membros, setMembros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para os modais
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [novoMembro, setNovoMembro] = useState(estadoInicialFormulario);
  const [nomeArquivoFoto, setNomeArquivoFoto] = useState('');
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<any>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false); // Estado para o modal de Edição
  const [membroParaEditar, setMembroParaEditar] = useState<any>(null); // Estado para o membro a ser editado

  const fetchMembros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "membros"));
      const membrosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembros(membrosData);
    } catch (err) {
      console.error("ERRO DETALHADO AO BUSCAR MEMBROS: ", err);
      setError("Falha ao carregar os dados. Verifique o console.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembros();
  }, [fetchMembros]);

  // Funções de controlo para o modal de Adicionar
  const handleAddClickOpen = () => { setNovoMembro(estadoInicialFormulario); setNomeArquivoFoto(''); setAddModalOpen(true); };
  const handleAddClose = () => { setAddModalOpen(false); };
  
  // handleChange agora funciona para Adicionar e Editar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isEditModalOpen) {
      setMembroParaEditar((prev: any) => ({ ...prev, [name]: value }));
    } else {
      setNovoMembro(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; /* @ts-ignore */ setNovoMembro(prev => ({ ...prev, foto: file })); setNomeArquivoFoto(file.name); }};
  const handleSalvarMembro = async () => { if (!novoMembro.nome.trim()) { alert('O nome do membro é obrigatório!'); return; } try { const { foto, ...dadosParaSalvar } = novoMembro; await addDoc(collection(db, "membros"), dadosParaSalvar); alert(`Membro "${dadosParaSalvar.nome}" adicionado com sucesso!`); handleAddClose(); fetchMembros(); } catch (e) { console.error("Erro ao adicionar documento: ", e); }};

  // Funções para o modal de Visualizar
  const handleViewClickOpen = (membro: any) => { setMembroSelecionado(membro); setViewModalOpen(true); };
  const handleViewClose = () => { setViewModalOpen(false); setMembroSelecionado(null); };

  // --- NOVIDADE: Funções para o modal de Edição ---
  const handleEditClickOpen = (membro: any) => {
    setMembroParaEditar(membro); // Carrega os dados do membro no estado de edição
    setEditModalOpen(true); // Abre o modal de edição
  };
  const handleEditClose = () => {
    setEditModalOpen(false);
    setMembroParaEditar(null); // Limpa o membro selecionado para edição
  };
  const handleUpdateMembro = async () => {
    if (!membroParaEditar || !membroParaEditar.nome.trim()) {
      alert('O nome do membro é obrigatório!');
      return;
    }
    try {
      const membroDocRef = doc(db, "membros", membroParaEditar.id);
      // Remove o 'id' do objeto antes de enviar para o Firestore, já que o ID já está na referência do documento
      const { id, ...dadosParaAtualizar } = membroParaEditar;
      await updateDoc(membroDocRef, dadosParaAtualizar);
      alert(`Dados de "${dadosParaAtualizar.nome}" atualizados com sucesso!`);
      handleEditClose(); // Fecha o modal
      fetchMembros(); // Atualiza a lista de membros para refletir as mudanças
    } catch (e) {
      console.error("Erro ao atualizar documento: ", e);
      alert("Ocorreu um erro ao atualizar os dados do membro.");
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Membros Cadastrados</Typography>
        <Button variant="contained" color="primary" onClick={handleAddClickOpen}>Adicionar Novo</Button>
      </Box>

      {error && ( <Typography color="error" sx={{ my: 4 }}>{error}</Typography> )}

      {!error && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                    <TableCell sx={{fontWeight: 'bold'}}>Foto</TableCell>
                    <TableCell sx={{fontWeight: 'bold'}}>Nome</TableCell>
                    <TableCell sx={{fontWeight: 'bold'}}>Telemóvel</TableCell>
                    <TableCell sx={{fontWeight: 'bold'}}>Cidade</TableCell>
                    <TableCell sx={{fontWeight: 'bold'}}>Status</TableCell>
                    <TableCell sx={{fontWeight: 'bold'}}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
                ) : membros.length > 0 ? (
                  membros.map((membro) => (
                    <TableRow hover key={membro.id}>
                      <TableCell><Avatar>{membro.nome.charAt(0)}</Avatar></TableCell>
                      <TableCell>{membro.nome}</TableCell>
                      <TableCell>{membro.celular}</TableCell>
                      <TableCell>{membro.cidade}</TableCell>
                      <TableCell>
                        <Chip label={membro.status} color={membro.status === 'Ativo' ? 'success' : 'error'} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton color="default" size="small" onClick={() => handleViewClickOpen(membro)}>
                          <VisibilityIcon />
                        </IconButton>
                        {/* --- NOVIDADE: Botão de Edição --- */}
                        <IconButton color="primary" size="small" onClick={() => handleEditClickOpen(membro)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} align="center">Nenhum membro encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* MODAL DE ADIÇÃO (COMPLETO E FUNCIONAL) */}
      <Dialog open={isAddModalOpen} onClose={handleAddClose} maxWidth="md" fullWidth>
        <DialogTitle>Ficha de Cadastro de Membros</DialogTitle>
        <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={9}><TextField name="nome" label="Nome Completo" fullWidth variant="outlined" value={novoMembro.nome} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={3}><Button variant="outlined" component="label" fullWidth sx={{height: '100%'}}>Carregar Foto<input type="file" hidden accept="image/*" onChange={handleFotoChange} /></Button>{nomeArquivoFoto && <Typography variant="caption">{nomeArquivoFoto}</Typography>}</Grid>
              <Grid item xs={12} sm={8}><TextField name="endereco" label="Endereço (Rua, Av.)" fullWidth variant="outlined" value={novoMembro.endereco} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField name="numero" label="Número" fullWidth variant="outlined" value={novoMembro.numero} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="complemento" label="Complemento" fullWidth variant="outlined" value={novoMembro.complemento} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="bairro" label="Bairro" fullWidth variant="outlined" value={novoMembro.bairro} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="cidade" label="Cidade" fullWidth variant="outlined" value={novoMembro.cidade} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={3}><TextField name="estado" label="Estado" fullWidth variant="outlined" value={novoMembro.estado} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={3}><TextField name="cep" label="CEP" fullWidth variant="outlined" value={novoMembro.cep} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField name="rg" label="RG" fullWidth variant="outlined" value={novoMembro.rg} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField name="cpf" label="CPF" fullWidth variant="outlined" value={novoMembro.cpf} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField name="dataNascimento" label="Data de Nascimento" type="date" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={novoMembro.dataNascimento} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField name="estadoCivil" label="Estado Civil" fullWidth variant="outlined" value={novoMembro.estadoCivil} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField name="tel" label="Telefone Fixo" fullWidth variant="outlined" value={novoMembro.tel} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField name="celular" label="Telemóvel" fullWidth variant="outlined" value={novoMembro.celular} onChange={handleChange} /></Grid>
              <Grid item xs={12}><Typography variant="h6" sx={{mt:2}}>Filiação</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField name="filiacaoMae" label="Nome da Mãe" fullWidth variant="outlined" value={novoMembro.filiacaoMae} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="filiacaoPai" label="Nome do Pai" fullWidth variant="outlined" value={novoMembro.filiacaoPai} onChange={handleChange} /></Grid>
              <Grid item xs={12}><Typography variant="h6" sx={{mt:2}}>Dados Ministeriais</Typography></Grid>
              <Grid item xs={12} sm={6}><FormLabel component="legend">Batizado no Espírito Santo?</FormLabel><RadioGroup row name="batizadoEspiritoSanto" value={novoMembro.batizadoEspiritoSanto} onChange={handleChange}><FormControlLabel value="Sim" control={<Radio />} label="Sim" /><FormControlLabel value="Nao" control={<Radio />} label="Não" /></RadioGroup></Grid>
              <Grid item xs={12} sm={6}><TextField name="batismoAguasData" label="Data do Batismo nas Águas" type="date" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={novoMembro.batismoAguasData} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="cargo" label="Cargo na Igreja" fullWidth variant="outlined" value={novoMembro.cargo} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="recebidoMinisterioData" label="Recebido no Ministério em" type="date" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={novoMembro.recebidoMinisterioData} onChange={handleChange} /></Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancelar</Button>
          <Button onClick={handleSalvarMembro} variant="contained">Salvar Membro</Button>
        </DialogActions>
      </Dialog>
      
      {/* MODAL DE VISUALIZAÇÃO (COMPLETO E FUNCIONAL) */}
      <Dialog open={isViewModalOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, borderBottom: '1px solid #eee' }}>
          Ficha do Membro
        </DialogTitle>
        <DialogContent sx={{backgroundColor: '#f9f9f9', p: 3}}>
          {membroSelecionado && (
              <Box sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 1, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                        <Typography variant="h4" gutterBottom>{membroSelecionado.nome}</Typography>
                        <Typography variant="body1" color="textSecondary">{membroSelecionado.cargo || 'Membro'}</Typography>
                        <Chip label={membroSelecionado.status} color={membroSelecionado.status === 'Ativo' ? 'success' : 'error'} sx={{mt: 1}} />
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{textAlign: 'right'}}>
                        <Avatar sx={{width: 100, height: 100, float: 'right', fontSize: '3rem'}}>{membroSelecionado.nome.charAt(0)}</Avatar>
                    </Grid>

                    <Grid item xs={12}><Divider sx={{my:2}}><Typography variant="overline">Dados Pessoais</Typography></Divider></Grid>
                    <DetalheCampo label="Endereço" value={`${membroSelecionado.endereco || ''}, ${membroSelecionado.numero || ''}`} />
                    <DetalheCampo label="Bairro" value={membroSelecionado.bairro} />
                    <DetalheCampo label="Cidade / Estado" value={`${membroSelecionado.cidade || ''} - ${membroSelecionado.estado || ''}`} />
                    <DetalheCampo label="CEP" value={membroSelecionado.cep} />
                    <DetalheCampo label="RG" value={membroSelecionado.rg} />
                    <DetalheCampo label="CPF" value={membroSelecionado.cpf} />
                    <DetalheCampo label="Data de Nascimento" value={membroSelecionado.dataNascimento} />
                    <DetalheCampo label="Estado Civil" value={membroSelecionado.estadoCivil} />
                    <DetalheCampo label="Telefone Fixo" value={membroSelecionado.tel} />
                    <DetalheCampo label="Telemóvel" value={membroSelecionado.celular} />

                    {/* --- NOVIDADE: Seção de Filiação está de volta --- */}
                    <Grid item xs={12}><Divider sx={{my:2}}><Typography variant="overline">Filiação</Typography></Divider></Grid>
                    <DetalheCampo label="Nome da Mãe" value={membroSelecionado.filiacaoMae} />
                    <DetalheCampo label="Nome do Pai" value={membroSelecionado.filiacaoPai} />
                    
                    {/* --- NOVIDADE: Seção de Dados Ministeriais está de volta --- */}
                    <Grid item xs={12}><Divider sx={{my:2}}><Typography variant="overline">Dados Ministeriais</Typography></Divider></Grid>
                    <DetalheCampo label="Batizado no Espírito Santo?" value={membroSelecionado.batizadoEspiritoSanto} />
                    <DetalheCampo label="Data do Batismo nas Águas" value={membroSelecionado.batismoAguasData} />
                    <DetalheCampo label="Cargo na Igreja" value={membroSelecionado.cargo} />
                    <DetalheCampo label="Recebido no Ministério em" value={membroSelecionado.recebidoMinisterioData} />
                </Grid>
              </Box>
          )}
        </DialogContent>
        <DialogActions sx={{borderTop: '1px solid #eee', p: 2}}>
          <Button onClick={handleViewClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE EDIÇÃO (COMPLETO E FUNCIONAL) */}
      <Dialog open={isEditModalOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Informações do Membro</DialogTitle>
        <DialogContent>
            {membroParaEditar && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={9}><TextField name="nome" label="Nome Completo" fullWidth variant="outlined" value={membroParaEditar.nome} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={3}><Button variant="outlined" component="label" fullWidth sx={{height: '100%'}}>Alterar Foto<input type="file" hidden accept="image/*" /></Button></Grid>
                    <Grid item xs={12} sm={8}><TextField name="endereco" label="Endereço (Rua, Av.)" fullWidth variant="outlined" value={membroParaEditar.endereco} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="numero" label="Número" fullWidth variant="outlined" value={membroParaEditar.numero} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="complemento" label="Complemento" fullWidth variant="outlined" value={membroParaEditar.complemento} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="bairro" label="Bairro" fullWidth variant="outlined" value={membroParaEditar.bairro} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="cidade" label="Cidade" fullWidth variant="outlined" value={membroParaEditar.cidade} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={3}><TextField name="estado" label="Estado" fullWidth variant="outlined" value={membroParaEditar.estado} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={3}><TextField name="cep" label="CEP" fullWidth variant="outlined" value={membroParaEditar.cep} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="rg" label="RG" fullWidth variant="outlined" value={membroParaEditar.rg} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="cpf" label="CPF" fullWidth variant="outlined" value={membroParaEditar.cpf} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="dataNascimento" label="Data de Nascimento" type="date" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={membroParaEditar.dataNascimento} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="estadoCivil" label="Estado Civil" fullWidth variant="outlined" value={membroParaEditar.estadoCivil} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="tel" label="Telefone Fixo" fullWidth variant="outlined" value={membroParaEditar.tel} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="celular" label="Telemóvel" fullWidth variant="outlined" value={membroParaEditar.celular} onChange={handleChange} /></Grid>
                    <Grid item xs={12}><Typography variant="h6" sx={{mt:2}}>Filiação</Typography></Grid>
                    <Grid item xs={12} sm={6}><TextField name="filiacaoMae" label="Nome da Mãe" fullWidth variant="outlined" value={membroParaEditar.filiacaoMae} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="filiacaoPai" label="Nome do Pai" fullWidth variant="outlined" value={membroParaEditar.filiacaoPai} onChange={handleChange} /></Grid>
                    <Grid item xs={12}><Typography variant="h6" sx={{mt:2}}>Dados Ministeriais</Typography></Grid>
                    <Grid item xs={12} sm={6}><FormLabel component="legend">Batizado no Espírito Santo?</FormLabel><RadioGroup row name="batizadoEspiritoSanto" value={membroParaEditar.batizadoEspiritoSanto} onChange={handleChange}><FormControlLabel value="Sim" control={<Radio />} label="Sim" /><FormControlLabel value="Nao" control={<Radio />} label="Não" /></RadioGroup></Grid>
                    <Grid item xs={12} sm={6}><TextField name="batismoAguasData" label="Data do Batismo nas Águas" type="date" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={membroParaEditar.batismoAguasData} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="cargo" label="Cargo na Igreja" fullWidth variant="outlined" value={membroParaEditar.cargo} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="recebidoMinisterioData" label="Recebido no Ministério em" type="date" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={membroParaEditar.recebidoMinisterioData} onChange={handleChange} /></Grid>
                </Grid>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button onClick={handleUpdateMembro} variant="contained">Salvar Alterações</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}