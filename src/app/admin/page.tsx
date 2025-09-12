"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/config";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField,
  FormLabel, RadioGroup, FormControlLabel, Radio, IconButton, MenuItem, Divider,
  Alert
} from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";

interface Membro {
  id?: string;
  nome: string;
  foto: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  estadoCivil: string;
  tel: string;
  celular: string;
  congregacao: string;
  filiacaoMae: string;
  filiacaoPai: string;
  batizadoEspiritoSanto: string;
  batismoAguasData: string;
  cargo: string;
  recebidoMinisterioData: string;
  status: string;
}

const estadoInicialFormulario: Omit<Membro, 'id'> = {
  nome: "", foto: "", endereco: "", numero: "", complemento: "", bairro: "",
  cidade: "", estado: "", cep: "", rg: "", cpf: "", dataNascimento: "",
  estadoCivil: "", tel: "", celular: "", congregacao: "Sede", filiacaoMae: "", filiacaoPai: "",
  batizadoEspiritoSanto: "Nao", batismoAguasData: "", cargo: "", recebidoMinisterioData: "",
  status: "Ativo",
};

// Opções pré-setadas para Cargos
const cargoOptions = [
  "Cooperador", "Diácono", "Diaconisa", "Missionária", "Presbítero", "Evangelista", "Pastor"
];

// Opções pré-setadas para Estados
const estadoOptions = [
  "SP", "PR"
];

// Opções pré-setadas para Congregações
const congregacaoOptions = [
  "Sede", "1° de Maio"
];

const DetalheCampo = ({ label, value }: { label: string; value?: string }) => (
  <Grid item xs={12} sm={6}> {/* Ajustado para xs=12, sm=6 para melhor visualização em modais */}
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">{label.toUpperCase()}</Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>{value || "Não informado"}</Typography>
    </Box>
  </Grid>
);

export default function PaginaMembros() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [novoMembro, setNovoMembro] = useState(estadoInicialFormulario);
  const [novaFoto, setNovaFoto] = useState<File | null>(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<Membro | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [membroParaEditar, setMembroParaEditar] = useState<Membro | null>(null);
  const [fotoParaEditar, setFotoParaEditar] = useState<File | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchMembros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "membros"));
      const membrosData = querySnapshot.docs.map((doc) => ({
        id: doc.id, ...(doc.data() as Omit<Membro, "id">),
      })) as Membro[];
      setMembros(membrosData);
    } catch (err) {
      console.error("ERRO DETALHADO AO BUSCAR MEMBROS: ", err);
      setError("Falha ao carregar os dados. Verifique o console.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembros(); }, [fetchMembros]);

  const handleAddClickOpen = () => { setNovoMembro(estadoInicialFormulario); setNovaFoto(null); setAddModalOpen(true); };
  const handleAddClose = () => setAddModalOpen(false);
  const handleViewClickOpen = (membro: Membro) => { setMembroSelecionado(membro); setViewModalOpen(true); };
  const handleViewClose = () => { setViewModalOpen(false); setMembroSelecionado(null); };
  const handleEditClickOpen = (membro: Membro) => { setMembroParaEditar(membro); setFotoParaEditar(null); setEditModalOpen(true); };
  const handleEditClose = () => { setEditModalOpen(false); setMembroParaEditar(null); };
  const handleOpenDeleteModal = (membro: Membro) => { setMembroSelecionado(membro); setDeleteModalOpen(true); };
  const handleCloseDeleteModal = () => { setDeleteModalOpen(false); setMembroSelecionado(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (isEditModalOpen && membroParaEditar) {
      setMembroParaEditar({ ...membroParaEditar, [name]: value } as Membro);
    } else {
      setNovoMembro((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadFoto = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `membros/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSalvarMembro = async () => {
    if (!novoMembro.nome.trim()) { alert("O nome do membro é obrigatório!"); return; }
    setIsSubmitting(true);
    try {
      let fotoURL = "";
      if (novaFoto) { fotoURL = await uploadFoto(novaFoto); }
      await addDoc(collection(db, "membros"), { ...novoMembro, foto: fotoURL });
      alert(`Membro "${novoMembro.nome}" adicionado com sucesso!`);
      handleAddClose();
      fetchMembros();
    } catch (e) {
      console.error("Erro ao adicionar documento: ", e);
      alert("Erro ao adicionar o membro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMembro = async () => {
    if (!membroParaEditar || !membroParaEditar.nome.trim()) { alert("O nome do membro é obrigatório!"); return; }
    setIsSubmitting(true);
    try {
      let fotoURL = membroParaEditar.foto;
      if (fotoParaEditar) { fotoURL = await uploadFoto(fotoParaEditar); }
      const membroDocRef = doc(db, "membros", membroParaEditar.id!);
      const { id, ...dadosParaAtualizar } = membroParaEditar;
      await updateDoc(membroDocRef, { ...dadosParaAtualizar, foto: fotoURL });
      alert(`Dados de "${dadosParaAtualizar.nome}" atualizados com sucesso!`);
      handleEditClose();
      fetchMembros();
    } catch (e) {
      console.error("Erro ao atualizar documento: ", e);
      alert("Ocorreu um erro ao atualizar os dados do membro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMembro = async () => {
    if (!membroSelecionado?.id) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "membros", membroSelecionado.id));
      alert("Membro excluído com sucesso!");
      handleCloseDeleteModal();
      fetchMembros();
    } catch (e) {
      console.error("Erro ao excluir membro: ", e);
      alert("Ocorreu um erro ao excluir o membro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FUNÇÃO AUXILIAR PARA FORMATAR DATA (DD/MM/AAAA) ---
  const formatDateToDDMMYYYY = (dateString: string | undefined): string => {
    if (!dateString) return "Não informado";
    try {
      // Adiciona T00:00:00 para evitar problemas de fuso horário ao criar o objeto Date
      const date = new Date(dateString + "T00:00:00"); 
      if (isNaN(date.getTime())) {
        return dateString; // Se a data for inválida, retorna o original
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return dateString; // Em caso de erro, retorna a string original
    }
  };

  // ----- FUNÇÃO: GERAR FICHA DO MEMBRO COM TEMPLATE FINANCEIRO (ATUALIZADA) -----
  const generateMemberFichaPdf = async (membro: Membro | null) => {
    if (!membro) {
      alert('Nenhum membro selecionado para gerar a ficha.');
      return;
    }
    setIsSubmitting(true);

    const templateUrl = "https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/Ficha.jpg?alt=media&token=f5858592-130f-4956-9952-2da2ec771737";
    const logoUrl = "https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/logo-plenitude.png?alt=media&token=1a61b486-b9a6-49ab-bfc1-56140700f9cb";

    let templateBase64 = '';
    let logoBase64 = '';
    try {
      const fetchAsBase64 = async (url: string) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      };
      templateBase64 = await fetchAsBase64(templateUrl);
      logoBase64 = await fetchAsBase64(logoUrl);
    } catch (error) {
      console.error("Erro ao carregar imagens para o PDF:", error);
    }

    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40; 
    let currentY = margin; // Posição Y atual para desenhar elementos

    // Função auxiliar para adicionar o template e a marca d'água em cada página
    const addPageTemplateAndWatermark = () => {
      if (templateBase64) {
        doc.addImage(templateBase64, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
      }
      if (logoBase64) {
        const watermarkWidth = 300;
        const watermarkHeight = (watermarkWidth / 45) * 30; 
        const watermarkX = (pageWidth - watermarkWidth) / 2;
        const watermarkY = (pageHeight - watermarkHeight) / 2;
        (doc as any).setGState(new (doc as any).GState({ opacity: 0.30 }));
        doc.addImage(logoBase64, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight, undefined, 'NONE');
        (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
      }
    };
    
    addPageTemplateAndWatermark(); // Adiciona o template na primeira página

    // --- CABEÇALHO DA FICHA ---
    currentY = 170; // Posição Y inicial para o nome do membro, ajustado para o seu template
    doc.setFontSize(16); // Aumenta o tamanho da fonte para o nome
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    // Desenha o nome do membro APENAS UMA VEZ, centralizado e um pouco maior
    doc.text(membro.nome || 'Nome do Membro', pageWidth / 2, currentY, { align: 'center' });
    currentY += 40; // Espaço após o nome do membro

    // --- DETALHES DO MEMBRO AGRUPADOS ---
    doc.setFontSize(12); // Tamanho da fonte para os valores dos campos
    doc.setTextColor(0, 0, 0); 

    const startX = margin + 10; // Posição X para iniciar o texto dos campos
    const lineHeight = 18; // Espaçamento entre as linhas de texto (aumentado)
    const sectionTitleSpacing = 25; // Espaçamento após o título da seção

    const addSectionTitle = (title: string) => {
      // Verifica se há espaço para o título + alguns campos antes de uma nova página
      if (currentY + 50 > pageHeight - margin - 30) { 
        doc.addPage();
        addPageTemplateAndWatermark();
        currentY = margin + 20; // Reinicia Y na nova página
      }
      doc.setFontSize(14); // Aumenta o tamanho da fonte do título da seção
      doc.setFont('helvetica', 'bold');
      doc.text(title, startX, currentY);
      doc.line(startX, currentY + 3, pageWidth - margin, currentY + 3); // Linha abaixo do título
      currentY += sectionTitleSpacing; // Espaço após o título e linha
      doc.setFontSize(12); // Volta para o tamanho de fonte dos campos
      doc.setFont('helvetica', 'normal');
    };

    // Função para adicionar um campo
    const addField = (label: string, value: string) => {
      // Verifica se o campo vai exceder o limite da página
      if (currentY + lineHeight > pageHeight - margin - 30) {
        doc.addPage();
        addPageTemplateAndWatermark();
        currentY = margin + 20; // Reinicia Y na nova página
      }
      doc.text(`${label}: ${value || "Não informado"}`, startX, currentY);
      currentY += lineHeight;
    };

    // --- SEÇÃO ENDEREÇO ---
    addSectionTitle("Endereço");
    addField("Endereço", membro.endereco);
    addField("Número", membro.numero);
    if (membro.complemento) addField("Complemento", membro.complemento);
    addField("Bairro", membro.bairro);
    addField("Cidade", membro.cidade);
    addField("Estado", membro.estado);
    addField("CEP", membro.cep);
    currentY += 15; // Espaço entre seções

    // --- SEÇÃO DADOS PESSOAIS ---
    addSectionTitle("Dados Pessoais");
    addField("RG", membro.rg);
    addField("CPF", membro.cpf);
    addField("Data de Nascimento", formatDateToDDMMYYYY(membro.dataNascimento)); // Formatado aqui
    addField("Estado Civil", membro.estadoCivil);
    addField("Nome da Mãe", membro.filiacaoMae); 
    addField("Nome do Pai", membro.filiacaoPai); 
    currentY += 15; // Espaço entre seções

    // --- SEÇÃO CONTATO ---
    addSectionTitle("Contato");
    addField("Telefone Fixo", membro.tel);
    addField("Celular", membro.celular);
    currentY += 15; // Espaço entre seções

    // --- SEÇÃO INFORMAÇÕES MINISTERIAIS ---
    addSectionTitle("Informações Ministeriais");
    addField("Congregação", membro.congregacao);
    addField("Cargo", membro.cargo);
    addField("Status", membro.status);
    addField("Batizado no Espírito Santo?", membro.batizadoEspiritoSanto);
    addField("Data do Batismo nas Águas", formatDateToDDMMYYYY(membro.batismoAguasData)); // Formatado aqui
    addField("Recebido no Ministério em", formatDateToDDMMYYYY(membro.recebidoMinisterioData)); // Formatado aqui
    currentY += 15; // Espaço final

    doc.setFontSize(10); // Tamanho da fonte para o rodapé
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    // Posiciona o rodapé fixo na parte inferior da págin


    doc.save(`Ficha - ${membro.nome}.pdf`);
    setIsSubmitting(false);
  };
  // ----- FIM DA FUNÇÃO generateMemberFichaPdf -----


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Membros Cadastrados</Typography>
        <Button variant="contained" color="primary" onClick={handleAddClickOpen}>Adicionar Novo</Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {!error && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Foto</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Celular</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Cidade</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Congregação</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Cargo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
                ) : membros.map((membro) => (
                  <TableRow hover key={membro.id}>
                    <TableCell><Avatar src={membro.foto}>{membro.nome.charAt(0)}</Avatar></TableCell>
                    <TableCell>{membro.nome}</TableCell>
                    <TableCell>{membro.celular}</TableCell>
                    <TableCell>{membro.cidade}</TableCell>
                    <TableCell>{membro.congregacao}</TableCell>
                    <TableCell>{membro.cargo}</TableCell>
                    <TableCell><Chip label={membro.status} color={membro.status === "Ativo" ? "success" : "error"} size="small" /></TableCell>
                    <TableCell>
                      <IconButton color="default" size="small" onClick={() => handleViewClickOpen(membro)}><VisibilityIcon /></IconButton>
                      <IconButton color="primary" size="small" onClick={() => handleEditClickOpen(membro)}><EditIcon /></IconButton>
                      <IconButton color="error" size="small" onClick={() => handleOpenDeleteModal(membro)}><DeleteIcon /></IconButton>
                      <IconButton color="secondary" size="small" onClick={() => generateMemberFichaPdf(membro)} disabled={isSubmitting}><PrintIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* MODAL DE ADIÇÃO */}
      <Dialog open={isAddModalOpen} onClose={handleAddClose} maxWidth="md" fullWidth>
        <DialogTitle>Adicionar Novo Membro</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField name="nome" label="Nome Completo" value={novoMembro.nome} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="endereco" label="Endereço" value={novoMembro.endereco} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField name="numero" label="Número" value={novoMembro.numero} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="complemento" label="Complemento" value={novoMembro.complemento} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="bairro" label="Bairro" value={novoMembro.bairro} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="cidade" label="Cidade" value={novoMembro.cidade} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField name="estado" label="Estado (UF)" select value={novoMembro.estado} onChange={handleChange} fullWidth>
                {estadoOptions.map((estado) => (
                  <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="cep" label="CEP" value={novoMembro.cep} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="rg" label="RG" value={novoMembro.rg} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="cpf" label="CPF" value={novoMembro.cpf} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="dataNascimento" label="Data de Nascimento" type="date" value={novoMembro.dataNascimento} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="estadoCivil" label="Estado Civil" select value={novoMembro.estadoCivil} onChange={handleChange} fullWidth>
                <MenuItem value="Solteiro">Solteiro</MenuItem>
                <MenuItem value="Casado">Casado</MenuItem>
                <MenuItem value="Divorciado">Divorciado</MenuItem>
                <MenuItem value="Viúvo">Viúvo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="tel" label="Telefone Fixo" value={novoMembro.tel} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="celular" label="Celular" value={novoMembro.celular} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField name="filiacaoMae" label="Filiação (Mãe)" value={novoMembro.filiacaoMae} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField name="filiacaoPai" label="Filiação (Pai)" value={novoMembro.filiacaoPai} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="congregacao" label="Congregação" select value={novoMembro.congregacao} onChange={handleChange} fullWidth>
                {congregacaoOptions.map((cong) => (
                  <MenuItem key={cong} value={cong}>{cong}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="cargo" label="Cargo" select value={novoMembro.cargo} onChange={handleChange} fullWidth>
                {cargoOptions.map((cargo) => (
                  <MenuItem key={cargo} value={cargo}>{cargo}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormLabel component="legend">Batizado no Espírito Santo?</FormLabel>
              <RadioGroup row name="batizadoEspiritoSanto" value={novoMembro.batizadoEspiritoSanto} onChange={handleChange}>
                <FormControlLabel value="Sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="Nao" control={<Radio />} label="Não" />
              </RadioGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="batismoAguasData" label="Data do Batismo nas Águas" type="date" value={novoMembro.batismoAguasData} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="recebidoMinisterioData" label="Data de Recepção no Ministério" type="date" value={novoMembro.recebidoMinisterioData} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="status" label="Status" select value={novoMembro.status} onChange={handleChange} fullWidth>
                <MenuItem value="Ativo">Ativo</MenuItem>
                <MenuItem value="Inativo">Inativo</MenuItem>
                <MenuItem value="Transferido">Transferido</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <input accept="image/*" style={{ display: 'none' }} id="add-foto-upload" type="file"
                onChange={(e) => { if (e.target.files && e.target.files[0]) { setNovaFoto(e.target.files[0]); } }}
              />
              <label htmlFor="add-foto-upload">
                <Button variant="outlined" component="span">Selecionar Foto</Button>
              </label>
              {novaFoto && <Typography sx={{ ml: 2 }}>{novaFoto.name}</Typography>}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancelar</Button>
          <Button onClick={handleSalvarMembro} variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE EDIÇÃO */}
      <Dialog open={isEditModalOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Informações do Membro</DialogTitle>
        <DialogContent>
          {membroParaEditar && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField name="nome" label="Nome Completo" value={membroParaEditar.nome} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="endereco" label="Endereço" value={membroParaEditar.endereco} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField name="numero" label="Número" value={membroParaEditar.numero} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="complemento" label="Complemento" value={membroParaEditar.complemento} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="bairro" label="Bairro" value={membroParaEditar.bairro} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="cidade" label="Cidade" value={membroParaEditar.cidade} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField name="estado" label="Estado (UF)" select value={membroParaEditar.estado} onChange={handleChange} fullWidth>
                  {estadoOptions.map((estado) => (
                    <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="cep" label="CEP" value={membroParaEditar.cep} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="rg" label="RG" value={membroParaEditar.rg} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="cpf" label="CPF" value={membroParaEditar.cpf} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="dataNascimento" label="Data de Nascimento" type="date" value={membroParaEditar.dataNascimento} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="estadoCivil" label="Estado Civil" select value={membroParaEditar.estadoCivil} onChange={handleChange} fullWidth>
                  <MenuItem value="Solteiro">Solteiro</MenuItem>
                  <MenuItem value="Casado">Casado</MenuItem>
                  <MenuItem value="Divorciado">Divorciado</MenuItem>
                  <MenuItem value="Viúvo">Viúvo</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="tel" label="Telefone Fixo" value={membroParaEditar.tel} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="celular" label="Celular" value={membroParaEditar.celular} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField name="filiacaoMae" label="Filiação (Mãe)" value={membroParaEditar.filiacaoMae} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField name="filiacaoPai" label="Filiação (Pai)" value={membroParaEditar.filiacaoPai} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="congregacao" label="Congregação" select value={membroParaEditar.congregacao} onChange={handleChange} fullWidth>
                  {congregacaoOptions.map((cong) => (
                    <MenuItem key={cong} value={cong}>{cong}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="cargo" label="Cargo" select value={membroParaEditar.cargo} onChange={handleChange} fullWidth>
                  {cargoOptions.map((cargo) => (
                    <MenuItem key={cargo} value={cargo}>{cargo}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormLabel component="legend">Batizado no Espírito Santo?</FormLabel>
                <RadioGroup row name="batizadoEspiritoSanto" value={membroParaEditar.batizadoEspiritoSanto} onChange={handleChange}>
                  <FormControlLabel value="Sim" control={<Radio />} label="Sim" />
                  <FormControlLabel value="Nao" control={<Radio />} label="Não" />
                </RadioGroup>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="batismoAguasData" label="Data do Batismo nas Águas" type="date" value={membroParaEditar.batismoAguasData} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="recebidoMinisterioData" label="Data de Recepção no Ministério" type="date" value={membroParaEditar.recebidoMinisterioData} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="status" label="Status" select value={membroParaEditar.status} onChange={handleChange} fullWidth>
                  <MenuItem value="Ativo">Ativo</MenuItem>
                  <MenuItem value="Inativo">Inativo</MenuItem>
                  <MenuItem value="Transferido">Transferido</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <input accept="image/*" style={{ display: 'none' }} id="edit-foto-upload" type="file"
                  onChange={(e) => { if (e.target.files && e.target.files[0]) { setFotoParaEditar(e.target.files[0]); } }}
                />
                <label htmlFor="edit-foto-upload">
                  <Button variant="outlined" component="span">Selecionar Nova Foto</Button>
                </label>
                {/* LINHA "Foto atual: Ver" REMOVIDA DAQUI */}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button onClick={handleUpdateMembro} variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE VISUALIZAÇÃO */}
      <Dialog open={isViewModalOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>Ficha do Membro</DialogTitle>
        <DialogContent>
          {membroSelecionado && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                {membroSelecionado.foto ? (
                  <Avatar src={membroSelecionado.foto} sx={{ width: 100, height: 100, margin: '0 auto 10px auto' }} />
                ) : (
                  <Avatar sx={{ width: 100, height: 100, margin: '0 auto 10px auto' }}>{membroSelecionado.nome.charAt(0)}</Avatar>
                )}
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>{membroSelecionado.nome}</Typography>
                <Typography variant="subtitle1" color="text.secondary">{membroSelecionado.cargo} - {membroSelecionado.congregacao}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {/* Campos principais para visualização no modal */}
                <DetalheCampo label="Nome Completo" value={membroSelecionado.nome} /> 
                <DetalheCampo label="Endereço" value={`${membroSelecionado.endereco}, ${membroSelecionado.numero} ${membroSelecionado.complemento ? `(${membroSelecionado.complemento})` : ''}`} />
                <DetalheCampo label="Bairro" value={membroSelecionado.bairro} />
                <DetalheCampo label="Cidade/Estado" value={`${membroSelecionado.cidade} - ${membroSelecionado.estado}`} />
                <DetalheCampo label="CEP" value={membroSelecionado.cep} />
                <DetalheCampo label="RG" value={membroSelecionado.rg} />
                <DetalheCampo label="CPF" value={membroSelecionado.cpf} />
                <DetalheCampo label="Data de Nascimento" value={formatDateToDDMMYYYY(membroSelecionado.dataNascimento)} />
                <DetalheCampo label="Estado Civil" value={membroSelecionado.estadoCivil} />
                <DetalheCampo label="Telefone" value={membroSelecionado.tel} />
                <DetalheCampo label="Celular" value={membroSelecionado.celular} />
                <DetalheCampo label="Filiação Mãe" value={membroSelecionado.filiacaoMae} />
                <DetalheCampo label="Filiação Pai" value={membroSelecionado.filiacaoPai} />
                <DetalheCampo label="Batizado Espírito Santo" value={membroSelecionado.batizadoEspiritoSanto} />
                <DetalheCampo label="Data Batismo Águas" value={formatDateToDDMMYYYY(membroSelecionado.batismoAguasData)} />
                <DetalheCampo label="Recebido Ministério" value={formatDateToDDMMYYYY(membroSelecionado.recebidoMinisterioData)} />
                <DetalheCampo label="Status" value={membroSelecionado.status} />
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleViewClose}>Fechar</Button>
          {/* BOTÃO DE IMPRIMIR REMOVIDO DAQUI */}
        </DialogActions>
      </Dialog>

      {/* MODAL DE DELEÇÃO */}
      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir o membro "{membroSelecionado?.nome}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
          <Button onClick={handleDeleteMembro} variant="contained" color="error" disabled={isSubmitting}>{isSubmitting ? 'Excluindo...' : 'Excluir'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}