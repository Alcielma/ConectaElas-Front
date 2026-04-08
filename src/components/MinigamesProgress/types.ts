import { TipoJogo } from "../../Services/PontuacaoService";

export interface PontuacaoItem {
  id: number;
  jogo: TipoJogo;
  total: number;
  createdAt: string;
  users_permissions_user: any;
  itemId?: number;
  itemTitle?: string;
}

export interface UserSummary {
  userId: number;
  userName: string;
  totalGames: number;
  totalPoints: number;
  lastGameDate: string;
}

export interface UserGameStats {
  userId: number;
  userName: string;
  jogoType: TipoJogo;
  scores: PontuacaoItem[];
  totalPoints: number;
  avgPoints: number;
  lastScore: number;
  lastDate: string;
}

export interface GameTypeStats {
  jogo: TipoJogo;
  descricao: string;
  totalPontos: number;
  totalJogos: number;
  melhorPontuacao: number;
  mediaPerJogo: number;
}
