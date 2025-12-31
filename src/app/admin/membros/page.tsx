"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import jsPDF from 'jspdf';
import { getLocalFilesAsBase64 } from '../actions';

// Imports do Material-UI
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Avatar, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField,
    FormLabel, RadioGroup, FormControlLabel, Radio, IconButton, MenuItem, Divider,
    Alert, FormControl, InputLabel, Select, SelectChangeEvent
} from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";

// Interfaces
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
    igrejaId: string; // ✅ Campo padronizado para o ID
    filiacaoMae: string;
    filiacaoPai: string;
    batizadoEspiritoSanto: string;
    batismoAguasData: string;
    cargo: string;
    recebidoMinisterioData: string;
    status: string;
    convencao: string;
    convencionado: string;
}

interface Igreja {
    id: string;
    nome: string;
}

const estadoInicialFormulario: Omit<Membro, 'id'> = {
    nome: "", foto: "", endereco: "", numero: "", complemento: "", bairro: "",
    cidade: "", estado: "", cep: "", rg: "", cpf: "", dataNascimento: "",
    estadoCivil: "", tel: "", celular: "", congregacao: "Sede", igrejaId: "sede", // ✅ Campo padronizado
    filiacaoMae: "", filiacaoPai: "",
    batizadoEspiritoSanto: "Nao", batismoAguasData: "", cargo: "Membro", recebidoMinisterioData: "",
    status: "Ativo", convencao: "",
    convencionado: "Não"
};

const cargoOptions = ["Membro","Cooperador", "Diácono", "Diaconisa", "Missionária", "Presbítero", "Evangelista", "Pastor","Pastor Presidente"];
const estadoOptions = ["SP","PR"];

const DetalheCampo = ({ label, value }: { label: string; value?: string }) => (
    <Grid item xs={12} sm={6}>
        <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">{label.toUpperCase()}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{value || "Não informado"}</Typography>
        </Box>
    </Grid>
);

const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateString;
};

const formatDateToDDMMYYYY = (dateString: string | undefined): string => {
    if (!dateString) return "Não informado";
    try {
        const date = new Date(dateString + "T00:00:00");
        if (isNaN(date.getTime())) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const d = parseInt(parts[0]);
                const m = parseInt(parts[1]) - 1;
                const y = parseInt(parts[2]);
                const fallbackDate = new Date(y, m, d);
                if (!isNaN(fallbackDate.getTime())) return `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;
            }
            return dateString;
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Grid item xs={12} sx={{ pt: 4, mb: 1 }}>
        <Typography variant="overline" color="text.secondary">
            {children}
        </Typography>
        <Divider />
    </Grid>
);

export default function PaginaMembros() {
    const [membros, setMembros] = useState<Membro[]>([]);
    const [membrosFiltrados, setMembrosFiltrados] = useState<Membro[]>([]);
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
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroCongregacao, setFiltroCongregacao] = useState('Todas');
    const [igrejas, setIgrejas] = useState<Igreja[]>([]);
    
    useEffect(() => {
        const fetchIgrejas = async () => {
            const igrejasSnapshot = await getDocs(query(collection(db, "igrejas"), orderBy("nome")));
            setIgrejas(igrejasSnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })) as Igreja[]);
        };
        fetchIgrejas();
    }, []);

    const fetchMembros = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const membrosCollection = collection(db, "membros");
            const q = query(membrosCollection, orderBy("nome", "asc"));
            const querySnapshot = await getDocs(q);
            
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

    useEffect(() => {
        let dadosFiltrados = [...membros];
        if (filtroCongregacao !== 'Todas') {
            dadosFiltrados = dadosFiltrados.filter(m => m.igrejaId === filtroCongregacao);
        }
        if (filtroNome) {
            dadosFiltrados = dadosFiltrados.filter(m =>
                m.nome.toLowerCase().includes(filtroNome.toLowerCase())
            );
        }
        setMembrosFiltrados(dadosFiltrados);
    }, [filtroNome, filtroCongregacao, membros]);
    
    const handleAddClickOpen = () => { setNovoMembro(estadoInicialFormulario); setNovaFoto(null); setAddModalOpen(true); };
    const handleAddClose = () => setAddModalOpen(false);
    const handleViewClickOpen = (membro: Membro) => { setMembroSelecionado(membro); setViewModalOpen(true); };
    const handleViewClose = () => { setViewModalOpen(false); setMembroSelecionado(null); };
    const handleEditClickOpen = (membro: Membro) => {
        setMembroParaEditar({
            ...membro,
            dataNascimento: formatDateForInput(membro.dataNascimento),
            batismoAguasData: formatDateForInput(membro.batismoAguasData),
            recebidoMinisterioData: formatDateForInput(membro.recebidoMinisterioData),
        });
        setFotoParaEditar(null);
        setEditModalOpen(true);
    };
    const handleEditClose = () => { setEditModalOpen(false); setMembroParaEditar(null); };
    const handleOpenDeleteModal = (membro: Membro) => { setMembroSelecionado(membro); setDeleteModalOpen(true); };
    const handleCloseDeleteModal = () => { setDeleteModalOpen(false); setMembroSelecionado(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const name = e.target.name;
        const value = e.target.value;
        if (!name) return;
        
        const updatedState = { [name]: value };

        if (name === 'igrejaId') {
            const igrejaSelecionada = igrejas.find(i => i.id === value);
            if (igrejaSelecionada) {
                updatedState['congregacao'] = igrejaSelecionada.nome;
            }
        }
        
        if (isEditModalOpen && membroParaEditar) {
            setMembroParaEditar((prev) => ({ ...prev!, ...updatedState }));
        } else {
            setNovoMembro((prev) => ({ ...prev, ...updatedState }));
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
            const membroToSave = {
                ...novoMembro,
                foto: fotoURL,
                dataNascimento: formatDateToDDMMYYYY(novoMembro.dataNascimento),
                batismoAguasData: formatDateToDDMMYYYY(novoMembro.batismoAguasData),
                recebidoMinisterioData: formatDateToDDMMYYYY(novoMembro.recebidoMinisterioData),
            };
            await addDoc(collection(db, "membros"), membroToSave);
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
            const membroToUpdate = {
                ...membroParaEditar,
                foto: fotoURL,
                dataNascimento: formatDateToDDMMYYYY(membroParaEditar.dataNascimento),
                batismoAguasData: formatDateToDDMMYYYY(membroParaEditar.batismoAguasData),
                recebidoMinisterioData: formatDateToDDMMYYYY(membroParaEditar.recebidoMinisterioData),
            };
            const membroDocRef = doc(db, "membros", membroParaEditar.id!);
            const { id, ...dadosParaAtualizar } = membroToUpdate;
            await updateDoc(membroDocRef, dadosParaAtualizar);
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
    const generateMemberFichaPdf = async (membro: Membro | null) => {
        if (!membro) { return; }
        setIsSubmitting(true);
        let templateBase64 = ''; 
        let logoBase64 = '';
        try {
            const result = await getLocalFilesAsBase64(['Ficha.jpg', 'logo-plenitude.png']);
            if (result.success && result.images) {
                templateBase64 = result.images[0];
                logoBase64 = result.images[1];
            } else {
                throw new Error(result.message || "Falha ao buscar imagens no servidor.");
            }
        } catch (error) { 
            console.error("Erro ao carregar imagens para o PDF:", error); 
        }

        const docPDF = new jsPDF('p', 'pt', 'a4'); 
        const pageWidth = docPDF.internal.pageSize.getWidth(); 
        const pageHeight = docPDF.internal.pageSize.getHeight(); 
        const margin = 40; 
        let currentY = margin;
        
        const addPageTemplateAndWatermark = () => {
            if (templateBase64) { docPDF.addImage(templateBase64, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'NONE'); }
            if (logoBase64) { 
                const watermarkWidth = 300; 
                const watermarkHeight = (watermarkWidth / 45) * 30; 
                const watermarkX = (pageWidth - watermarkWidth) / 2; 
                const watermarkY = (pageHeight - watermarkHeight) / 2; 
                (docPDF as any).setGState(new (docPDF as any).GState({ opacity: 0.30 })); 
                docPDF.addImage(logoBase64, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight, undefined, 'NONE'); 
                (docPDF as any).setGState(new (docPDF as any).GState({ opacity: 1 })); 
            }
        };

        addPageTemplateAndWatermark();
        currentY = 170; 
        docPDF.setFontSize(16); 
        docPDF.setFont('helvetica', 'bold'); 
        docPDF.setTextColor(0, 0, 0); 
        docPDF.text(membro.nome || 'Nome do Membro', pageWidth / 2, currentY, { align: 'center' }); 
        currentY += 40;
        
        docPDF.setFontSize(12); 
        docPDF.setTextColor(0, 0, 0); 
        const startX = margin + 10; 
        const lineHeight = 18; 
        const sectionTitleSpacing = 25;
        
        const addSectionTitle = (title: string) => { 
            if (currentY + 50 > pageHeight - margin - 30) { 
                docPDF.addPage(); 
                addPageTemplateAndWatermark(); 
                currentY = margin + 20; 
            } 
            docPDF.setFontSize(14); 
            docPDF.setFont('helvetica', 'bold'); 
            docPDF.text(title, startX, currentY); 
            docPDF.line(startX, currentY + 3, pageWidth - margin, currentY + 3); 
            currentY += sectionTitleSpacing; 
            docPDF.setFontSize(12); 
            docPDF.setFont('helvetica', 'normal'); 
        };

        const addField = (label: string, value: string) => { 
            if (currentY + lineHeight > pageHeight - margin - 30) { 
                docPDF.addPage(); 
                addPageTemplateAndWatermark(); 
                currentY = margin + 20; 
            } 
            docPDF.text(`${label}: ${value || "Não informado"}`, startX, currentY); 
            currentY += lineHeight; 
        };

        addSectionTitle("Endereço"); 
        addField("Endereço", membro.endereco); 
        addField("Número", membro.numero); 
        if (membro.complemento) addField("Complemento", membro.complemento); 
        addField("Bairro", membro.bairro); 
        addField("Cidade", membro.cidade); 
        addField("Estado", membro.estado); 
        addField("CEP", membro.cep); 
        currentY += 15;
        
        addSectionTitle("Dados Pessoais"); 
        addField("RG", membro.rg); 
        addField("CPF", membro.cpf); 
        addField("Data de Nascimento", formatDateToDDMMYYYY(membro.dataNascimento)); 
        addField("Estado Civil", membro.estadoCivil); 
        addField("Nome da Mãe", membro.filiacaoMae); 
        addField("Nome do Pai", membro.filiacaoPai); 
        currentY += 15;
        
        addSectionTitle("Contato"); 
        addField("Telefone Fixo", membro.tel); 
        addField("Celular", membro.celular); 
        currentY += 15;
        
        addSectionTitle("Informações Ministeriais"); 
        addField("Congregação", membro.congregacao); 
        addField("Cargo", membro.cargo); 
        addField("Status", membro.status); 
        addField("Convencionado?", membro.convencionado); 
        addField("Batizado no Espírito Santo?", membro.batizadoEspiritoSanto); 
        addField("Data do Batismo nas Águas", formatDateToDDMMYYYY(membro.batismoAguasData)); 
        addField("Recebido no Ministério em", formatDateToDDMMYYYY(membro.recebidoMinisterioData)); 
        currentY += 15;
        
        let footerAddress = ""; 
        if (membro.congregacao === "Sede") footerAddress = "Sede: R. Tauro, 70 - Jd. Novo Horizonte - Carapicuíba - SP"; 
        else if (membro.congregacao === "1° de Maio") footerAddress = "R. Nelson Mandela, 143 - Jd. 1º de maio - Osasco"; 
        else footerAddress = "Endereço da Congregação não definido.";
        
        docPDF.setFontSize(10); 
        docPDF.setFont('helvetica', 'normal'); 
        docPDF.setTextColor(0, 0, 0); 
        docPDF.text(footerAddress, pageWidth / 2, pageHeight - 30, { align: 'center' });
        
        docPDF.save(`Ficha - ${membro.nome}.pdf`);
        setIsSubmitting(false);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Membros Cadastrados</Typography>
                <Button variant="contained" color="primary" onClick={handleAddClickOpen}>Adicionar Novo</Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
                <TextField label="Buscar por nome" variant="outlined" fullWidth value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
                <FormControl variant="outlined" sx={{ minWidth: 220 }}>
                    <InputLabel>Filtrar por Congregação</InputLabel>
                    <Select name="filtroCongregacao" label="Filtrar por Congregação" value={filtroCongregacao} onChange={(e) => setFiltroCongregacao(e.target.value)}>
                        <MenuItem value="Todas"><em>Todas</em></MenuItem>
                        {igrejas.map(ig => <MenuItem key={ig.id} value={ig.id}>{ig.nome}</MenuItem>)}
                    </Select>
                </FormControl>
            </Paper>

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
                                ) : membrosFiltrados.map((membro) => (
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

            <Dialog open={isAddModalOpen} onClose={handleAddClose} maxWidth="md" fullWidth>
                <DialogTitle>Adicionar Novo Membro</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                            <input accept="image/*" style={{ display: 'none' }} id="add-foto-upload" type="file" onChange={(e) => { if (e.target.files && e.target.files[0]) { setNovaFoto(e.target.files[0]); } }} />
                            <label htmlFor="add-foto-upload"><Button variant="outlined" component="span">Selecionar Foto</Button></label>
                            {novaFoto && <Typography sx={{ ml: 2 }}>{novaFoto.name}</Typography>}
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField name="nome" label="Nome Completo" value={novoMembro.nome} onChange={handleChange} fullWidth required variant="outlined" /></Grid>
                        
                        <SectionTitle>Endereço</SectionTitle>
                        <Grid item xs={12} sm={8}><TextField name="endereco" label="Logradouro" value={novoMembro.endereco} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={4}><TextField name="numero" label="Número" value={novoMembro.numero} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="complemento" label="Complemento" value={novoMembro.complemento} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="bairro" label="Bairro" value={novoMembro.bairro} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="cidade" label="Cidade" value={novoMembro.cidade} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth variant="outlined"><InputLabel>Estado (UF)</InputLabel><Select name="estado" label="Estado (UF)" value={novoMembro.estado} onChange={handleChange}>{estadoOptions.map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField name="cep" label="CEP" value={novoMembro.cep} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        
                        <SectionTitle>Documentos e Dados Pessoais</SectionTitle>
                        <Grid item xs={12} sm={6}><TextField name="rg" label="RG" value={novoMembro.rg} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="cpf" label="CPF" value={novoMembro.cpf} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="dataNascimento" label="Data de Nascimento" type="date" value={formatDateForInput(novoMembro.dataNascimento)} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth variant="outlined"><InputLabel>Estado Civil</InputLabel><Select name="estadoCivil" label="Estado Civil" value={novoMembro.estadoCivil} onChange={handleChange}><MenuItem value=""><em>Selecione</em></MenuItem><MenuItem value="Solteiro">Solteiro(a)</MenuItem><MenuItem value="Casado">Casado(a)</MenuItem><MenuItem value="Divorciado">Divorciado(a)</MenuItem><MenuItem value="Viúvo">Viúvo(a)</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField name="filiacaoMae" label="Filiação (Mãe)" value={novoMembro.filiacaoMae} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="filiacaoPai" label="Filiação (Pai)" value={novoMembro.filiacaoPai} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        
                        <SectionTitle>Contato</SectionTitle>
                        <Grid item xs={12} sm={6}><TextField name="tel" label="Telefone Fixo" value={novoMembro.tel} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="celular" label="Celular" value={novoMembro.celular} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                        
                        <SectionTitle>Informações Ministeriais</SectionTitle>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Congregação</InputLabel>
                                <Select name="igrejaId" label="Congregação" value={novoMembro.igrejaId} onChange={handleChange}>
                                    {igrejas.map((ig) => <MenuItem key={ig.id} value={ig.id}>{ig.nome}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth variant="outlined"><InputLabel>Cargo</InputLabel><Select name="cargo" label="Cargo" value={novoMembro.cargo} onChange={handleChange}><MenuItem value=""><em>Selecione</em></MenuItem>{cargoOptions.map((cargo) => <MenuItem key={cargo} value={cargo}>{cargo}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormLabel component="legend">Convencionado?</FormLabel><RadioGroup row name="convencionado" value={novoMembro.convencionado} onChange={handleChange}><FormControlLabel value="Sim" control={<Radio />} label="Sim" /><FormControlLabel value="Não" control={<Radio />} label="Não" /></RadioGroup></Grid>
                        <Grid item xs={12} sm={6}><FormLabel component="legend">Batizado no Espírito Santo?</FormLabel><RadioGroup row name="batizadoEspiritoSanto" value={novoMembro.batizadoEspiritoSanto} onChange={handleChange}><FormControlLabel value="Sim" control={<Radio />} label="Sim" /><FormControlLabel value="Nao" control={<Radio />} label="Não" /></RadioGroup></Grid>
                        <Grid item xs={12} sm={6}><TextField name="batismoAguasData" label="Data do Batismo nas Águas" type="date" value={formatDateForInput(novoMembro.batismoAguasData)} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="recebidoMinisterioData" label="Data de Recepção no Ministério" type="date" value={formatDateForInput(novoMembro.recebidoMinisterioData)} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth variant="outlined"><InputLabel>Status</InputLabel><Select name="status" label="Status" value={novoMembro.status} onChange={handleChange}><MenuItem value="Ativo">Ativo</MenuItem><MenuItem value="Inativo">Inativo</MenuItem><MenuItem value="Transferido">Transferido</MenuItem></Select></FormControl></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions><Button onClick={handleAddClose}>Cancelar</Button><Button onClick={handleSalvarMembro} variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button></DialogActions>
            </Dialog>

            <Dialog open={isEditModalOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
                <DialogTitle>Editar Informações do Membro</DialogTitle>
                <DialogContent dividers>{membroParaEditar && (<Grid container spacing={2} sx={{ pt: 1 }}><Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}><input accept="image/*" style={{ display: 'none' }} id="edit-foto-upload" type="file" onChange={(e) => { if (e.target.files && e.target.files[0]) { setFotoParaEditar(e.target.files[0]); } }} /><label htmlFor="edit-foto-upload"><Button variant="outlined" component="span">Selecionar Nova Foto</Button></label>{fotoParaEditar && <Typography sx={{ ml: 2 }}>{fotoParaEditar.name}</Typography>}{!fotoParaEditar && membroParaEditar.foto && (<Button sx={{ ml: 2 }} component="a" href={membroParaEditar.foto} target="_blank" rel="noopener noreferrer" startIcon={<VisibilityIcon />}>Ver Foto Atual</Button>)}</Grid><Grid item xs={12} sm={6}><TextField name="nome" label="Nome Completo" value={membroParaEditar.nome} onChange={handleChange} fullWidth required variant="outlined" /></Grid>
                <SectionTitle>Endereço</SectionTitle>
                <Grid item xs={12} sm={8}><TextField name="endereco" label="Logradouro" value={membroParaEditar.endereco} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={4}><TextField name="numero" label="Número" value={membroParaEditar.numero} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={6}><TextField name="complemento" label="Complemento" value={membroParaEditar.complemento} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={6}><TextField name="bairro" label="Bairro" value={membroParaEditar.bairro} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={6}><TextField name="cidade" label="Cidade" value={membroParaEditar.cidade} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={6}><FormControl fullWidth variant="outlined"><InputLabel>Estado (UF)</InputLabel><Select name="estado" label="Estado (UF)" value={membroParaEditar.estado} onChange={handleChange}>{estadoOptions.map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}</Select></FormControl></Grid><Grid item xs={12} sm={6}><TextField name="cep" label="CEP" value={membroParaEditar.cep} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                <SectionTitle>Documentos e Dados Pessoais</SectionTitle>
                <Grid item xs={12} sm={6}><TextField name="rg" label="RG" value={membroParaEditar.rg} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={6}><TextField name="cpf" label="CPF" value={membroParaEditar.cpf} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={6}><TextField name="dataNascimento" label="Data de Nascimento" type="date" value={membroParaEditar.dataNascimento} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} variant="outlined" /></Grid><Grid item xs={12} sm={6}><FormControl fullWidth variant="outlined"><InputLabel>Estado Civil</InputLabel><Select name="estadoCivil" label="Estado Civil" value={membroParaEditar.estadoCivil} onChange={handleChange}><MenuItem value=""><em>Selecione</em></MenuItem><MenuItem value="Solteiro">Solteiro(a)</MenuItem><MenuItem value="Casado">Casado(a)</MenuItem><MenuItem value="Divorciado">Divorciado(a)</MenuItem><MenuItem value="Viúvo">Viúvo(a)</MenuItem></Select></FormControl></Grid><Grid item xs={12} sm={6}><TextField name="filiacaoMae" label="Filiação (Mãe)" value={membroParaEditar.filiacaoMae} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={6}><TextField name="filiacaoPai" label="Filiação (Pai)" value={membroParaEditar.filiacaoPai} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                <SectionTitle>Contato</SectionTitle>
                <Grid item xs={12} sm={6}><TextField name="tel" label="Telefone Fixo" value={membroParaEditar.tel} onChange={handleChange} fullWidth variant="outlined" /></Grid><Grid item xs={12} sm={6}><TextField name="celular" label="Celular" value={membroParaEditar.celular} onChange={handleChange} fullWidth variant="outlined" /></Grid>
                <SectionTitle>Informações Ministeriais</SectionTitle>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Congregação</InputLabel>
                        <Select name="igrejaId" label="Congregação" value={membroParaEditar.igrejaId} onChange={handleChange}>
                            {igrejas.map((ig) => <MenuItem key={ig.id} value={ig.id}>{ig.nome}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}><FormControl fullWidth variant="outlined"><InputLabel>Cargo</InputLabel><Select name="cargo" label="Cargo" value={membroParaEditar.cargo} onChange={handleChange}><MenuItem value=""><em>Selecione</em></MenuItem>{cargoOptions.map((cargo) => <MenuItem key={cargo} value={cargo}>{cargo}</MenuItem>)}</Select></FormControl></Grid><Grid item xs={12} sm={6}><FormLabel component="legend">Convencionado?</FormLabel><RadioGroup row name="convencionado" value={membroParaEditar.convencionado} onChange={handleChange}><FormControlLabel value="Sim" control={<Radio />} label="Sim" /><FormControlLabel value="Não" control={<Radio />} label="Não" /></RadioGroup></Grid><Grid item xs={12} sm={6}><FormLabel component="legend">Batizado no Espírito Santo?</FormLabel><RadioGroup row name="batizadoEspiritoSanto" value={membroParaEditar.batizadoEspiritoSanto} onChange={handleChange}><FormControlLabel value="Sim" control={<Radio />} label="Sim" /><FormControlLabel value="Nao" control={<Radio />} label="Não" /></RadioGroup></Grid><Grid item xs={12} sm={6}><TextField name="batismoAguasData" label="Data do Batismo nas Águas" type="date" value={membroParaEditar.batismoAguasData} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} variant="outlined" /></Grid><Grid item xs={12} sm={6}><TextField name="recebidoMinisterioData" label="Data de Recepção no Ministério" type="date" value={membroParaEditar.recebidoMinisterioData} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} variant="outlined" /></Grid><Grid item xs={12} sm={6}><FormControl fullWidth variant="outlined"><InputLabel>Status</InputLabel><Select name="status" label="Status" value={membroParaEditar.status} onChange={handleChange}><MenuItem value="Ativo">Ativo</MenuItem><MenuItem value="Inativo">Inativo</MenuItem><MenuItem value="Transferido">Transferido</MenuItem></Select></FormControl></Grid></Grid>)}</DialogContent>
                <DialogActions><Button onClick={handleEditClose}>Cancelar</Button><Button onClick={handleUpdateMembro} variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</Button></DialogActions>
            </Dialog>

            <Dialog open={isViewModalOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
                <DialogTitle>Ficha do Membro</DialogTitle>
                <DialogContent dividers>{membroSelecionado && (<Box sx={{ pt: 2 }}><Box sx={{ textAlign: "center", mb: 3 }}>{membroSelecionado.foto ? (<Avatar src={membroSelecionado.foto} sx={{ width: 100, height: 100, margin: '0 auto 10px auto' }} />) : (<Avatar sx={{ width: 100, height: 100, margin: '0 auto 10px auto' }}>{membroSelecionado.nome.charAt(0)}</Avatar>)}<Typography variant="h5" sx={{ fontWeight: "bold" }}>{membroSelecionado.nome}</Typography><Typography variant="subtitle1" color="text.secondary">{membroSelecionado.cargo} - {membroSelecionado.congregacao}</Typography></Box><Divider sx={{ my: 2 }} /><Grid container spacing={2}><DetalheCampo label="Nome Completo" value={membroSelecionado.nome} /><DetalheCampo label="Endereço" value={`${membroSelecionado.endereco}, ${membroSelecionado.numero} ${membroSelecionado.complemento ? `(${membroSelecionado.complemento})` : ''}`} /><DetalheCampo label="Bairro" value={membroSelecionado.bairro} /><DetalheCampo label="Cidade/Estado" value={`${membroSelecionado.cidade} - ${membroSelecionado.estado}`} /><DetalheCampo label="CEP" value={membroSelecionado.cep} /><DetalheCampo label="RG" value={membroSelecionado.rg} /><DetalheCampo label="CPF" value={membroSelecionado.cpf} /><DetalheCampo label="Data de Nascimento" value={formatDateToDDMMYYYY(membroSelecionado.dataNascimento)} /><DetalheCampo label="Estado Civil" value={membroSelecionado.estadoCivil} /><DetalheCampo label="Telefone" value={membroSelecionado.tel} /><DetalheCampo label="Celular" value={membroSelecionado.celular} /><DetalheCampo label="Filiação Mãe" value={membroSelecionado.filiacaoMae} /><DetalheCampo label="Filiação Pai" value={membroSelecionado.filiacaoPai} /><DetalheCampo label="Batizado Espírito Santo" value={membroSelecionado.batizadoEspiritoSanto} /><DetalheCampo label="Data Batismo Águas" value={formatDateToDDMMYYYY(membroSelecionado.batismoAguasData)} /><DetalheCampo label="Recebido Ministério" value={formatDateToDDMMYYYY(membroSelecionado.recebidoMinisterioData)} /><DetalheCampo label="Status" value={membroSelecionado.status} /><DetalheCampo label="Convencionado" value={membroSelecionado.convencionado} /></Grid></Box>)}</DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={handleViewClose}>Fechar</Button></DialogActions>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent><Typography>Tem certeza que deseja excluir o membro "{membroSelecionado?.nome}"?</Typography></DialogContent>
                <DialogActions><Button onClick={handleCloseDeleteModal}>Cancelar</Button><Button onClick={handleDeleteMembro} variant="contained" color="error" disabled={isSubmitting}>{isSubmitting ? 'Excluindo...' : 'Excluir'}</Button></DialogActions>
            </Dialog>
        </Box>
    );
}

