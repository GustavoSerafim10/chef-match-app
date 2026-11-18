"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo fixo com foto de cozinha, véu escuro e brasas subindo.
 * As brasas pausam com a aba oculta e não aparecem para quem pediu menos movimento.
 */
export function FundoVivo({ foto, opacidade = 0.4, brasas = 30 }: { foto: string; opacidade?: number; brasas?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const celular = matchMedia("(max-width: 960px)").matches;
    const qtd = celular ? Math.round(brasas * 0.6) : brasas;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let ultimo = 0;
    type P = { x: number; y: number; r: number; vy: number; vx: number; fase: number; vida: number; max: number; cor: string };
    const nova = (p: Partial<P> = {}, inicio = false): P =>
      Object.assign(p, {
        x: Math.random() * w,
        y: inicio ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 1.8,
        vy: 16 + Math.random() * 40,
        vx: -8 + Math.random() * 16,
        fase: Math.random() * 6.28,
        vida: 0,
        max: 3 + Math.random() * 6,
        cor: Math.random() < 0.7 ? "255,140,60" : "255,196,120",
      }) as P;
    const medir = () => {
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    medir();
    const ps = Array.from({ length: qtd }, () => nova({}, true));
    const passo = (t: number) => {
      // No celular desenha no máximo ~30 quadros por segundo (economiza bateria e GPU)
      if (celular && ultimo && t - ultimo < 32) {
        raf = requestAnimationFrame(passo);
        return;
      }
      const dt = Math.min((t - (ultimo || t)) / 1000, 0.05);
      ultimo = t;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of ps) {
        p.vida += dt;
        p.y -= p.vy * dt;
        p.x += (p.vx + Math.sin(p.fase + p.vida * 2) * 10) * dt;
        if (p.y < -10 || p.vida > p.max) {
          nova(p);
          continue;
        }
        const a = Math.max(0, 1 - p.vida / p.max) * (0.55 + 0.45 * Math.sin(p.fase + p.vida * 7));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.cor},${a.toFixed(3)})`;
        ctx.shadowBlur = celular ? 0 : 8;
        ctx.shadowColor = `rgba(255,120,40,${a.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
      raf = requestAnimationFrame(passo);
    };
    const visibilidade = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        ultimo = 0;
        raf = requestAnimationFrame(passo);
      }
    };
    addEventListener("resize", medir);
    document.addEventListener("visibilitychange", visibilidade);
    raf = requestAnimationFrame(passo);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", medir);
      document.removeEventListener("visibilitychange", visibilidade);
    };
  }, [brasas]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="fundo-foto absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${foto})`, opacity: opacidade }} />
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_100%_-10%,rgb(240_120_50/.18),transparent_70%),radial-gradient(700px_500px_at_-10%_70%,rgb(240_120_50/.12),transparent_70%),linear-gradient(180deg,rgb(26_22_18/.12),rgb(26_22_18/.32)_55%,rgb(26_22_18/.55))]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
