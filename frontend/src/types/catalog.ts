export type Cinema = {
  id: string;
  nome: string;
  cidade: string;
  endereco: string;
  ativo: boolean;
};

export type Room = {
  id: string;
  cinemaId: string;
  nome: string;
  fileiras: number;
  assentosPorFileira: number;
  ativo: boolean;
  cinema: Cinema;
};

export type Session = {
  id: string;
  filmeId: string;
  salaId: string;
  inicio: string;
  fim: string;
  precoBaseCentavos: number;
  formato: "2D" | "3D";
  versao: "DUBLADO" | "LEGENDADO" | "ORIGINAL";
  publicada: boolean;
  sala: Room;
};

export type Movie = {
  id: string;
  titulo: string;
  slug: string;
  sinopse: string | null;
  duracaoMinutos: number;
  classificacao: string | null;
  genero: string | null;
  cartazUrl: string | null;
  ativo: boolean;
  sessoes: Session[];
};
