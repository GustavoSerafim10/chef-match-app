/**
 * Limitador simples em memória: no máximo `max` usos por chave dentro de `janelaMs`.
 * Vive só enquanto a instância do servidor estiver ativa, o que basta para uma apresentação.
 */
export function criarLimitador(max: number, janelaMs: number, agora: () => number = Date.now) {
  const usos = new Map<string, number[]>();

  return function pode(chave: string): boolean {
    const t = agora();
    const recentes = (usos.get(chave) ?? []).filter((u) => t - u < janelaMs);
    if (recentes.length >= max) {
      usos.set(chave, recentes);
      return false;
    }
    recentes.push(t);
    usos.set(chave, recentes);
    return true;
  };
}
