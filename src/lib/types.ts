export type Role = "profissional" | "empresa" | "fornecedor";
export type TipoVaga = "efetivo" | "temporario" | "extra";

export type Profile = {
  id: string;
  role: Role;
  nome: string;
  regiao: string | null;
  telefone: string | null;
  bio: string | null;
  funcao: string | null;
  especialidades: string[] | null;
  experiencia_anos: number | null;
  disponivel_hoje: boolean;
  disponivel_em: string | null;
  created_at: string;
};

export type Vaga = {
  id: string;
  empresa_id: string;
  funcao: string;
  tipo: TipoVaga;
  remuneracao: string;
  horario: string | null;
  regiao: string | null;
  descricao: string | null;
  urgente: boolean;
  data_turno: string | null;
  status: "aberta" | "fechada";
  created_at: string;
};

export type Candidatura = {
  id: string;
  vaga_id: string;
  profissional_id: string;
  origem: "candidatura" | "convite";
  status: "pendente" | "aceita" | "recusada";
  created_at: string;
};

export type Produto = {
  id: string;
  fornecedor_id: string;
  nome: string;
  categoria: string;
  unidade: string;
  preco: number | null;
  created_at: string;
};

export type Cotacao = {
  id: string;
  empresa_id: string;
  titulo: string;
  itens: string;
  categoria: string | null;
  status: "aberta" | "fechada";
  created_at: string;
};

export type Proposta = {
  id: string;
  cotacao_id: string;
  fornecedor_id: string;
  preco_total: number;
  prazo_dias: number;
  frete: string | null;
  pagamento: string | null;
  aceita: boolean;
  created_at: string;
};

export type Avaliacao = {
  id: string;
  autor_id: string;
  avaliado_id: string;
  nota: number;
  comentario: string | null;
  contexto: "vaga" | "cotacao";
  referencia_id: string;
  created_at: string;
};

export type Reputacao = { perfil_id: string; media: number; total: number };
