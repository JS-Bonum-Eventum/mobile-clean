import React from "react";
import Svg, {
  Circle, Line, Path, Ellipse, G, Image,
  Defs, RadialGradient, LinearGradient, Stop,
} from "react-native-svg";

// ── Cores ──────────────────────────────────────────────────────────────
// AZUL  = idle  (ainda não rezada)
// ROSA  = active (já rezada / concluída)
const BEAD_AVE_IDLE   = "#4FC3F7"; // Ave Maria — idle (azul claro)
const BEAD_AVE_ACTIVE = "#C2185B"; // Ave Maria — active (rosa escuro)
const BEAD_PAI_IDLE   = "#0288D1"; // Pai Nosso — idle (azul médio)
const BEAD_PAI_ACTIVE = "#880E4F"; // Pai Nosso — active (roxo-escuro)
const BEAD_CURR       = "#FFD54F"; // Conta atual em destaque
const STRING_COLOR    = "#8D6E63";

type Props = {
  beads: ("ave" | "pai")[];
  active: boolean[];
  current: number;
  onPress: (index: number) => void;
  width: number;
  height: number;
};

// ── Gera pontos distribuídos em uma elipse ────────────────────────────
// A oval tem a parte MAIOR para cima (semi-eixo vertical maior = ry).
// A medalha fica na parte INFERIOR (ângulo = π/2 = ponto mais baixo).
// Distribuição começa em startAngle, percorrendo no sentido horário.
//
// Layout:
//   startAngle  = π/2 + pequeno offset  → logo à ESQUERDA da medalha (base da oval)
//   Percorre horário: base-esq → lado esq (subindo) → topo → lado dir (descendo) → base-dir
//   Índice [0]  = base-esquerda da oval   → conecta à esquerda da medalha
//   Índice [53] = base-direita  da oval   → conecta à direita  da medalha
function distributeOnEllipse(
  n: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startAngle: number,
): { x: number; y: number }[] {
  const SAMPLE = 4000;
  const pts: { x: number; y: number; s: number }[] = [];
  let s = 0;
  const ptAt = (a: number) => ({
    x: cx + rx * Math.cos(a),
    y: cy + ry * Math.sin(a),
  });
  let prev = ptAt(startAngle);
  pts.push({ ...prev, s: 0 });
  for (let i = 1; i <= SAMPLE; i++) {
    const a = startAngle + (i / SAMPLE) * 2 * Math.PI;
    const pt = ptAt(a);
    const dx = pt.x - prev.x;
    const dy = pt.y - prev.y;
    s += Math.sqrt(dx * dx + dy * dy);
    pts.push({ ...pt, s });
    prev = pt;
  }
  const total = s;
  const step  = total / n;

  const result: { x: number; y: number }[] = [];
  let si = 0;
  for (let k = 0; k < n; k++) {
    const target = k * step;
    while (si < pts.length - 1 && pts[si + 1].s < target) si++;
    if (si >= pts.length - 1) {
      result.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
    } else {
      const a = pts[si], b = pts[si + 1];
      const ratio = b.s === a.s ? 0 : (target - a.s) / (b.s - a.s);
      result.push({
        x: a.x + ratio * (b.x - a.x),
        y: a.y + ratio * (b.y - a.y),
      });
    }
  }
  return result;
}

export function RealisticRosary({ beads, active, current, onPress, width, height }: Props) {

  const LOOP_COUNT  = 54;
  const BEAD_R_AVE  = 6.5;
  const BEAD_R_PAI  = 10.5;

  // ── Centro e dimensões da oval ────────────────────────────────────────
  // Oval com parte maior para CIMA, medalha posicionada no PONTO INFERIOR.
  // rx = semi-eixo horizontal; ry = semi-eixo vertical (maior, esticado para cima)
  const ovalCX = width  * 0.50;
  const ovalCY = height * 0.35;   // centro ligeiramente acima do meio
  const ovalRX = width  * 0.33;   // raio horizontal
  const ovalRY = height * 0.30;   // raio vertical (oval esticada verticalmente)

  // ── Medalha: posicionada no ponto mais BAIXO da oval ─────────────────
  const medalR = BEAD_R_PAI * 3.0;

  // Ponto mais baixo da oval (ângulo = π/2)
  const ovalBottomX = ovalCX;
  const ovalBottomY = ovalCY + ovalRY;

  // A medalha fica centrada no ponto inferior da oval.
  // Gap duplo em relação às Ave Marias (espaçamento = 2 × diâmetro de Ave Maria)
  const doubleGap = BEAD_R_AVE * 2 * 2 + 8; // gap duplo
  const medalX    = ovalBottomX;
  const medalY    = ovalBottomY + medalR + doubleGap * 0.5;

  // ── Ângulo de separação da medalha na oval ────────────────────────────
  // As contas do laço NÃO passam pelo ponto da medalha; deixamos um arco
  // livre proporcional ao diâmetro da medalha para que ela fique "encaixada".
  const medalHalfArcRad = Math.asin(
    Math.min(1, (medalR + BEAD_R_AVE * 2.4) / ovalRX)
  );

  // Ângulo do ponto mais baixo = π/2
  // Índice [0]  começa logo após a medalha, sentido anti-horário (lado esquerdo)
  // Índice [53] termina logo antes da medalha, lado direito
  // Percurso: começa em (π/2 + gap) e percorre 2π - 2*gap no sentido anti-horário
  // (ângulo crescente = sentido horário no SVG; usamos negativo para ir anti-horário)
  //
  // Para o SVG: ângulo crescente → horário (y aumenta para baixo).
  // Queremos: 0 = base-esquerda, percorre anti-horário (sobe pelo lado esquerdo,
  // passa pelo topo, desce pelo lado direito, chega na base-direita).
  // Isso equivale a startAngle = π/2 + gap, e cada passo SUBTRAI dθ.
  // Simplificação: usamos startAngle = π/2 + gap e damos a volta completa
  // menos o arco da medalha, mapeando para ângulos crescentes (horário).

  const startAngle = Math.PI / 2 + medalHalfArcRad; // base-esquerda
  const arcSpan    = 2 * Math.PI - 2 * medalHalfArcRad; // arco disponível
  
  // Gera os N pontos ao longo do arco disponível
  const loopPts: { x: number; y: number }[] = [];
  for (let k = 0; k < LOOP_COUNT; k++) {
    const a = startAngle + (k / (LOOP_COUNT - 1)) * arcSpan;
    loopPts.push({
      x: ovalCX + ovalRX * Math.cos(a),
      y: ovalCY + ovalRY * Math.sin(a),
    });
  }

  // Ponto de conexão na borda da medalha (esquerda e direita)
  const medalLeftX  = medalX - medalR;
  const medalRightX = medalX + medalR;
  const medalSideY  = medalY;

  // ── Pendente: desce da base da medalha verticalmente ─────────────────
  const PEND_X       = medalX;
  const PEND_SPACING = 22;
  const pendCount    = beads.length - LOOP_COUNT; // 5

  // Primeira conta do pendente: logo abaixo da medalha
  const pendStartY = medalY + medalR + BEAD_R_PAI + 10;

  const lastPendY  = pendStartY + (pendCount - 1) * PEND_SPACING;
  const crossTopY  = lastPendY + PEND_SPACING;
  const crossH     = medalR * 1.6;
  const crossW     = crossH * 0.62;

  // ── Build SVG elements ─────────────────────────────────────────────
  const els: React.ReactNode[] = [];

  // DEFS
  els.push(
    <Defs key="defs">
      {/* Ave Maria idle = azul claro (ainda não rezada) */}
      <RadialGradient id="gAI" cx="35%" cy="30%" r="65%">
        <Stop offset="0%"   stopColor="#B3E5FC" />
        <Stop offset="50%"  stopColor={BEAD_AVE_IDLE} />
        <Stop offset="100%" stopColor="#0277BD" />
      </RadialGradient>
      {/* Ave Maria active = rosa escuro (já rezada) */}
      <RadialGradient id="gAA" cx="35%" cy="30%" r="65%">
        <Stop offset="0%"   stopColor="#F48FB1" />
        <Stop offset="50%"  stopColor={BEAD_AVE_ACTIVE} />
        <Stop offset="100%" stopColor="#4A0035" />
      </RadialGradient>
      {/* Pai Nosso idle = azul médio (ainda não rezado) */}
      <RadialGradient id="gPI" cx="35%" cy="30%" r="65%">
        <Stop offset="0%"   stopColor="#B3E5FC" />
        <Stop offset="50%"  stopColor={BEAD_PAI_IDLE} />
        <Stop offset="100%" stopColor="#01579B" />
      </RadialGradient>
      {/* Pai Nosso active = roxo-escuro (já rezado) */}
      <RadialGradient id="gPA" cx="35%" cy="30%" r="65%">
        <Stop offset="0%"   stopColor="#CE93D8" />
        <Stop offset="50%"  stopColor={BEAD_PAI_ACTIVE} />
        <Stop offset="100%" stopColor="#3E0020" />
      </RadialGradient>
      <RadialGradient id="gMedal" cx="40%" cy="30%" r="65%">
        <Stop offset="0%"   stopColor="#FFFDE7" />
        <Stop offset="40%"  stopColor="#FFD700" />
        <Stop offset="100%" stopColor="#B8860B" />
      </RadialGradient>
      <LinearGradient id="gCross" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%"   stopColor="#FFE082" />
        <Stop offset="50%"  stopColor="#C8A000" />
        <Stop offset="100%" stopColor="#7B5800" />
      </LinearGradient>
    </Defs>
  );

  // ── LAÇO: cordão entre contas (excluindo o arco da medalha) ──────────
  for (let i = 0; i < LOOP_COUNT - 1; i++) {
    els.push(
      <Line key={`ll${i}`}
        x1={loopPts[i].x} y1={loopPts[i].y}
        x2={loopPts[i + 1].x} y2={loopPts[i + 1].y}
        stroke={STRING_COLOR} strokeWidth={1.8}
      />
    );
  }

  // ── Fio: última conta (base-dir) → borda direita da medalha ──────────
  const bead53 = loopPts[LOOP_COUNT - 1];
  els.push(
    <Line key="s-right-medal"
      x1={bead53.x} y1={bead53.y}
      x2={medalRightX} y2={medalSideY}
      stroke={STRING_COLOR} strokeWidth={1.8}
    />
  );

  // ── Fio: borda esquerda da medalha → 1.ª conta (base-esq) ────────────
  const bead0 = loopPts[0];
  els.push(
    <Line key="s-left-medal"
      x1={medalLeftX} y1={medalSideY}
      x2={bead0.x} y2={bead0.y}
      stroke={STRING_COLOR} strokeWidth={1.8}
    />
  );

  // ── MEDALHA DE NOSSA SENHORA ───────────────────────────────────────
  els.push(
    <G key="medal">
      {/* Anel externo dourado */}
      <Circle cx={medalX} cy={medalY} r={medalR + 3}
        fill="none" stroke="#FFD700" strokeWidth={1.5} strokeDasharray="4,3" />
      {/* Fundo dourado da medalha */}
      <Circle cx={medalX} cy={medalY} r={medalR}
        fill="url(#gMedal)" stroke="#C8A000" strokeWidth={2} />
      {/* Imagem de Nossa Senhora (mary.png) */}
      <Image
        href={require("@/assets/images/mary.png")}
        x={medalX - medalR * 0.85}
        y={medalY - medalR * 0.85}
        width={medalR * 1.7}
        height={medalR * 1.7}
        preserveAspectRatio="xMidYMid meet"
      />
    </G>
  );

  // ── LAÇO: contas (desenhadas DEPOIS do cordão e medalha) ──────────────
  for (let i = 0; i < LOOP_COUNT; i++) {
    const { x, y } = loopPts[i];
    const isPai    = beads[i] === "pai";
    const isActive = active[i];
    const isCurr   = i === current;
    const r        = isPai ? BEAD_R_PAI : BEAD_R_AVE;
    const grad     = isPai ? (isActive ? "gPA" : "gPI") : (isActive ? "gAA" : "gAI");
    els.push(
      <Circle key={`lb${i}`}
        cx={x} cy={y} r={r}
        fill={`url(#${grad})`}
        stroke={isCurr ? BEAD_CURR : isPai ? "#01579B" : "#0277BD"}
        strokeWidth={isCurr ? 2.5 : 0.8}
        onPress={() => onPress(i)}
      />
    );
  }

  // ── Fio: base da medalha → 1.ª conta do pendente ─────────────────────
  els.push(
    <Line key="s-medal-pend"
      x1={medalX} y1={medalY + medalR}
      x2={PEND_X} y2={pendStartY - BEAD_R_PAI}
      stroke={STRING_COLOR} strokeWidth={1.8}
    />
  );

  // ── PENDENTE: cordão e contas ─────────────────────────────────────────
  for (let j = 0; j < pendCount; j++) {
    const idx      = LOOP_COUNT + j;
    const py       = pendStartY + j * PEND_SPACING;
    const isPai    = beads[idx] === "pai";
    const isActive = active[idx];
    const isCurr   = idx === current;
    const r        = isPai ? BEAD_R_PAI : BEAD_R_AVE;
    const grad     = isPai ? (isActive ? "gPA" : "gPI") : (isActive ? "gAA" : "gAI");

    if (j < pendCount - 1) {
      els.push(
        <Line key={`ps${j}`}
          x1={PEND_X} y1={py} x2={PEND_X} y2={py + PEND_SPACING}
          stroke={STRING_COLOR} strokeWidth={1.8}
        />
      );
    }

    els.push(
      <Circle key={`pb${j}`}
        cx={PEND_X} cy={py} r={r}
        fill={`url(#${grad})`}
        stroke={isCurr ? BEAD_CURR : isPai ? "#01579B" : "#0277BD"}
        strokeWidth={isCurr ? 2.5 : 0.8}
        onPress={() => onPress(idx)}
      />
    );
  }

  // ── Cordão: última conta → crucifixo ─────────────────────────────────
  els.push(
    <Line key="s-pend-cross"
      x1={PEND_X} y1={lastPendY + BEAD_R_PAI}
      x2={PEND_X} y2={crossTopY}
      stroke={STRING_COLOR} strokeWidth={1.8}
    />
  );

  // ── CRUCIFIXO (dourado contemplativo) ─────────────────────────────────
  const barY = crossTopY + crossH * 0.28;
  els.push(
    <G key="crucifix">
      {/* Barra vertical */}
      <Path d={`M ${PEND_X} ${crossTopY} L ${PEND_X} ${crossTopY + crossH}`}
        stroke="url(#gCross)" strokeWidth={6} strokeLinecap="round" />
      {/* Barra horizontal */}
      <Path d={`M ${PEND_X - crossW / 2} ${barY} L ${PEND_X + crossW / 2} ${barY}`}
        stroke="url(#gCross)" strokeWidth={6} strokeLinecap="round" />
      {/* Cabeça de Cristo */}
      <Circle cx={PEND_X} cy={crossTopY + crossH * 0.13}
        r={crossH * 0.075} fill="#D4A873" />
      {/* Tronco */}
      <Ellipse cx={PEND_X} cy={crossTopY + crossH * 0.44}
        rx={crossH * 0.075} ry={crossH * 0.15} fill="#D4A873" />
      {/* Braços */}
      <Path d={`M ${PEND_X - crossW * 0.36} ${barY + 2} L ${PEND_X + crossW * 0.36} ${barY + 2}`}
        stroke="#D4A873" strokeWidth={4.5} strokeLinecap="round" />
      {/* Placa INRI */}
      <Ellipse cx={PEND_X} cy={crossTopY + crossH * 0.04}
        rx={crossH * 0.14} ry={crossH * 0.045}
        fill="#7B5800" opacity={0.8} />
    </G>
  );

  return <Svg width={width} height={height}>{els}</Svg>;
}
