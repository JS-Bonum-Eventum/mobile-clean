// ─────────────────────────────────────────────────────────────────
//  rosaryFlow.ts  –  Fluxo completo do terço (sequência litúrgica)
// ─────────────────────────────────────────────────────────────────
//
//  Layout do array beads[] (ordem de renderização na oval):
//
//  LAÇO — 54 contas [0..53]:
//    [0..9]   → 1.ª dezena (10 Ave Marias)
//    [10]     → Pai Nosso separador
//    [11..20] → 2.ª dezena
//    [21]     → Pai Nosso separador
//    [22..31] → 3.ª dezena
//    [32]     → Pai Nosso separador
//    [33..42] → 4.ª dezena
//    [43]     → Pai Nosso separador
//    [44..53] → 5.ª dezena (sem Pai Nosso ao final)
//
//  PENDENTE — 5 contas [54..58] (de cima para baixo):
//    [54] Pai Nosso inicial   — mais próximo da medalha
//    [55] Ave Maria – pela Fé
//    [56] Ave Maria – pela Esperança
//    [57] Ave Maria – pela Caridade
//    [58] Glória ao Pai       — mais próximo do crucifixo
//    → crucifixo (visual)
//
//  FLUXO LITÚRGICO (ativação de contas):
//    Sinal da Cruz → Creio em Deus Pai
//    → [58] Pai Nosso  ← PRIMEIRA conta ativada
//    → [57] Ave – Caridade
//    → [56] Ave – Esperança
//    → [55] Ave – Fé
//    → [54] Glória ao Pai   ← última conta do pingente
//    → entra no laço (dezenas)
//
//  Nas dezenas: a conta Pai Nosso separadora acende junto com
//  "Glória ao Pai" (sem step intermediário visível ao usuário).
//
// ─────────────────────────────────────────────────────────────────

export type StepType =
  | "sinal"
  | "credo"
  | "pai"
  | "ave"
  | "gloria"
  | "fatima"
  | "misterio"
  | "gracas"
  | "salve";

export type Step = {
  type: StepType;
  label: string;
  hasBead: boolean;
  beadIndex?: number;
  meditation?: string;
};

// ── buildBeadArray ───────────────────────────────────────────────
export function buildBeadArray(): ("ave" | "pai")[] {
  const beads: ("ave" | "pai")[] = [];

  // Laço: 4 dezenas com separador + 5.ª dezena sem separador
  for (let d = 0; d < 5; d++) {
    for (let a = 0; a < 10; a++) beads.push("ave");
    if (d < 4) beads.push("pai");
  }
  // Total laço: 50 aves + 4 pais = 54

  // Pendente (cima → baixo): Pai Nosso → Ave×3 → Glória
  beads.push("pai"); // [54] Pai Nosso inicial  (mais próximo da medalha)
  beads.push("ave"); // [55] fé
  beads.push("ave"); // [56] esperança
  beads.push("ave"); // [57] caridade
  beads.push("pai"); // [58] Glória             (mais próximo do crucifixo)

  return beads; // length = 59
}

// Índices do laço
const DECADE_AVE_START = [0, 11, 22, 33, 44];
const DECADE_PAI_INDEX = [10, 21, 32, 43];

// ── generateRosaryFlow ───────────────────────────────────────────
export function generateRosaryFlow(
  mysteries: string[],
  meditations: string[]
): Step[] {
  const steps: Step[] = [];

  // ── Etapa inicial: Sinal + Credo (sem contas) ─────────────────────
  steps.push({ type: "sinal",  label: "Sinal da Cruz e Oferecimento", hasBead: false });
  steps.push({ type: "credo",  label: "Creio em Deus Pai",            hasBead: false });

  // ── Pendente — ativação de BAIXO para CIMA ────────────────────────
  // [58] Pai Nosso — primeira conta ativada (mais próxima do crucifixo)
  steps.push({ type: "pai",    label: "Pai Nosso",                    hasBead: true, beadIndex: 58 });
  // [57] Ave Maria – pela Caridade
  steps.push({ type: "ave",    label: "Ave Maria – pela Caridade",    hasBead: true, beadIndex: 57 });
  // [56] Ave Maria – pela Esperança
  steps.push({ type: "ave",    label: "Ave Maria – pela Esperança",   hasBead: true, beadIndex: 56 });
  // [55] Ave Maria – pela Fé
  steps.push({ type: "ave",    label: "Ave Maria – pela Fé",          hasBead: true, beadIndex: 55 });
  // [54] Glória — última conta do pingente (mais próxima da medalha)
  steps.push({ type: "gloria", label: "Glória ao Pai",                hasBead: true, beadIndex: 54 });

  // ── Laço — cinco dezenas ──────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    // Anúncio do mistério (sem conta)
    steps.push({
      type:       "misterio",
      label:      `${i + 1}º Mistério: ${mysteries[i]}`,
      hasBead:    false,
      meditation: meditations[i],
    });

    // Pai Nosso de abertura (sem conta)
    steps.push({ type: "pai", label: "Pai Nosso", hasBead: false });

    // 10 Ave Marias da dezena
    for (let j = 0; j < 10; j++) {
      steps.push({
        type:      "ave",
        label:     `Ave Maria  (${j + 1}/10)`,
        hasBead:   true,
        beadIndex: DECADE_AVE_START[i] + j,
      });
    }

    // ✅ "Pai Nosso (separador)" removido.
    // A conta Pai Nosso separadora agora acende junto com "Glória ao Pai",
    // que é o momento litúrgico correto — sem step intermediário visível.
    steps.push({
      type:      "gloria",
      label:     "Glória ao Pai",
      hasBead:   i < 4,                               // acende conta só nas 4 primeiras dezenas
      beadIndex: i < 4 ? DECADE_PAI_INDEX[i] : undefined,
    });

    steps.push({ type: "fatima", label: "Ó meu Jesus", hasBead: false });
  }

  // ── Final ─────────────────────────────────────────────────────────
  steps.push({ type: "gracas", label: "Ação de Graças à Nossa Senhora", hasBead: false });
  steps.push({ type: "salve",  label: "Salve Rainha",                   hasBead: false });

  return steps;
}
