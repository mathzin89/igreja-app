// jspdf.d.ts
import { jsPDF } from 'jspdf';

// Declaração de tipo para GState (pode ser necessária se não for exportada diretamente)
declare module 'jspdf' {
  interface GStateOptions {
    opacity?: number;
    // Adicione outras propriedades de GState se for usá-las
  }

  class GState {
    constructor(options: GStateOptions);
  }

  // Estende a interface jsPDF para incluir o método setGState
  interface jsPDF {
    setGState(gState: GState): jsPDF; // Ou any, dependendo da necessidade
    GState: typeof GState; // Adiciona o construtor GState ao jsPDF se ele for acessado via `new doc.GState(...)`
  }
}

// Se você usa jspdf-autotable e setGState vem dele, pode ser necessário algo assim:
// declare module 'jspdf-autotable' {
//   interface GStateOptions { /* ... */ }
//   class GState { /* ... */ }
//   interface jsPDF {
//     setGState(gState: GState): jsPDF;
//     GState: typeof GState;
//   }
// }