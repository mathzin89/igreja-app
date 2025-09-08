import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { numero: string } }
) {
  const numeroString = context.params.numero;
  const numeroHino = parseInt(numeroString);

  if (isNaN(numeroHino) || numeroHino < 1 || numeroHino > 640) {
    return NextResponse.json({ error: 'Número de hino inválido.' }, { status: 400 });
  }

  // Tenta buscar da API externa
  const externalApiUrl = `https://api-hinos.onrender.com/harpa/${numeroHino}`;

  try {
    const response = await fetch(externalApiUrl, {
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      // Verifica se o hino retornado tem conteúdo real (estrofes)
      if (data && data.stanzas && data.stanzas.length > 0) {
        return NextResponse.json(data);
      } else {
        // Se a API retornou OK, mas sem conteúdo, trata como falha da API
        console.warn(`API externa retornou hino ${numeroHino} mas sem estrofes. Tentando fallback.`);
      }
    } else {
      console.error(`API externa para hino ${numeroHino} falhou com status: ${response.status}. Tentando fallback.`);
    }
  } catch (error) {
    console.error(`Erro de rede ao buscar hino ${numeroHino} da API externa. Tentando fallback:`, error);
  }

  // --- Fallback (Dados de exemplo) caso a API externa falhe ou retorne vazio ---
  console.log(`Usando dados de fallback para o hino ${numeroHino}.`);
  const fallbackHino = {
    number: numeroHino,
    title: `Hino ${numeroHino} (Fallback - Erro da API)`,
    stanzas: [
      "Este é um exemplo de estrofe.",
      "A API externa da Harpa Cristã falhou ou não encontrou este hino.",
      "Verifique a sua conexão com a internet ou tente outro número de hino.",
      "Estamos a trabalhar para resolver este problema.",
      "Glória a Deus!"
    ],
    chorus: "Aleluia! Glória ao Senhor!"
  };
  return NextResponse.json(fallbackHino);
  // --- Fim do Fallback ---
}