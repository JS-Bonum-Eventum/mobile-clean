// ─────────────────────────────────────────────────────────────────
//  rosaryFlow.ts  –  Fluxo completo do terço (sequência litúrgica)
// ─────────────────────────────────────────────────────────────────
//
//  Layout do array beads[] (ordem de renderização na oval):
//
//  LAÇO — 54 contas, percorrendo a oval do ponto base-esquerda
//         (logo após a medalha) até o ponto base-direita (logo antes da medalha):
//
//    [0..9]   → 1.ª dezena (10 Ave Marias)
//    [10]     → Pai Nosso  (separador após a 1.ª dezena)
//    [11..20] → 2.ª dezena (10 Ave Marias)
//    [21]     → Pai Nosso  (separador após a 2.ª dezena)
//    [22..31] → 3.ª dezena (10 Ave Marias)
//    [32]     → Pai Nosso  (separador após a 3.ª dezena)
//    [33..42] → 4.ª dezena (10 Ave Marias)
//    [43]     → Pai Nosso  (separador após a 4.ª dezena)
//    [44..53] → 5.ª dezena (10 Ave Marias — SEM Pai Nosso ao final)
//
//  Conexões:
//    · Índice [0]  (1.ª conta da 1.ª dezena) → base-ESQUERDA da oval (conecta à esquerda da medalha)
//    · Índice [53] (10.ª conta da 5.ª dezena) → base-DIREITA da oval (conecta à direita da medalha)
//
//  PENDENTE — 5 contas (abaixo da medalha, de cima para baixo):
//    [54] Pai Nosso inicial (conta grande)   — mais próximo da medalha
//    [55] Ave Maria – pela Fé
//    [56] Ave Maria – pela Esperança
//    [57] Ave Maria – pela Caridade
//    [58] Glória ao Pai (conta grande)       — mais próximo do crucifixo
//    → crucifixo (visual, sem conta)
//
//  FLUXO LITÚRGICO — ordem de oração:
//  A ativação de contas inicia pelo pendente de BAIXO para CIMA:
//    crucifixo → [58]Gloria → [57]Ave → [56]Ave → [55]Ave → [54]PaiNosso
//  Em seguida entra no laço pela base ESQUERDA, subindo pelo lado esquerdo:
//    [0..9] 1.ª dezena → [10]PaiNosso → [11..20] 2.ª dezena → ... → [44..53] 5.ª dezena
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
// Ordem de renderização: laço [0-53] + pendente [54-58]
//
// Composição do laço (ordem percorrida na oval, da base-esq para base-dir):
//   1.ª dezena: Ave×10 [0-9]  + Pai Nosso [10]
//   2.ª dezena: Ave×10 [11-20] + Pai Nosso [21]
//   3.ª dezena: Ave×10 [22-31] + Pai Nosso [32]
//   4.ª dezena: Ave×10 [33-42] + Pai Nosso [43]
//   5.ª dezena: Ave×10 [44-53] (somente — sem Pai Nosso ao final)
export function buildBeadArray(): ("ave" | "pai")[] {
  const beads: ("ave" | "pai")[] = [];

  // Laço: 4 dezenas com Pai Nosso separador + 5.ª dezena sem Pai Nosso
  for (let d = 0; d < 5; d++) {
    for (let a = 0; a < 10; a++) beads.push("ave"); // 10 Ave Marias
    if (d < 4) beads.push("pai");                   // Pai Nosso separador (exceto após a 5.ª dezena)
  }
  // Total laço: 50 aves + 4 pais = 54 ✓

  // Pendente (ordem visual de cima para baixo: Pai Nosso → Ave×3 → Gloria)
  beads.push("pai"); // [54] Pai Nosso inicial  (mais próximo da medalha)
  beads.push("ave"); // [55] fé
  beads.push("ave"); // [56] esperança
  beads.push("ave"); // [57] caridade
  beads.push("pai"); // [58] Glória (conta grande, mais próxima do crucifixo)

  return beads; // length = 59
}

// ── Mapeamento de índices no laço ───────────────────────────────
// 1.ª dezena: Ave[0-9]   | PaiNosso[10]
// 2.ª dezena: Ave[11-20] | PaiNosso[21]
// 3.ª dezena: Ave[22-31] | PaiNosso[32]
// 4.ª dezena: Ave[33-42] | PaiNosso[43]
// 5.ª dezena: Ave[44-53] (sem Pai Nosso ao final)
const DECADE_AVE_START = [0, 11, 22, 33, 44];
const DECADE_PAI_INDEX = [10, 21, 32, 43]; // separadores entre dezenas (após cada dezena exceto a 5.ª)

// ── generateRosaryFlow ───────────────────────────────────────────
//
// FLUXO VISUAL sincronizado com o terço:
//
// A ativação de contas inicia no pendente, de BAIXO para CIMA
// (a mudança de cor começa na conta mais próxima do crucifixo):
//
//   Etapa inicial (pendente, de baixo para cima):
//     sinal     → sem conta   (Sinal da Cruz — antes de tudo)
//     credo     → sem conta   (Creio em Deus Pai)
//     gloria    → bead [58]   Glória (mais próximo do crucifixo — PRIMEIRA conta ativada)
//     ave×3     → beads [57][56][55]  (subindo em direção à medalha)
//     pai       → bead [54]   Pai Nosso inicial (mais próximo da medalha)
//
//   Etapa dezenas (laço, subindo pelo lado esquerdo da oval):
//   Para cada mistério i (0-4):
//     misterio  → sem conta
//     pai       → sem conta (rezado sobre a conta grande que ENCERROU a dezena anterior)
//     ave×10    → beads DECADE_AVE_START[i]+0..9
//     [pai]     → bead DECADE_PAI_INDEX[i] acende APÓS as 10 Ave Marias
//                 (exceto 5.ª dezena, sem conta extra)
//     gloria    → sem conta
//     fatima    → sem conta
//
// ─────────────────────────────────────────────────────────────────
export function generateRosaryFlow(
  mysteries: string[],
  meditations: string[]
): Step[] {
  const steps: Step[] = [];

  // 1. Sinal da Cruz + Oferecimento
  steps.push({ type: "sinal", label: "Sinal da Cruz e Oferecimento", hasBead: false });

  // 2. Credo
  steps.push({ type: "credo", label: "Creio em Deus Pai", hasBead: false });

  // 3. Glória → pendente [58]  (MAIS PRÓXIMO DO CRUCIFIXO — primeira conta ativada)
  steps.push({ type: "gloria", label: "Glória ao Pai", hasBead: true, beadIndex: 58 });

  // 4. Três Ave Marias → [57][56][55]  (subindo em direção à medalha)
  steps.push({ type: "ave", label: "Ave Maria – pela Caridade",  hasBead: true, beadIndex: 57 });
  steps.push({ type: "ave", label: "Ave Maria – pela Esperança", hasBead: true, beadIndex: 56 });
  steps.push({ type: "ave", label: "Ave Maria – pela Fé",        hasBead: true, beadIndex: 55 });

  // 5. Pai Nosso inicial → pendente [54]  (mais próximo da medalha, topo do pendente)
  steps.push({ type: "pai", label: "Pai Nosso", hasBead: true, beadIndex: 54 });

  // 6. Cinco mistérios — laço da oval
  for (let i = 0; i < 5; i++) {
    // Anúncio do mistério
    steps.push({
      type: "misterio",
      label: `${i + 1}º Mistério: ${mysteries[i]}`,
      hasBead: false,
      meditation: meditations[i],
    });

    // Pai Nosso de abertura da dezena (sem bead — a conta grande será acesa
    // ao final das 10 Ave Marias para as dezenas 1-4, ou sem conta para a 5.ª)
    steps.push({ type: "pai", label: "Pai Nosso", hasBead: false });

    // 10 Ave Marias da dezena
    for (let j = 0; j < 10; j++) {
      steps.push({
        type: "ave",
        label: `Ave Maria  (${j + 1}/10)`,
        hasBead: true,
        beadIndex: DECADE_AVE_START[i] + j,
      });
    }

    // Acende a conta Pai Nosso separadora APÓS as 10 Ave Marias (dezenas 1-4)
    if (i < 4) {
      steps.push({ type: "pai", label: "Pai Nosso (separador)", hasBead: true, beadIndex: DECADE_PAI_INDEX[i] });
    }

    // Glória (sem conta)
    steps.push({ type: "gloria", label: "Glória ao Pai", hasBead: false });

    // Fátima (sem conta)
    steps.push({ type: "fatima", label: "Ó meu Jesus", hasBead: false });
  }

  // 7. Oração de Ação de Graças
  steps.push({ type: "gracas", label: "Ação de Graças à Nossa Senhora", hasBead: false });

  // 8. Salve Rainha (tela especial)
  steps.push({ type: "salve", label: "Salve Rainha", hasBead: false });

  return steps;
}
