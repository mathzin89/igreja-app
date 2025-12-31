import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises'; // Importa mkdir
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Para gerar nomes de arquivo únicos

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo de imagem encontrado.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalFilename = file.name;
    const fileExtension = path.extname(originalFilename); // Pega a extensão original
    const uniqueFilename = `${uuidv4()}${fileExtension}`; // Gera um nome único com a extensão

    // Define o diretório de upload dentro da pasta 'public'
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Garante que o diretório de upload exista
    await mkdir(uploadDir, { recursive: true });

    // Salva o arquivo no diretório público
    await writeFile(path.join(uploadDir, uniqueFilename), buffer);

    // Retorna a URL pública do arquivo. Esta URL será acessível diretamente pelo navegador.
    const imageUrl = `/uploads/${uniqueFilename}`;
    
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Erro ao processar upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao fazer upload.' }, { status: 500 });
  }
}