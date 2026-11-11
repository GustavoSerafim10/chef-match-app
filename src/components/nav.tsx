"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";

type Item = { href: string; label: string; icon: string };

const ICONS: Record<string, string> = {
  home: "M3 11l9-7 9 7v9H3z",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  truck: "M3 7h13v10H3z M16 10h3.5L22 13v4h-6",
  box: "M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8",
};

const MENUS: Record<Role, Item[]> = {
  profissional: [
    { href: "/painel", label: "Início", icon: "home" },
    { href: "/vagas", label: "Vagas", icon: "pin" },
    { href: "/perfil", label: "Perfil", icon: "user" },
  ],
  empresa: [
    { href: "/painel", label: "Início", icon: "home" },
    { href: "/vagas", label: "Vagas", icon: "bolt" },
    { href: "/cotacoes", label: "Compras", icon: "truck" },
    { href: "/produtos", label: "Catálogo", icon: "box" },
    { href: "/perfil", label: "Perfil", icon: "user" },
  ],
  fornecedor: [
    { href: "/painel", label: "Início", icon: "home" },
    { href: "/cotacoes", label: "Cotações", icon: "truck" },
    { href: "/produtos", label: "Produtos", icon: "box" },
    { href: "/perfil", label: "Perfil", icon: "user" },
  ],
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name].split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
}

function useMenu(role: Role) {
  const path = usePathname();
  const ativo = (href: string) => (href === "/painel" ? path === href : path.startsWith(href));
  return { items: MENUS[role], ativo };
}

/** Menu do topo (computador). */
export function Nav({ role }: { role: Role }) {
  const { items, ativo } = useMenu(role);
  return (
    <nav aria-label="Menu" className="hidden items-center gap-1 md:flex">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={ativo(it.href) ? "page" : undefined}
            className="rounded-full px-3.5 py-2 text-sm font-semibold text-soft transition hover:bg-ink-3 hover:text-paper aria-[current=page]:bg-ink-3 aria-[current=page]:text-orange"
          >
            {it.label}
          </Link>
        ))}
    </nav>
  );
}

/** Barra inferior (celular). Fica fora do cabeçalho: o backdrop-blur dele prenderia o position:fixed. */
export function NavMobile({ role }: { role: Role }) {
  const { items, ativo } = useMenu(role);
  return (
      <nav
        aria-label="Menu do app"
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-line bg-ink/95 backdrop-blur md:hidden"
        style={{
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={ativo(it.href) ? "page" : undefined}
            className="grid justify-items-center gap-1 pt-2.5 text-[11px] font-semibold text-muted aria-[current=page]:text-orange"
          >
            <Icon name={it.icon} />
            {it.label}
          </Link>
        ))}
      </nav>
  );
}
