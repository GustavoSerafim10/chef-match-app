import Link from "next/link";
import { Nav } from "@/components/nav";
import { Avatar, Logo } from "@/components/ui";
import { getContexto } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getContexto();
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link href="/painel" aria-label="Chef's Match, início">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Nav role={profile.role} />
            <Link href="/perfil" className="flex items-center gap-2" aria-label="Meu perfil">
              <span className="hidden text-right leading-tight sm:block">
                <span className="block text-sm font-semibold">{profile.nome}</span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-muted">{ROLE_LABEL[profile.role]}</span>
              </span>
              <Avatar nome={profile.nome} size={36} />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12">{children}</main>
    </div>
  );
}
