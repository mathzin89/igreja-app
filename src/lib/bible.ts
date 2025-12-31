// src/lib/bible.ts
// Este arquivo deve conter APENAS interfaces e metadados.

// --- Interfaces para o formato BRUTO do JSON da Bíblia (se o seu JSON usa este formato) ---
export interface RawVerseContent {
  verse: number;
  text: string;
}

export interface RawBibleBookJson { // Interface para a estrutura de um livro no seu JSON bruto
  abbrev: string;
  chapters: RawVerseContent[][]; // Array de capítulos, onde cada capítulo é um array de versículos brutos
}


// --- Interfaces para o formato PROCESSADO da Bíblia no aplicativo ---
// Estas são as interfaces que seu aplicativo vai usar para exibir os dados
export interface VerseContent {
  verse: number;
  text: string;
}

export interface ChapterContent { // ✅ Esta é a interface de capítulo que você usa
  chapter: number; // ✅ Adicione a propriedade 'chapter' aqui
  verses: VerseContent[];
}

export interface BibleBook {
  id: string;
  nome: string;
  abreviatura: string;
  testament: 'VT' | 'NT';
  chapters: ChapterContent[]; // ✅ Usa ChapterContent aqui
}

// --- Metadados para mapear abreviações brutas para nomes e IDs ---
export const bibleBookMetadata: { [key: string]: { id: string; nome: string; testament: 'VT' | 'NT' } } = {
  // Antigo Testamento
  gn: { id: 'genesis', nome: 'Gênesis', testament: 'VT' },
êx: { id: 'exodo', nome: 'Êxodo', testament: 'VT' }, // Corrigido para 'ex' se o JSON usa assim
  lv: { id: 'levitico', nome: 'Levítico', testament: 'VT' },
  nm: { id: 'numeros', nome: 'Números', testament: 'VT' },
  dt: { id: 'deuteronomio', nome: 'Deuteronômio', testament: 'VT' },
  js: { id: 'josue', nome: 'Josué', testament: 'VT' },
  jz: { id: 'juizes', nome: 'Juízes', testament: 'VT' },
  rt: { id: 'rute', nome: 'Rute', testament: 'VT' },
  '1sm': { id: '1samuel', nome: '1 Samuel', testament: 'VT' },
  '2sm': { id: '2samuel', nome: '2 Samuel', testament: 'VT' },
  '1rs': { id: '1reis', nome: '1 Reis', testament: 'VT' },
  '2rs': { id: '2reis', nome: '2 Reis', testament: 'VT' },
  '1cr': { id: '1cronicas', nome: '1 Crônicas', testament: 'VT' },
  '2cr': { id: '2cronicas', nome: '2 Crônicas', testament: 'VT' },
  ed: { id: 'esdras', nome: 'Esdras', testament: 'VT' },
  ne: { id: 'neemias', nome: 'Neemias', testament: 'VT' },
  et: { id: 'ester', nome: 'Ester', testament: 'VT' },
  // Se o JSON usa "Jó" (com acento), a chave aqui deve ser "jo" se essa for a abreviação no JSON
  // Ou "jó" se for como você está usando na chave. Vamos padronizar para sem acento na chave se o JSON usa assim.
  jó: { id: 'jo', nome: 'Jó', testament: 'VT' }, // Chave 'jo' para Jó (VT)

  sl: { id: 'salmos', nome: 'Salmos', testament: 'VT' },
  pv: { id: 'proverbios', nome: 'Provérbios', testament: 'VT' },
  ec: { id: 'eclesiastes', nome: 'Eclesiastes', testament: 'VT' },
  ct: { id: 'cantares', nome: 'Cantares', testament: 'VT' },
  is: { id: 'isaias', nome: 'Isaías', testament: 'VT' },
  jr: { id: 'jeremias', nome: 'Jeremias', testament: 'VT' },
  lm: { id: 'lamentacoes', nome: 'Lamentações', testament: 'VT' },
  ez: { id: 'ezequiel', nome: 'Ezequiel', testament: 'VT' },
  dn: { id: 'daniel', nome: 'Daniel', testament: 'VT' },
  os: { id: 'oseias', nome: 'Oseias', testament: 'VT' },
  jl: { id: 'joel', nome: 'Joel', testament: 'VT' },
  am: { id: 'amos', nome: 'Amós', testament: 'VT' },
  ob: { id: 'obadias', nome: 'Obadias', testament: 'VT' },
  jn: { id: 'jonas', nome: 'Jonas', testament: 'VT' },
  mq: { id: 'miqueias', nome: 'Miqueias', testament: 'VT' },
  na: { id: 'naum', nome: 'Naum', testament: 'VT' },
  hc: { id: 'habacuque', nome: 'Habacuque', testament: 'VT' },
  sf: { id: 'sofanias', nome: 'Sofonias', testament: 'VT' },
  ag: { id: 'ageu', nome: 'Ageu', testament: 'VT' },
  zc: { id: 'zacarias', nome: 'Zacarias', testament: 'VT' },
  ml: { id: 'malaquias', nome: 'Malaquias', testament: 'VT' },

  // Novo Testamento
  mt: { id: 'mateus', nome: 'Mateus', testament: 'NT' },
  mc: { id: 'marcos', nome: 'Marcos', testament: 'NT' },
  lc: { id: 'lucas', nome: 'Lucas', testament: 'NT' },
  // Se o JSON usa "jo" para João do NT, então é preciso ter chaves diferentes para Jó e João.
  // Uma solução comum é "jo" para João e "job" para Jó, ou "joao" para João.
  // Vamos usar 'joa' para João para diferenciar de 'jo' de Jó, se o seu JSON usa 'joa'.
  joao: { id: 'joao', nome: 'João', testament: 'NT' }, // Chave 'joa' para João (NT)
  at: { id: 'atos', nome: 'Atos', testament: 'NT' },
  rm: { id: 'romanos', nome: 'Romanos', testament: 'NT' },
  '1co': { id: '1corintios', nome: '1 Coríntios', testament: 'NT' },
  '2co': { id: '2corintios', nome: '2 Coríntios', testament: 'NT' },
  gl: { id: 'galatas', nome: 'Gálatas', testament: 'NT' },
  ef: { id: 'efesios', nome: 'Efésios', testament: 'NT' },
  fp: { id: 'filipenses', nome: 'Filipenses', testament: 'NT' },
  cl: { id: 'colossenses', nome: 'Colossenses', testament: 'NT' },
  '1ts': { id: '1tessalonicenses', nome: '1 Tessalonicenses', testament: 'NT' },
  '2ts': { id: '2tessalonicenses', nome: '2 Tessalonicenses', testament: 'NT' },
  '1tm': { id: '1timoteo', nome: '1 Timóteo', testament: 'NT' },
  '2tm': { id: '2timoteo', nome: '2 Timóteo', testament: 'NT' },
  tt: { id: 'tito', nome: 'Tito', testament: 'NT' },
  fm: { id: 'filemon', nome: 'Filemom', testament: 'NT' },
  hb: { id: 'hebreus', nome: 'Hebreus', testament: 'NT' },
  tg: { id: 'tiago', nome: 'Tiago', testament: 'NT' },
  '1pe': { id: '1pedro', nome: '1 Pedro', testament: 'NT' },
  '2pe': { id: '2pedro', nome: '2 Pedro', testament: 'NT' },
  '1jo': { id: '1joao', nome: '1 João', testament: 'NT' },
  '2jo': { id: '2joao', nome: '2 João', testament: 'NT' },
  '3jo': { id: '3joao', nome: '3 João', testament: 'NT' },
  jd: { id: 'judas', nome: 'Judas', testament: 'NT' },
  ap: { id: 'apocalipse', nome: 'Apocalipse', testament: 'NT' },
};