"use client";

import { useEffect, useState } from "react";
import { formatarComo, lerNumero } from "@/lib/visual";

/** Número que conta de 0 até o valor quando a tela abre. Termina exatamente no texto original. */
export function Contador({ valor }: { valor: string | number }) {
  const texto = String(valor);
  const n = lerNumero(texto);
  const [mostrado, setMostrado] = useState(n ? formatarComo(n, 0) : texto);

  useEffect(() => {
    const num = lerNumero(texto);
    let raf = 0;
    if (!num || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raf = requestAnimationFrame(() => setMostrado(texto));
      return () => cancelAnimationFrame(raf);
    }
    let t0 = 0;
    const dur = 1100;
    const passo = (t: number) => {
      t0 = t0 || t;
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setMostrado(p < 1 ? formatarComo(num, num.alvo * e) : texto);
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [texto]);

  return <>{mostrado}</>;
}
