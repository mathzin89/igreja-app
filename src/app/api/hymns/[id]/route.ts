import { NextResponse } from 'next/server';
import { getHymnById } from '@/lib/harpa';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Espera o parâmetro `params` ser resolvido
  const { id } = await context.params;
  const hymnId = Number(id);

  // Validação para garantir que o ID é um número válido
  if (isNaN(hymnId)) {
    return NextResponse.json({ error: 'ID do hino deve ser um número.' }, { status: 400 });
  }

  try {
    const hymn = await getHymnById(hymnId);

    if (hymn) {
      return NextResponse.json(hymn, { status: 200 });
    } else {
      return NextResponse.json({ error: `Hino de número ${hymnId} não encontrado.` }, { status: 404 });
    }
  } catch (error) {
    console.error('Erro na API /api/hymns/[id]:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
