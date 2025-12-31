// app/admin/types.ts

// Para os cartões de estatísticas no topo
export interface DashboardStats {
  userCount: number;
  memberCount: number;
  pendingRequestCount: number;
}

// Para os resumos financeiros de cada igreja
export interface ChurchFinanceSummary {
  igrejaId: string;
  igrejaNome: string;
  totalEntradas: number;
  totalSaidas: number;
  saldoAtual: number;
}

// Para a lista de solicitações recentes
export interface RecentRequest {
  id: string;
  nome: string;
  email: string;
}

// Para os dados do gráfico de barras mensal
export interface MonthlyData {
  name: string;      // ex: "Jan", "Fev"
  Entradas: number;
  Saídas: number;
}