"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { AuthProvider } from '@/firebase/AuthContext'; // Caminho correto, relativo à pasta
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/config";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  MenuItem,
  Divider,
} from "@mui/material";

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

const estadoInicialFormulario: Membro = {
  nome: "",
  foto: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  rg: "",
  cpf: "",
  dataNascimento: "",
  estadoCivil: "",
  tel: "",
  celular: "",
  congregacao: "Sede",
  filiacaoMae: "",
  filiacaoPai: "",
  batizadoEspiritoSanto: "Nao",
  batismoAguasData: "",
  cargo: "",
  recebidoMinisterioData: "",
  status: "Ativo",
};

const DetalheCampo = ({ label, value }: { label: string; value?: string }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label.toUpperCase()}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || "Não informado"}
      </Typography>
    </Box>
  </Grid>
);

export default function PaginaMembros() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
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
        id: doc.id,
        ...(doc.data() as Omit<Membro, "id">),
      })) as Membro[];
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

  const handleAddClickOpen = () => {
    setNovoMembro(estadoInicialFormulario);
    setNovaFoto(null);
    setAddModalOpen(true);
  };
  const handleAddClose = () => setAddModalOpen(false);

  const handleViewClickOpen = (membro: Membro) => {
    setMembroSelecionado(membro);
    setViewModalOpen(true);
  };
  const handleViewClose = () => {
    setViewModalOpen(false);
    setMembroSelecionado(null);
  };

  const handleEditClickOpen = (membro: Membro) => {
    setMembroParaEditar(membro);
    setFotoParaEditar(null);
    setEditModalOpen(true);
  };
  const handleEditClose = () => {
    setEditModalOpen(false);
    setMembroParaEditar(null);
  };

  const handleOpenDeleteModal = (membro: Membro) => {
    setMembroSelecionado(membro);
    setDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setMembroSelecionado(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    if (!novoMembro.nome.trim()) {
      alert("O nome do membro é obrigatório!");
      return;
    }
    try {
      let fotoURL = "";
      if (novaFoto) {
        fotoURL = await uploadFoto(novaFoto);
      }
      const { id, ...dadosParaSalvar } = novoMembro;
      await addDoc(collection(db, "membros"), {
        ...dadosParaSalvar,
        foto: fotoURL,
      });
      alert(`Membro "${dadosParaSalvar.nome}" adicionado com sucesso!`);
      handleAddClose();
      fetchMembros();
    } catch (e) {
      console.error("Erro ao adicionar documento: ", e);
      alert("Erro ao adicionar o membro.");
    }
  };

  const handleUpdateMembro = async () => {
    if (!membroParaEditar || !membroParaEditar.nome.trim()) {
      alert("O nome do membro é obrigatório!");
      return;
    }
    try {
      let fotoURL = membroParaEditar.foto;
      if (fotoParaEditar) {
        fotoURL = await uploadFoto(fotoParaEditar);
      }
      const membroDocRef = doc(db, "membros", membroParaEditar.id!);
      const { id, ...dadosParaAtualizar } = membroParaEditar;
      await updateDoc(membroDocRef, {
        ...dadosParaAtualizar,
        foto: fotoURL,
      });
      alert(`Dados de "${dadosParaAtualizar.nome}" atualizados com sucesso!`);
      handleEditClose();
      fetchMembros();
    } catch (e) {
      console.error("Erro ao atualizar documento: ", e);
      alert("Ocorreu um erro ao atualizar os dados do membro.");
    }
  };

  const handleDeleteMembro = async () => {
    if (!membroSelecionado || !membroSelecionado.id) return;
    try {
      await deleteDoc(doc(db, "membros", membroSelecionado.id));
      alert("Membro excluído com sucesso!");
      handleCloseDeleteModal();
      fetchMembros();
    } catch (e) {
      console.error("Erro ao excluir membro: ", e);
      alert("Ocorreu um erro ao excluir o membro.");
    }
  };

  let tableContent;
  if (loading) {
    tableContent = (
      <TableRow>
        <TableCell colSpan={8} align="center">
          <CircularProgress />
        </TableCell>
      </TableRow>
    );
  } else if (membros.length === 0) {
    tableContent = (
      <TableRow>
        <TableCell colSpan={8} align="center">
          Nenhum membro encontrado.
        </TableCell>
      </TableRow>
    );
  } else {
    tableContent = membros.map((membro) => (
      <TableRow hover key={membro.id}>
        <TableCell>
          {membro.foto ? (
            <Avatar src={membro.foto} />
          ) : (
            <Avatar>{membro.nome.charAt(0)}</Avatar>
          )}
        </TableCell>
        <TableCell>{membro.nome}</TableCell>
        <TableCell>{membro.celular}</TableCell>
        <TableCell>{membro.cidade}</TableCell>
        <TableCell>{membro.congregacao}</TableCell>
        <TableCell>{membro.cargo}</TableCell>
        <TableCell>
          <Chip
            label={membro.status}
            color={membro.status === "Ativo" ? "success" : "error"}
            size="small"
          />
        </TableCell>
        <TableCell className="non-printable">
          <IconButton
            color="default"
            size="small"
            onClick={() => handleViewClickOpen(membro)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditClickOpen(membro)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleOpenDeleteModal(membro)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <Box sx={{ p: 3 }}>
      <style>{`
        @media print {
          .non-printable { display: none !important; }
          #ficha-impressao { width: 100%; page-break-after: always; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <Box
        className="non-printable"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Membros Cadastrados</Typography>
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<PrintIcon />}
            sx={{ mr: 2 }}
            onClick={() => window.print()}
          >
            Imprimir Relatório
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddClickOpen}
          >
            Adicionar Novo
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ my: 4 }}>
          {error}
        </Typography>
      )}

      {!error && (
        <Box className="printable-content">
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
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
                    <TableCell
                      sx={{ fontWeight: "bold" }}
                      className="non-printable"
                    >
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{tableContent}</TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* MODAL DE ADIÇÃO */}
      <Dialog
        open={isAddModalOpen}
        onClose={handleAddClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Adicionar Novo Membro</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={9}>
              <TextField
                name="nome"
                label="Nome Completo"
                fullWidth
                variant="outlined"
                value={novoMembro.nome}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Foto
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    setNovaFoto(e.target.files ? e.target.files[0] : null)
                  }
                />
              </Button>
              {novaFoto && (
                <Avatar
                  src={URL.createObjectURL(novaFoto)}
                  sx={{ width: 56, height: 56, mt: 1 }}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormLabel component="legend">Congregação</FormLabel>
              <RadioGroup
                row
                name="congregacao"
                value={novoMembro.congregacao}
                onChange={handleChange}
              >
                <FormControlLabel value="Sede" control={<Radio />} label="Sede" />
                <FormControlLabel value="Primeiro de Maio" control={<Radio />} label="Primeiro de Maio" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="cargo"
                label="Cargo"
                fullWidth
                variant="outlined"
                value={novoMembro.cargo}
                onChange={handleChange}
              >
                <MenuItem value="">-- Selecionar --</MenuItem>
                <MenuItem value="Cooperador">Cooperador</MenuItem>
                <MenuItem value="Diácono">Diácono</MenuItem>
                <MenuItem value="Diaconisa">Diaconisa</MenuItem>
                <MenuItem value="Missionária">Missionária</MenuItem>
                <MenuItem value="Presbítero">Presbítero</MenuItem>
                <MenuItem value="Evangelista">Evangelista</MenuItem>
                <MenuItem value="Pastor">Pastor</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="endereco"
                label="Endereço (Rua, Av.)"
                fullWidth
                variant="outlined"
                value={novoMembro.endereco}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="numero"
                label="Número"
                fullWidth
                variant="outlined"
                value={novoMembro.numero}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="complemento"
                label="Complemento"
                fullWidth
                variant="outlined"
                value={novoMembro.complemento}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="bairro"
                label="Bairro"
                fullWidth
                variant="outlined"
                value={novoMembro.bairro}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="cidade"
                label="Cidade"
                fullWidth
                variant="outlined"
                value={novoMembro.cidade}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                name="estado"
                label="Estado"
                fullWidth
                variant="outlined"
                value={novoMembro.estado}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                name="cep"
                label="CEP"
                fullWidth
                variant="outlined"
                value={novoMembro.cep}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="rg"
                label="RG"
                fullWidth
                variant="outlined"
                value={novoMembro.rg}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="cpf"
                label="CPF"
                fullWidth
                variant="outlined"
                value={novoMembro.cpf}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="dataNascimento"
                label="Data de Nascimento"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={novoMembro.dataNascimento}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="estadoCivil"
                label="Estado Civil"
                fullWidth
                variant="outlined"
                value={novoMembro.estadoCivil}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="tel"
                label="Telefone Fixo"
                fullWidth
                variant="outlined"
                value={novoMembro.tel}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="celular"
                label="Celular"
                fullWidth
                variant="outlined"
                value={novoMembro.celular}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Filiação
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="filiacaoMae"
                label="Nome da Mãe"
                fullWidth
                variant="outlined"
                value={novoMembro.filiacaoMae}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="filiacaoPai"
                label="Nome do Pai"
                fullWidth
                variant="outlined"
                value={novoMembro.filiacaoPai}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Dados Ministeriais
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormLabel component="legend">
                Batizado no Espírito Santo?
              </FormLabel>
              <RadioGroup
                row
                name="batizadoEspiritoSanto"
                value={novoMembro.batizadoEspiritoSanto}
                onChange={handleChange}
              >
                <FormControlLabel value="Sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="Nao" control={<Radio />} label="Não" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="batismoAguasData"
                label="Data do Batismo nas Águas"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={novoMembro.batismoAguasData}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="recebidoMinisterioData"
                label="Recebido no Ministério em"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={novoMembro.recebidoMinisterioData}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="status"
                label="Status"
                fullWidth
                variant="outlined"
                value={novoMembro.status}
                onChange={handleChange}
              >
                <MenuItem value="Ativo">Ativo</MenuItem>
                <MenuItem value="Inativo">Inativo</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancelar</Button>
          <Button onClick={handleSalvarMembro} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE EDIÇÃO */}
      <Dialog
        open={isEditModalOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Informações do Membro</DialogTitle>
        <DialogContent>
          {membroParaEditar && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={9}>
                <TextField
                  name="nome"
                  label="Nome Completo"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.nome}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button variant="outlined" component="label" fullWidth>
                  Alterar Foto
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      setFotoParaEditar(
                        e.target.files ? e.target.files[0] : null
                      )
                    }
                  />
                </Button>
                {(fotoParaEditar || membroParaEditar.foto) && (
                  <Avatar
                    src={
                      fotoParaEditar
                        ? URL.createObjectURL(fotoParaEditar)
                        : membroParaEditar.foto
                    }
                    sx={{ width: 56, height: 56, mt: 1 }}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormLabel component="legend">Congregação</FormLabel>
                <RadioGroup
                  row
                  name="congregacao"
                  value={membroParaEditar.congregacao}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Sede" control={<Radio />} label="Sede" />
                  <FormControlLabel value="Primeiro de Maio" control={<Radio />} label="Primeiro de Maio" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="cargo"
                  label="Cargo"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.cargo}
                  onChange={handleChange}
                >
                  <MenuItem value="">-- Selecionar --</MenuItem>
                  <MenuItem value="Cooperador">Cooperador</MenuItem>
                  <MenuItem value="Diácono">Diácono</MenuItem>
                  <MenuItem value="Diaconisa">Diaconisa</MenuItem>
                  <MenuItem value="Missionária">Missionária</MenuItem>
                  <MenuItem value="Presbítero">Presbítero</MenuItem>
                  <MenuItem value="Evangelista">Evangelista</MenuItem>
                  <MenuItem value="Pastor">Pastor</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="endereco"
                  label="Endereço (Rua, Av.)"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.endereco}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="numero"
                  label="Número"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.numero}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="complemento"
                  label="Complemento"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.complemento}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="bairro"
                  label="Bairro"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.bairro}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="cidade"
                  label="Cidade"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.cidade}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  name="estado"
                  label="Estado"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.estado}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  name="cep"
                  label="CEP"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.cep}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="rg"
                  label="RG"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.rg}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="cpf"
                  label="CPF"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.cpf}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="dataNascimento"
                  label="Data de Nascimento"
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={membroParaEditar.dataNascimento}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="estadoCivil"
                  label="Estado Civil"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.estadoCivil}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="tel"
                  label="Telefone Fixo"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.tel}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="celular"
                  label="Celular"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.celular}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Filiação
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="filiacaoMae"
                  label="Nome da Mãe"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.filiacaoMae}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="filiacaoPai"
                  label="Nome do Pai"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.filiacaoPai}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Dados Ministeriais
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormLabel component="legend">
                  Batizado no Espírito Santo?
                </FormLabel>
                <RadioGroup
                  row
                  name="batizadoEspiritoSanto"
                  value={membroParaEditar.batizadoEspiritoSanto}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Sim" control={<Radio />} label="Sim" />
                  <FormControlLabel value="Nao" control={<Radio />} label="Não" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="batismoAguasData"
                  label="Data do Batismo nas Águas"
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={membroParaEditar.batismoAguasData}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="recebidoMinisterioData"
                  label="Recebido no Ministério em"
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={membroParaEditar.recebidoMinisterioData}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="status"
                  label="Status"
                  fullWidth
                  variant="outlined"
                  value={membroParaEditar.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Ativo">Ativo</MenuItem>
                  <MenuItem value="Inativo">Inativo</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button onClick={handleUpdateMembro} variant="contained">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE VISUALIZAÇÃO */}
      <Dialog
        open={isViewModalOpen}
        onClose={handleViewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Ficha do Membro</span>
            <Box>
              {membroSelecionado && (
                <IconButton
                  onClick={() => handleEditClickOpen(membroSelecionado)}
                  className="non-printable"
                >
                  <EditIcon />
                </IconButton>
              )}
              <IconButton onClick={() => window.print()}>
                <PrintIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {membroSelecionado && (
            <div id="ficha-impressao">
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <img
                  src="/logo-plenitude.png"
                  alt="Assembleia de Deus Plenitude"
                  style={{ maxWidth: "120px", marginBottom: "10px" }}
                />
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Assembleia de Deus Plenitude
                </Typography>
                <Typography variant="h6" sx={{ fontStyle: "italic" }}>
                  {membroSelecionado.nome}
                </Typography>
              </Box>

              <Grid container spacing={1}>
                <DetalheCampo label="Endereço" value={`${membroSelecionado.endereco}, ${membroSelecionado.numero}`} />
                <DetalheCampo label="Complemento" value={membroSelecionado.complemento} />
                <DetalheCampo label="Bairro" value={membroSelecionado.bairro} />
                <DetalheCampo label="Cidade / Estado" value={`${membroSelecionado.cidade} – ${membroSelecionado.estado}`} />
                <DetalheCampo label="CEP" value={membroSelecionado.cep} />
                <DetalheCampo label="RG" value={membroSelecionado.rg} />
                <DetalheCampo label="CPF" value={membroSelecionado.cpf} />
                <DetalheCampo label="Data de Nascimento" value={membroSelecionado.dataNascimento} />
                <DetalheCampo label="Estado Civil" value={membroSelecionado.estadoCivil} />
                <DetalheCampo label="Telefone" value={membroSelecionado.tel} />
                <DetalheCampo label="Celular" value={membroSelecionado.celular} />
                <DetalheCampo label="Congregação" value={membroSelecionado.congregacao} />
                <DetalheCampo label="Cargo" value={membroSelecionado.cargo} />
                <DetalheCampo label="Status" value={membroSelecionado.status} />
                <DetalheCampo label="Filiação (Mãe)" value={membroSelecionado.filiacaoMae} />
                <DetalheCampo label="Filiação (Pai)" value={membroSelecionado.filiacaoPai} />
                <DetalheCampo label="Batizado no Espírito Santo?" value={membroSelecionado.batizadoEspiritoSanto} />
                <DetalheCampo label="Data do Batismo nas Águas" value={membroSelecionado.batismoAguasData} />
                <DetalheCampo label="Recebido no Ministério em" value={membroSelecionado.recebidoMinisterioData} />
              </Grid>
            </div>
          )}
        </DialogContent>
        <DialogActions className="non-printable">
          <Button onClick={handleViewClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {membroSelecionado && (
        <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja excluir o membro "{membroSelecionado.nome}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
            <Button onClick={handleDeleteMembro} variant="contained" color="error">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
