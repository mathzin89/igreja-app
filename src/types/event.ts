// src/types/event.ts
export interface ChurchEvent {
  id: string; // ou number, dependendo do seu banco de dados
  titulo: string;
  data: Date; // Usar o tipo Date é ideal para ordenação
  descricao: string;
  local: string;
  imageUrl: string; // Um campo para a imagem do evento
}