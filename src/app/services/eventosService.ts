// src/services/eventosService.ts

import { db } from "@/firebase/config"; // Caminho relativo para o config
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Evento } from "@/types/evento"; // Caminho relativo para o tipo

// Função para SALVAR um evento no banco
export const adicionarEvento = async (evento: Omit<Evento, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, "agenda"), {
            title: evento.title,
            start: evento.start.toISOString(), // Salva data como texto (ISO) para evitar conflitos
            end: evento.end.toISOString(),
            descricao: evento.descricao || "",
            allDay: evento.allDay || false
        });
        console.log("Evento criado com ID: ", docRef.id);
        return true;
    } catch (e) {
        console.error("Erro ao adicionar evento: ", e);
        return false;
    }
};

// Função para BUSCAR (ler) os eventos do banco
export const buscarEventos = async (): Promise<Evento[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "agenda"));
        const eventos: Evento[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            eventos.push({
                id: doc.id,
                title: data.title,
                // Converte a string do banco de volta para um objeto Date real que o calendário entende
                start: new Date(data.start), 
                end: new Date(data.end),
                descricao: data.descricao,
                allDay: data.allDay
            });
        });

        return eventos;
    } catch (e) {
        console.error("Erro ao buscar eventos: ", e);
        return [];
    }
};