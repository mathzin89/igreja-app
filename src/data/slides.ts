// src/data/slides.ts

export interface Slide {
  id: string;
  title?: string;
  imageUrl?: string;
  text?: string;
}

export const mockSlides: Slide[] = [
  {
    id: "Abertura Principal",
    // title: "Abertura Principal", // <--- REMOVA OU COMENTE ESTA LINHA
    imageUrl: "/slides-pre-prontos/A-Principal.png",
    // text: "Slide de Abertura Principal" // <--- REMOVA OU COMENTE ESTA LINHA
  },
  {
    id: "culto-ceia",
    title: "Culto-Ceia",
    imageUrl: "/slides-pre-prontos/Culto-Ceia.jpg",
    text: "Slide do Culto da Ceia"
  },
  {
    id: "culto-familia",
    title: "Culto-Família",
    imageUrl: "/slides-pre-prontos/Culto-Familia.jpg",
    text: "Slide do Culto da Família"
  },
  {
    id: "culto-irmas",
    title: "Culto-Irmãs",
    imageUrl: "/slides-pre-prontos/Culto-Irmãs.jpg",
    text: "Slide do Culto dos Irmãs"
  },
  {
    id: "culto-missoes",
    title: "Culto-Missões",
    imageUrl: "/slides-pre-prontos/Culto-Missoes.jpg",
    text: "Slide do Culto de Missões"
  },
  {
    id: "pix-dizimo",
    title: "Pix-Dízimo",
    imageUrl: "/slides-pre-prontos/Pix-Dizimo.jpg",
    text: "Slide de Oferta e Dízimos via Pix"
  },
  {
    id: "avisos-gerais",
    title: "Avisos Importantes",
    text:
      "• Reunião de oração: Quartas, 19h30\n• Estudo Bíblico: Sextas, 20h\n• Culto de Jovens: Próximo Sábado"
  }
];

export function getAllSlides(): Slide[] {
  return mockSlides;
}