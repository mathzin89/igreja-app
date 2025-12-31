import { NextRequest, NextResponse } from 'next/server';

// 1. Pegue sua chave no Google Cloud Console
// 2. Adicione ao seu arquivo .env.local: YOUTUBE_API_KEY=SUA_CHAVE_AQUI
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; 
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Termo de busca (q) é obrigatório' }, { status: 400 });
  }

  if (!YOUTUBE_API_KEY) {
    console.error("ERRO GRAVE: Chave da API do YouTube não configurada no .env.local (YOUTUBE_API_KEY)");
    return NextResponse.json({ error: 'Chave da API do YouTube não configurada no servidor' }, { status: 500 });
  }
  
  const params = new URLSearchParams({
    part: 'snippet',
    q: q,
    type: 'video',
    key: YOUTUBE_API_KEY,
    maxResults: '10',
    regionCode: 'BR',
    relevanceLanguage: 'pt'
  });

  const url = `${YOUTUBE_API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
        next: { revalidate: 3600 } // Cache de 1 hora
    });

    const data = await response.json();

    if (!response.ok) {
      // Este erro aparecerá no LOG DO SERVIDOR (seu terminal)
      console.error("Erro da API do YouTube:", data.error.message);
      throw new Error(data.error.message || 'Erro da API do YouTube');
    }

    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
    }));

    // Se tudo der certo, envia os vídeos para o frontend
    return NextResponse.json(videos);

  } catch (error: any) {
    // Este erro também aparecerá no LOG DO SERVIDOR
    console.error("Erro ao buscar no YouTube:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Opcional: Adicionar para forçar a rota a ser dinâmica
export const dynamic = 'force-dynamic';