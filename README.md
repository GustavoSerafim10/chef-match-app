# Chef's Match: app

> **A gastronomia se conecta aqui.** Plataforma que conecta profissionais da gastronomia, restaurantes e fornecedores. Projeto de startup com lançamento em Brasília/DF.

Site do projeto: https://gustavoserafim10.github.io/SiteChef-Match/

## O que o app faz

**Profissional** (sempre grátis)
- Liga o **"Disponível hoje"** para aparecer nas buscas urgentes de restaurantes
- Vê as vagas ordenadas por **compatibilidade** com o perfil e se candidata em um toque
- Recebe convites, aceita ou recusa, e avalia o estabelecimento depois do trabalho

**Estabelecimento**
- **"Preciso de alguém hoje"**: publica um extra e vê na hora quem está disponível, com a % de compatibilidade e o motivo
- Publica vagas efetivas, temporárias e extras, contrata e avalia o profissional
- Pede **cotação** de insumos, compara as propostas por preço, prazo ou avaliação e aprova o pedido

**Fornecedor**
- Mantém o catálogo de produtos
- Recebe cotações de restaurantes, envia propostas e avalia o comprador

**Chef's Match Qualidade**
- Reputação nos dois sentidos, com nota, quantidade de avaliações e distribuição
- **Só avalia quem teve uma experiência confirmada** no app (contratação aceita ou pedido aprovado)

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, `proxy.ts`)
- **Supabase**: Postgres, Auth e Row Level Security em todas as tabelas
- **Tailwind CSS 4**
- PWA instalável no celular

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a chave anon do Supabase
npm run dev
```

Banco: rode `supabase/schema.sql` no SQL Editor do Supabase.

## Estrutura

```
src/
  app/
    page.tsx              abertura
    entrar/, cadastro/    autenticação
    (app)/                área logada (layout com menu por tipo de usuário)
      painel/             painel de cada tipo de usuário
      vagas/              lista, nova vaga, detalhe com match e convites
      cotacoes/           cotações e comparação de propostas
      produtos/           catálogo de fornecedores
      perfil/             meu perfil e perfil público com reputação
    actions/              Server Actions (auth e regras do app)
  lib/                    Supabase, tipos e cálculo de compatibilidade
  proxy.ts                renova a sessão e protege as rotas
supabase/schema.sql       tabelas, gatilhos e políticas de segurança
```
