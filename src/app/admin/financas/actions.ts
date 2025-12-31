"use server";
import fs from 'fs/promises';
import path from 'path';

/**
 * Lê ficheiros da pasta 'public' do projeto e converte-os para Base64.
 * @param fileNames Um array de nomes de ficheiros (ex: ['Ficha.jpg', 'logo-plenitude.png']).
 * @returns Um objeto com o status de sucesso e um array de strings Base64.
 */
export async function getLocalFilesAsBase64(fileNames: string[]) {
  try {
    const readPromises = fileNames.map(async (fileName) => {
      // Constrói o caminho completo para o ficheiro dentro da pasta 'public'
      const filePath = path.join(process.cwd(), 'public', fileName);
      
      // Lê o ficheiro do disco como um buffer
      const fileBuffer = await fs.readFile(filePath);
      
      // Determina o tipo de conteúdo com base na extensão do ficheiro
      const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // Converte para Base64 e formata como uma Data URL
      const base64 = fileBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    });

    const base64Images = await Promise.all(readPromises);
    return { success: true, images: base64Images };

  } catch (error: any) {
    console.error("Erro na Server Action getLocalFilesAsBase64:", error);
    return { success: false, message: error.message };
  }
}

