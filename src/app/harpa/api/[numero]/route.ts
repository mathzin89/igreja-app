import { NextRequest, NextResponse } from 'next/server';

// A assinatura da função GET foi atualizada para corresponder ao padrão do Next.js
export async function GET(
  request: NextRequest,
  { params }: { params: { numero: string } }
) {
  const numero = params.numero;
  const externalApiUrl = `https://api-hinos.onrender.com/harpa/${numero}`;

  try {
    const response = await fetch(externalApiUrl, {
      cache: 'no-store' 
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Falha ao buscar o hino na API externa' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro de CORS ou de rede:', error);
    return NextResponse.json({ error: 'Erro interno ao conectar com a API de hinos' }, { status: 500 });
  }
}