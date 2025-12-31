import { NextResponse } from 'next/server';
import { getHymnByNumber } from '@/lib/harpa';
import rawHarpaJson from '@/data/harpa.json';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const hymnId = Number(id);

  if (isNaN(hymnId)) {
    return NextResponse.json({ error: 'ID do hino deve ser um número.' }, { status: 400 });
  }

  try {
    // ✅ Passa primeiro o JSON cru, depois o ID
    const hymn = getHymnByNumber(rawHarpaJson, hymnId);

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
