import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { numero: string } }
) {
  const numero = params.numero;
  const externalApiUrl = `https://api-hinos.onrender.com/harpa/${numero}`;

  try {
    const response = await fetch(externalApiUrl, {
      // Forçar o recarregamento dos dados e não usar o cache
      cache: 'no-store' 
    });

    if (!response.ok) {
      // Se a API externa der erro, nós repassamos o erro
      return NextResponse.json({ error: 'Falha ao buscar o hino na API externa' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro de CORS ou de rede:', error);
    return NextResponse.json({ error: 'Erro interno ao conectar com a API de hinos' }, { status: 500 });
  }
}