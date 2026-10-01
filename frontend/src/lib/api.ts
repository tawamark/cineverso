import type { Movie } from "@/types/catalog";
import { withProgress } from "./progress";

const trackedFetch: typeof fetch = (...args) => withProgress(() => fetch(...args));

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

type AdminLoginInput = {
  email: string;
  senha: string;
};

export type AdminSession = {
  token: string;
  expiraEm: string;
  email: string;
};

export type AdminMovie = {
  id: string;
  titulo: string;
  slug: string;
  sinopse: string | null;
  duracaoMinutos: number;
  classificacao: string | null;
  genero: string | null;
  cartazUrl: string | null;
  ativo: boolean;
};

export type AdminMovieInput = {
  titulo: string;
  duracaoMinutos: number;
  sinopse?: string;
  classificacao?: string;
  genero?: string;
  cartazUrl?: string;
  ativo?: boolean;
};

export type AdminRoom = {
  id: string;
  cinemaId: string;
  nome: string;
  fileiras: number;
  assentosPorFileira: number;
  ativo: boolean;
  cinema: {
    id: string;
    nome: string;
    cidade: string;
    endereco: string;
    ativo: boolean;
  };
};

export type AdminCinema = AdminRoom["cinema"];

export type AdminCinemaInput = {
  nome: string;
  cidade: string;
  endereco: string;
  ativo?: boolean;
};

export type AdminRoomInput = {
  cinemaId?: string;
  nome: string;
  fileiras: number;
  assentosPorFileira: number;
  ativo?: boolean;
};

export type AdminSessionItem = {
  id: string;
  filmeId: string;
  salaId: string;
  inicio: string;
  fim: string;
  precoBaseCentavos: number;
  formato: "2D" | "3D";
  versao: "DUBLADO" | "LEGENDADO" | "ORIGINAL";
  publicada: boolean;
  filme: AdminMovie;
  sala: AdminRoom;
  ingressos?: Array<{ assentoId: string }>;
  _count?: {
    ingressos: number;
    compras: number;
  };
};

export type AdminSessionDetails = Omit<AdminSessionItem, "sala"> & {
  sala: AdminRoom & {
    assentos: Array<{ id: string; fileira: string; numero: number }>;
  };
  ingressos: Array<{ assentoId: string }>;
};

export type AdminPurchase = {
  id: string;
  codigo: string;
  sessaoId: string;
  totalCentavos: number;
  criadaEm: string;
  sessao: AdminSessionItem;
  ingressos: Array<{
    id: string;
    codigo: string;
    precoCentavos: number;
    assento: {
      id: string;
      fileira: string;
      numero: number;
    };
    tipoIngresso: {
      id: string;
      nome: string;
      descontoPercentual: number;
    };
  }>;
};

export type AdminTicketType = {
  id: string;
  nome: string;
  descontoPercentual: number;
  inicioVigencia: string | null;
  fimVigencia: string | null;
  ativo: boolean;
};

export type AdminTicketTypeInput = {
  nome: string;
  descontoPercentual: number;
  inicioVigencia?: string | null;
  fimVigencia?: string | null;
  ativo?: boolean;
};

export type PublicTicketType = AdminTicketType & { precoCentavos: number };
export type PublicSession = AdminSessionItem & { tiposIngresso: PublicTicketType[] };
export type PublicSeat = { id: string; salaId: string; fileira: string; numero: number; disponivel: boolean };
export type Purchase = {
  id: string;
  codigo: string;
  totalCentavos: number;
  ingressos: Array<{
    id: string;
    codigo: string;
    assento: { id: string; fileira: string; numero: number };
    tipoIngresso: AdminTicketType;
    precoCentavos: number;
  }>;
};

export type PublicPurchaseDetails = Purchase & {
  criadaEm: string;
  sessao: AdminSessionItem;
};

export type AdminOverview = {
  estatisticas: {
    filmesAtivos: number;
    sessoesFuturas: number;
    ingressosVendidos: number;
    vendasRealizadas: number;
    faturamentoCentavos: number;
  };
  vendasRecentes: Array<{
    id: string;
    codigo: string;
    totalCentavos: number;
    criadaEm: string;
    sessao: { filme: AdminMovie };
    _count: { ingressos: number };
  }>;
  proximasSessoes: Array<AdminSessionItem & { _count: { ingressos: number } }>;
};

export type AdminSessionInput = {
  filmeId: string;
  salaId: string;
  inicio: string;
  precoBaseCentavos: number;
  formato: "2D" | "3D";
  versao: "DUBLADO" | "LEGENDADO" | "ORIGINAL";
  publicada?: boolean;
};

type ApiErrorBody = {
  message?: string | string[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function adminRequest<T>(
  resource: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await trackedFetch(`${API_URL}/admin/${resource}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new ApiError(message ?? "Não foi possível concluir a operação.", response.status);
  }
  return response.json() as Promise<T>;
}

export async function loginAdmin(
  credentials: AdminLoginInput,
): Promise<AdminSession> {
  const response = await trackedFetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message;

    throw new ApiError(message ?? "Não foi possível entrar.", response.status);
  }

  const session = (await response.json()) as Omit<AdminSession, "email">;

  return {
    ...session,
    email: credentials.email.trim().toLowerCase(),
  };
}

export async function getAdminMovies(
  token: string,
  signal?: AbortSignal,
): Promise<AdminMovie[]> {
  const response = await trackedFetch(`${API_URL}/admin/filmes`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError("Não foi possível carregar os filmes.", response.status);
  }

  return response.json() as Promise<AdminMovie[]>;
}

export async function getAdminMovie(
  token: string,
  id: string,
  signal?: AbortSignal,
): Promise<AdminMovie> {
  const response = await trackedFetch(`${API_URL}/admin/filmes/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError("Não foi possível carregar o filme.", response.status);
  }

  return response.json() as Promise<AdminMovie>;
}

async function adminMovieRequest(
  path: string,
  token: string,
  init: RequestInit,
): Promise<AdminMovie> {
  const response = await trackedFetch(`${API_URL}/admin/filmes${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new ApiError(message ?? "Não foi possível salvar o filme.", response.status);
  }

  return response.json() as Promise<AdminMovie>;
}

export function createAdminMovie(token: string, movie: AdminMovieInput) {
  const { ativo: _ativo, ...createInput } = movie;
  void _ativo;
  return adminMovieRequest("", token, {
    method: "POST",
    body: JSON.stringify(createInput),
  });
}

export function updateAdminMovie(
  token: string,
  id: string,
  movie: AdminMovieInput,
) {
  return adminMovieRequest(`/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(movie),
  });
}

export function deleteAdminMovie(token: string, id: string) {
  return adminMovieRequest(`/${id}`, token, { method: "DELETE" });
}

export async function getAdminRooms(
  token: string,
  signal?: AbortSignal,
): Promise<AdminRoom[]> {
  const response = await trackedFetch(`${API_URL}/admin/salas`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError("Não foi possível carregar as salas.", response.status);
  }

  return response.json() as Promise<AdminRoom[]>;
}

export const getAdminCinemas = (token: string) =>
  adminRequest<AdminCinema[]>("cinemas", token);
export const getAdminCinema = (token: string, id: string) =>
  adminRequest<AdminCinema>(`cinemas/${id}`, token);
export const createAdminCinema = (token: string, input: AdminCinemaInput) => {
  const { ativo: _ativo, ...data } = input;
  void _ativo;
  return adminRequest<AdminCinema>("cinemas", token, { method: "POST", body: JSON.stringify(data) });
};
export const updateAdminCinema = (token: string, id: string, input: AdminCinemaInput) =>
  adminRequest<AdminCinema>(`cinemas/${id}`, token, { method: "PATCH", body: JSON.stringify(input) });
export const deleteAdminCinema = (token: string, id: string) =>
  adminRequest<AdminCinema>(`cinemas/${id}`, token, { method: "DELETE" });

export const getAdminRoom = (token: string, id: string) =>
  adminRequest<AdminRoom>(`salas/${id}`, token);
export const createAdminRoom = (token: string, input: AdminRoomInput) =>
  adminRequest<AdminRoom>("salas", token, { method: "POST", body: JSON.stringify(input) });
export const updateAdminRoom = (token: string, id: string, input: AdminRoomInput) => {
  const { cinemaId: _cinemaId, ...data } = input;
  void _cinemaId;
  return adminRequest<AdminRoom>(`salas/${id}`, token, { method: "PATCH", body: JSON.stringify(data) });
};
export const deleteAdminRoom = (token: string, id: string) =>
  adminRequest<AdminRoom>(`salas/${id}`, token, { method: "DELETE" });

export async function getAdminSessions(
  token: string,
  signal?: AbortSignal,
): Promise<AdminSessionItem[]> {
  const response = await trackedFetch(`${API_URL}/admin/sessoes`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError("Não foi possível carregar as sessões.", response.status);
  }

  return response.json() as Promise<AdminSessionItem[]>;
}

export const getAdminSessionItem = (token: string, id: string) =>
  adminRequest<AdminSessionDetails>(`sessoes/${id}`, token);
export const createAdminSession = (token: string, input: AdminSessionInput) =>
  adminRequest<AdminSessionItem>("sessoes", token, { method: "POST", body: JSON.stringify(input) });
export const updateAdminSession = (token: string, id: string, input: AdminSessionInput) =>
  adminRequest<AdminSessionItem>(`sessoes/${id}`, token, { method: "PATCH", body: JSON.stringify(input) });
export const deleteAdminSession = (token: string, id: string) =>
  adminRequest<AdminSessionItem>(`sessoes/${id}`, token, { method: "DELETE" });

export async function getAdminPurchases(
  token: string,
  signal?: AbortSignal,
): Promise<AdminPurchase[]> {
  const response = await trackedFetch(`${API_URL}/admin/compras`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError("Não foi possível carregar as vendas.", response.status);
  }

  return response.json() as Promise<AdminPurchase[]>;
}

export const getAdminPurchase = (token: string, id: string) =>
  adminRequest<AdminPurchase>(`compras/${id}`, token);

export const getAdminOverview = (token: string) =>
  adminRequest<AdminOverview>("visao-geral", token);

export async function getAdminTicketTypes(
  token: string,
  signal?: AbortSignal,
): Promise<AdminTicketType[]> {
  const response = await trackedFetch(`${API_URL}/admin/tipos-ingresso`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      "Não foi possível carregar os tipos de ingresso.",
      response.status,
    );
  }

  return response.json() as Promise<AdminTicketType[]>;
}

export const getAdminTicketType = (token: string, id: string) =>
  adminRequest<AdminTicketType>(`tipos-ingresso/${id}`, token);
export const createAdminTicketType = (token: string, input: AdminTicketTypeInput) => {
  const { ativo: _ativo, ...data } = input;
  void _ativo;
  return adminRequest<AdminTicketType>("tipos-ingresso", token, { method: "POST", body: JSON.stringify(data) });
};
export const updateAdminTicketType = (token: string, id: string, input: AdminTicketTypeInput) =>
  adminRequest<AdminTicketType>(`tipos-ingresso/${id}`, token, { method: "PATCH", body: JSON.stringify(input) });
export const deleteAdminTicketType = (token: string, id: string) =>
  adminRequest<AdminTicketType>(`tipos-ingresso/${id}`, token, { method: "DELETE" });

export async function getCatalog(signal?: AbortSignal): Promise<Movie[]> {
  const response = await trackedFetch(`${API_URL}/catalogo/filmes`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar o catálogo (${response.status}).`);
  }

  return response.json() as Promise<Movie[]>;
}

export async function getPublicMovie(slug: string, signal?: AbortSignal): Promise<Movie> {
  const response = await trackedFetch(`${API_URL}/catalogo/filmes/${slug}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new ApiError("Filme não disponível.", response.status);
  return response.json() as Promise<Movie>;
}

export async function getPublicSession(id: string): Promise<PublicSession> {
  const response = await trackedFetch(`${API_URL}/sessoes/${id}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new ApiError("Sessão não disponível.", response.status);
  return response.json() as Promise<PublicSession>;
}

export async function getPublicSeats(id: string): Promise<PublicSeat[]> {
  const response = await trackedFetch(`${API_URL}/sessoes/${id}/assentos`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new ApiError("Não foi possível carregar os assentos.", response.status);
  return response.json() as Promise<PublicSeat[]>;
}

export async function createPurchase(sessaoId: string, itens: Array<{ assentoId: string; tipoIngressoId: string }>): Promise<Purchase> {
  const response = await trackedFetch(`${API_URL}/compras`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ sessaoId, itens }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new ApiError(message ?? "Não foi possível confirmar a compra.", response.status);
  }
  return response.json() as Promise<Purchase>;
}

export async function getPurchaseByCode(code: string): Promise<PublicPurchaseDetails> {
  const response = await trackedFetch(`${API_URL}/compras/${encodeURIComponent(code)}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new ApiError(message ?? "Não foi possível consultar a compra.", response.status);
  }
  return response.json() as Promise<PublicPurchaseDetails>;
}
