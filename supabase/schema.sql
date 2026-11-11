-- Chef's Match: estrutura do banco (Supabase / Postgres)
-- Cole tudo no Supabase em: SQL Editor > New query > Run.

-- =========================================================
-- PERFIS: um por usuário (profissional, empresa ou fornecedor)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('profissional', 'empresa', 'fornecedor')),
  nome text not null,
  regiao text,
  telefone text,
  bio text,
  -- campos do profissional
  funcao text,
  especialidades text[] default '{}',
  experiencia_anos int default 0,
  disponivel_hoje boolean not null default false,
  disponivel_em date,
  created_at timestamptz not null default now()
);

-- Cria o perfil automaticamente quando alguém se cadastra
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, nome, regiao, funcao)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'profissional'),
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'regiao',
    new.raw_user_meta_data ->> 'funcao'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- VAGAS (Talentos)
-- =========================================================
create table public.vagas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.profiles (id) on delete cascade,
  funcao text not null,
  tipo text not null check (tipo in ('efetivo', 'temporario', 'extra')),
  remuneracao text not null,
  horario text,
  regiao text,
  descricao text,
  urgente boolean not null default false,
  data_turno date,
  status text not null default 'aberta' check (status in ('aberta', 'fechada')),
  created_at timestamptz not null default now()
);

create table public.candidaturas (
  id uuid primary key default gen_random_uuid(),
  vaga_id uuid not null references public.vagas (id) on delete cascade,
  profissional_id uuid not null references public.profiles (id) on delete cascade,
  origem text not null default 'candidatura' check (origem in ('candidatura', 'convite')),
  status text not null default 'pendente' check (status in ('pendente', 'aceita', 'recusada')),
  created_at timestamptz not null default now(),
  unique (vaga_id, profissional_id)
);

-- =========================================================
-- FORNECEDORES: catálogo, cotações e propostas
-- =========================================================
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  fornecedor_id uuid not null references public.profiles (id) on delete cascade,
  nome text not null,
  categoria text not null,
  unidade text not null default 'kg',
  preco numeric(10, 2),
  created_at timestamptz not null default now()
);

create table public.cotacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.profiles (id) on delete cascade,
  titulo text not null,
  itens text not null,
  categoria text,
  status text not null default 'aberta' check (status in ('aberta', 'fechada')),
  created_at timestamptz not null default now()
);

create table public.propostas (
  id uuid primary key default gen_random_uuid(),
  cotacao_id uuid not null references public.cotacoes (id) on delete cascade,
  fornecedor_id uuid not null references public.profiles (id) on delete cascade,
  preco_total numeric(10, 2) not null,
  prazo_dias int not null,
  frete text,
  pagamento text,
  aceita boolean not null default false,
  created_at timestamptz not null default now(),
  unique (cotacao_id, fornecedor_id)
);

-- =========================================================
-- AVALIAÇÕES (Chef's Match Qualidade)
-- =========================================================
create table public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.profiles (id) on delete cascade,
  avaliado_id uuid not null references public.profiles (id) on delete cascade,
  nota int not null check (nota between 1 and 5),
  comentario text,
  contexto text not null check (contexto in ('vaga', 'cotacao')),
  referencia_id uuid not null,
  created_at timestamptz not null default now(),
  unique (autor_id, avaliado_id, referencia_id),
  check (autor_id <> avaliado_id)
);

-- Média e quantidade de avaliações por perfil
create view public.reputacao with (security_invoker = true) as
  select avaliado_id as perfil_id,
         round(avg(nota)::numeric, 1) as media,
         count(*) as total
  from public.avaliacoes
  group by avaliado_id;

-- =========================================================
-- SEGURANÇA (Row Level Security)
-- =========================================================
alter table public.profiles enable row level security;
alter table public.vagas enable row level security;
alter table public.candidaturas enable row level security;
alter table public.produtos enable row level security;
alter table public.cotacoes enable row level security;
alter table public.propostas enable row level security;
alter table public.avaliacoes enable row level security;

-- Perfis: quem está logado vê os perfis; cada um edita só o seu
create policy "perfis visiveis para logados" on public.profiles
  for select to authenticated using (true);
create policy "editar o proprio perfil" on public.profiles
  for update to authenticated using ((select auth.uid()) = id);

-- Vagas: todos logados veem; só a empresa dona cria e edita
create policy "vagas visiveis" on public.vagas
  for select to authenticated using (true);
create policy "empresa cria vaga" on public.vagas
  for insert to authenticated with check ((select auth.uid()) = empresa_id);
create policy "empresa edita vaga" on public.vagas
  for update to authenticated using ((select auth.uid()) = empresa_id);

-- Candidaturas: o profissional vê as dele; a empresa vê as das vagas dela
create policy "ver candidaturas envolvidas" on public.candidaturas
  for select to authenticated using (
    (select auth.uid()) = profissional_id
    or exists (select 1 from public.vagas v where v.id = vaga_id and v.empresa_id = (select auth.uid()))
  );
create policy "profissional se candidata" on public.candidaturas
  for insert to authenticated with check (
    origem = 'candidatura' and (select auth.uid()) = profissional_id
  );
create policy "empresa convida" on public.candidaturas
  for insert to authenticated with check (
    origem = 'convite'
    and exists (select 1 from public.vagas v where v.id = vaga_id and v.empresa_id = (select auth.uid()))
  );
create policy "partes atualizam status" on public.candidaturas
  for update to authenticated using (
    (select auth.uid()) = profissional_id
    or exists (select 1 from public.vagas v where v.id = vaga_id and v.empresa_id = (select auth.uid()))
  );

-- Produtos: todos logados veem; fornecedor gerencia os seus
create policy "produtos visiveis" on public.produtos
  for select to authenticated using (true);
create policy "fornecedor gerencia produtos" on public.produtos
  for all to authenticated
  using ((select auth.uid()) = fornecedor_id)
  with check ((select auth.uid()) = fornecedor_id);

-- Cotações: todos logados veem (fornecedores precisam ver para responder)
create policy "cotacoes visiveis" on public.cotacoes
  for select to authenticated using (true);
create policy "empresa cria cotacao" on public.cotacoes
  for insert to authenticated with check ((select auth.uid()) = empresa_id);
create policy "empresa edita cotacao" on public.cotacoes
  for update to authenticated using ((select auth.uid()) = empresa_id);

-- Propostas: o fornecedor vê as dele; a empresa vê as das cotações dela
create policy "ver propostas envolvidas" on public.propostas
  for select to authenticated using (
    (select auth.uid()) = fornecedor_id
    or exists (select 1 from public.cotacoes c where c.id = cotacao_id and c.empresa_id = (select auth.uid()))
  );
create policy "fornecedor envia proposta" on public.propostas
  for insert to authenticated with check ((select auth.uid()) = fornecedor_id);
create policy "empresa aceita proposta" on public.propostas
  for update to authenticated using (
    exists (select 1 from public.cotacoes c where c.id = cotacao_id and c.empresa_id = (select auth.uid()))
  );

-- Avaliações: públicas para logados; cada um escreve só em seu nome
create policy "avaliacoes visiveis" on public.avaliacoes
  for select to authenticated using (true);
create policy "autor cria avaliacao" on public.avaliacoes
  for insert to authenticated with check ((select auth.uid()) = autor_id);
