// src/types/evento.ts

export interface Evento {
    id?: string; // O ID virá do Firebase depois
    title: string; // O Big Calendar exige que se chame 'title'
    start: Date;   // Data de inicio
    end: Date;     // Data de fim
    descricao?: string; // Opcional
    allDay?: boolean; // Se dura o dia todo
}