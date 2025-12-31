"use client";

import React, { useState, useMemo, useEffect } from 'react'; 
import { 
    Tabs, Tab, Box, TextField, Button, Autocomplete, 
    CircularProgress, Select, MenuItem, FormControl, InputLabel, 
    Typography, IconButton,
    Card, CardActionArea, CardContent, CardMedia,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { BibleBook } from '@/lib/bible';
import { Hymn } from '@/lib/harpa';
import { PresentationContent, CustomSlide, SlideShowPresentation } from '@/types/worship-types'; 
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; 
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '@/firebase/AuthContext';

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

import { 
    setBibleContent, 
    setHymnContent, 
    saveCustomSlide,
    updateCustomSlide, 
    clearPresentation,
    deleteCustomSlide
} from '../actions';

interface WorshipPanelClientProps {
  allBooks: BibleBook[];
  allHymns: Hymn[];
  savedSlides: CustomSlide[];
  onSlideSave: () => void;
  onProject: (content: PresentationContent) => void;
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
}

export default function WorshipPanelClient({ allBooks, allHymns, savedSlides: initialSavedSlides, onSlideSave, onProject }: WorshipPanelClientProps) {
  const { userProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateSlideOpen, setIsCreateSlideOpen] = useState(false);
  
  const [editingSlide, setEditingSlide] = useState<CustomSlide | null>(null);

  const [savedSlides, setSavedSlides] = useState<CustomSlide[]>(initialSavedSlides);
  
  const [hymnNumber, setHymnNumber] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedVerse, setSelectedVerse] = useState<string>('');
  
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideContent, setNewSlideContent] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const [youtubeSearch, setYoutubeSearch] = useState('');
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setSavedSlides(initialSavedSlides);
  }, [initialSavedSlides]);

  const chapters = useMemo(() => selectedBook?.chapters || [], [selectedBook]);
  const verses = useMemo(() => {
    if (!selectedChapter) return [];
    return chapters.find(c => c.chapter === Number(selectedChapter))?.verses || [];
  }, [selectedChapter, chapters]);

  // --- Funções de Projeção (CORPO RESTAURADO) ---

  const handleProjectHymn = async () => {
    if (!hymnNumber) return;
    setIsProcessing(true);
    const slideData = await setHymnContent(hymnNumber);
    if (slideData) onProject(slideData as PresentationContent); 
    setIsProcessing(false);
  };
  
  const handleProjectBible = async () => {
    if (!selectedBook || !selectedChapter || !selectedVerse) return;
    setIsProcessing(true);
    const slideData = await setBibleContent(selectedBook, Number(selectedChapter), Number(selectedVerse));
    if (slideData) onProject(slideData as PresentationContent);
    setIsProcessing(false);
  };

  const handleProjectSavedSlide = (clickedSlide: CustomSlide) => {
    const clickedIndex = savedSlides.findIndex(s => s.id === clickedSlide.id);
    if (clickedIndex === -1) return;
    const slideShowData: SlideShowPresentation = {
      id: `slideshow-${Date.now()}`,
      type: 'slide-show',
      slides: savedSlides,
      initialIndex: clickedIndex
    };
    onProject(slideShowData);
  };
  
  const handleProjectYouTube = (video: YouTubeVideo) => {
    const slideData: PresentationContent = {
      id: `youtube-${video.id}`,
      type: 'youtube',
      videoId: video.id,
      title: video.title,
    };
    onProject(slideData);
  };

  const handleClearScreen = async () => {
      setIsProcessing(true);
      const slideData = await clearPresentation();
      if (slideData) onProject(slideData as PresentationContent);
      setIsProcessing(false);
  };
  
  const handleYouTubeSearch = async () => {
    if (!youtubeSearch.trim()) return;
    setIsSearching(true);
    setYoutubeResults([]);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(youtubeSearch)}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar vídeos');
      }
      const data: YouTubeVideo[] = await response.json();
      setYoutubeResults(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar vídeos no YouTube.");
    }
    setIsSearching(false);
  };
  
  // --- Funções de Gestão de Slides (MODIFICADAS) ---

  const handleOpenCreateSlide = () => {
    setEditingSlide(null); 
    setNewSlideTitle('');
    setNewSlideContent('');
    setUploadedImageUrl(null);
    setIsCreateSlideOpen(true);
  };

  const handleOpenEditSlide = (slide: CustomSlide) => {
    setEditingSlide(slide); 
    setNewSlideTitle(slide.title);
    setNewSlideContent(slide.content || '');
    setUploadedImageUrl(slide.imageUrl || null);
    setIsCreateSlideOpen(true); 
  };

  const handleCloseCreateSlide = () => {
    if (isProcessing) return;
    setIsCreateSlideOpen(false);
    setEditingSlide(null); 
    setNewSlideTitle('');
    setNewSlideContent('');
    setUploadedImageUrl(null);
  };
  
  const handleSaveSlide = async () => {
      if (!userProfile?.igrejaId) {
          alert("Erro: não foi possível identificar a sua congregação.");
          return;
      }
      if (!newSlideTitle.trim()) {
        alert("O título é obrigatório para criar um slide.");
        return;
      }
      setIsProcessing(true);
      
      const slidePayload = {
          title: newSlideTitle,
          type: (uploadedImageUrl ? 'imagem' : 'aviso') as 'imagem' | 'aviso',
          imageUrl: uploadedImageUrl || undefined,
          content: uploadedImageUrl ? undefined : newSlideContent,
      };

      if (editingSlide) {
        await updateCustomSlide(editingSlide.id, slidePayload);
      } else {
        await saveCustomSlide({ ...slidePayload, igrejaId: userProfile.igrejaId });
      }
      
      setIsProcessing(false);
      handleCloseCreateSlide(); 
      onSlideSave(); 
      setActiveTab(2); 
  };

  const handleDeleteSlide = async (slideId: string) => {
    const isConfirmed = window.confirm("Tem a certeza de que deseja excluir este slide?");
    if (isConfirmed) {
        setIsProcessing(true);
        await deleteCustomSlide(slideId);
        onSlideSave(); 
        setSavedSlides(prevSlides => prevSlides.filter(s => s.id !== slideId)); 
        setIsProcessing(false);
    }
  };

  return (
    <>
    <Box sx={{ width: '100%', display: 'flex', gap: 2, mt: 2 }}>
        <Box sx={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', p: 2 }}>
            
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Harpa Cristã" />
                <Tab label="Bíblia Sagrada" />
                <Tab label="Slides Salvos" />
                <Tab label="YouTube" />
            </Tabs>

            {/* Aba 0 - Harpa */}
            {activeTab === 0 && <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Número do Hino" value={hymnNumber} onChange={e => setHymnNumber(e.target.value)} type="number" />
                <Button variant="contained" onClick={handleProjectHymn} disabled={isProcessing}>{isProcessing ? <CircularProgress size={24} /> : 'Projetar Hino'}</Button>
            </Box>}

            {/* Aba 1 - Bíblia */}
            {activeTab === 1 && <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                 <Autocomplete 
                   options={allBooks} 
                   getOptionLabel={(option) => option.nome} 
                   onChange={(e, value) => { setSelectedBook(value); setSelectedChapter(''); setSelectedVerse(''); }} 
                   renderInput={(params) => <TextField {...params} label="Livro" />} 
                 />
                <FormControl fullWidth disabled={!selectedBook}>
                    <InputLabel>Capítulo</InputLabel>
                    <Select value={selectedChapter} label="Capítulo" onChange={e => { setSelectedChapter(e.target.value); setSelectedVerse(''); }}>
                        {chapters.map(c => <MenuItem key={c.chapter} value={c.chapter}>{c.chapter}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl fullWidth disabled={!selectedChapter}>
                    <InputLabel>Versículo</InputLabel>
                    <Select value={selectedVerse} label="Versículo" onChange={e => setSelectedVerse(e.target.value)}>
                        {verses.map(v => <MenuItem key={v.verse} value={v.verse}>{v.verse}</MenuItem>)}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={handleProjectBible} disabled={isProcessing || !selectedVerse}>{isProcessing ? <CircularProgress size={24} /> : 'Projetar Versículo'}</Button>
            </Box>}
            
            {/* Aba 2 - Slides Salvos */}
            {activeTab === 2 && <Box sx={{ p: 2, maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                {savedSlides.map(slide => (
                    <Card key={slide.id} sx={{ display: 'flex', mb: 1.5, backgroundColor: '#f9f9f9' }} elevation={2}>
                        <CardActionArea
                            onClick={() => handleProjectSavedSlide(slide)}
                            disabled={isProcessing}
                            sx={{ display: 'flex', justifyContent: 'flex-start', flex: 1 }}
                        >
                            <CardMedia
                                sx={{ 
                                    width: 120, height: 68, objectFit: 'cover',
                                    backgroundColor: slide.type === 'aviso' ? '#e0e0e0' : 'transparent',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    color: 'action.active'
                                }}
                                image={slide.type === 'imagem' ? slide.imageUrl : undefined} 
                            >
                                {slide.type === 'aviso' && <ImageIcon style={{ fontSize: 40 }} />}
                            </CardMedia>
                            <CardContent sx={{ flex: 1, minWidth: 0, py: 1, '&:last-child': { pb: 1 } }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={slide.title}>
                                    {slide.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {slide.type === 'imagem' ? "Slide de Imagem" : "Slide de Aviso"}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, gap: 0.5 }}>
                            <IconButton 
                                size="small" 
                                onClick={() => handleOpenEditSlide(slide)}
                                disabled={isProcessing} 
                                aria-label="edit"
                                color="primary"
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={() => handleDeleteSlide(slide.id)} 
                                disabled={isProcessing} 
                                aria-label="delete" 
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Card>
                ))}
            </Box>}

            {/* Aba 3 - YouTube */}
            {activeTab === 3 && <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                    label="Buscar no YouTube" 
                    value={youtubeSearch} 
                    onChange={e => setYoutubeSearch(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleYouTubeSearch()}
                />
                <Button variant="contained" onClick={handleYouTubeSearch} disabled={isSearching}>
                    {isSearching ? <CircularProgress size={24} /> : 'Buscar Vídeo'}
                </Button>
                
                <Box sx={{ maxHeight: 300, overflowY: 'auto', mt: 2, pr: 1 }}>
                    {isSearching && <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}><CircularProgress /></Box>}
                    {youtubeResults.map(video => (
                        <Card key={video.id} sx={{ display: 'flex', mb: 1.5, backgroundColor: '#f9f9f9' }} elevation={2}>
                            <CardActionArea onClick={() => handleProjectYouTube(video)} disabled={isProcessing} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <CardMedia component="img" sx={{ width: 120, height: 68, objectFit: 'cover' }} image={video.thumbnailUrl} alt={video.title} />
                                <CardContent sx={{ flex: 1, minWidth: 0, py: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={video.title}>
                                        {video.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {video.channelTitle}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>
            </Box>}
        </Box>
        
        {/* Barra Lateral Direita */}
        <Box sx={{ width: '200px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button variant="outlined" color="secondary" fullWidth onClick={handleClearScreen} disabled={isProcessing}>
                Limpar Ecrã
            </Button>
            <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleOpenCreateSlide} 
                disabled={isProcessing}
            >
                Criar Novo Slide
            </Button>
        </Box>
    </Box>

    {/* Pop-up (Modal) para Criar/Editar Slide */}
    <Dialog 
        open={isCreateSlideOpen} 
        onClose={handleCloseCreateSlide} 
        fullWidth
        maxWidth="sm"
    >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingSlide ? 'Editar Slide' : 'Criar Novo Slide'}
            <IconButton
                aria-label="close"
                onClick={handleCloseCreateSlide}
                sx={{ color: (theme) => theme.palette.grey[500] }}
            >
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent dividers>
            <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField 
                    label="Título do Slide" 
                    value={newSlideTitle} 
                    onChange={e => setNewSlideTitle(e.target.value)} 
                    autoFocus
                />
                <TextField 
                    label="Conteúdo (para slides de texto)" 
                    multiline 
                    rows={4} 
                    value={newSlideContent} 
                    onChange={e => setNewSlideContent(e.target.value)} 
                    disabled={!!uploadedImageUrl}
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2, border: '1px dashed grey', borderRadius: '4px' }}>
                    <Typography variant="body2">
                        {newSlideContent ? "Limpe o conteúdo para enviar imagem" : "Selecione uma imagem (opcional)"}
                    </Typography>
                    <UploadButton<OurFileRouter, "imageUploader">
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                            if(res?.[0]?.url) {
                                alert("Upload Concluído!");
                                setUploadedImageUrl(res[0].url);
                                setNewSlideContent(''); 
                            }
                        }}
                        onUploadError={(error: Error) => { alert(`ERRO! ${error.message}`); }}
                        disabled={!!newSlideContent}
                    />
                    {uploadedImageUrl && (
                        <Box sx={{mt: 2, textAlign: 'center'}}>
                            <Typography variant="caption">Pré-visualização:</Typography>
                            <img src={uploadedImageUrl} alt="Preview" style={{maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', border: '1px solid #ddd'}}/>
                            <Button size="small" color="error" onClick={() => setUploadedImageUrl(null)}>Remover Imagem</Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={handleCloseCreateSlide} color="secondary" disabled={isProcessing}>
                Cancelar
            </Button>
            <Button 
                variant="contained" 
                onClick={handleSaveSlide} 
                disabled={isProcessing}
            >
                {isProcessing ? <CircularProgress size={24} /> : (editingSlide ? 'Salvar Alterações' : 'Salvar Slide')}
            </Button>
        </DialogActions>
    </Dialog>
    </>
  );
}