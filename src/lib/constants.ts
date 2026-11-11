import type { Role, TipoVaga } from "./types";

export const FUNCOES = [
  "Garçom",
  "Cozinheiro(a)",
  "Auxiliar de cozinha",
  "Chef",
  "Bartender",
  "Barista",
  "Confeiteiro(a)",
  "Padeiro(a)",
  "Atendente",
  "Gerente",
] as const;

export const REGIOES = [
  "Asa Norte",
  "Asa Sul",
  "Plano Piloto",
  "Sudoeste",
  "Lago Sul",
  "Lago Norte",
  "Águas Claras",
  "Taguatinga",
  "Guará",
  "Ceilândia",
  "Outra região do DF",
] as const;

export const CATEGORIAS = [
  "Hortifruti",
  "Carnes e aves",
  "Pescados",
  "Bebidas",
  "Laticínios",
  "Embalagens",
  "Equipamentos e utensílios",
  "Limpeza profissional",
  "Confeitaria e panificação",
] as const;

export const TIPO_LABEL: Record<TipoVaga, string> = {
  efetivo: "Efetivo",
  temporario: "Temporário",
  extra: "Extra",
};

export const ROLE_LABEL: Record<Role, string> = {
  profissional: "Profissional",
  empresa: "Estabelecimento",
  fornecedor: "Fornecedor",
};
