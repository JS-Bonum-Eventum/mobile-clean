import React from "react";
import Svg, {
  Circle, Line, Path, Ellipse, G, Image,
  Defs, RadialGradient, LinearGradient, Stop,
} from "react-native-svg";

// ── Cores ──────────────────────────────────────────────────────────────
// AZUL  = idle  (ainda não rezada)
// ROSA  = active (já rezada / concluída)
const BEAD_AVE_IDLE   = "#4FC3F7";
const BEAD_AVE_ACTIVE = "#C2185B";
const BEAD_PAI_IDLE   = "#0288D1";
const BEAD_PAI_ACTIVE = "#880E4F";
const BEAD_CURR       = "#FFD54F";
const STRING_COLOR    = "#8D6E63";

type Props = {
  beads: ("ave" | "pai")[];
  active: boolean[];
  current: number;
  onPress: (index: number) => void;
  width: number;
  height: number;
};

export function RealisticRosary({ beads, active, current, onPress, width, height }: Props) {

  const LOOP_COUNT = 54;
  const BEAD_R_AVE = 6.0;
  const BEAD_R_PAI = 9.5;

  // ── Oval achatada: rx muito maior que ry ─────────────────────────────
  // Achatada 40% na vertical: ry = 60% do valor que seria proporcional a rx.
  // Parte MAIOR = horizontal. Medalha = ponto INFERIOR da oval.
  const ovalCX = width  * 0.50;
  const ovalCY = height * 0.24;   // centro alto para caber oval + pingente + crucifixo
  const ovalRX = width  * 0.40;   // raio horizontal generoso
  const ovalRY = height * 0.17;   // raio vertical achatado (≈ 40% a menos do que seria proporcional)

  // ── Medalha 20% menor que o original ────────────────────────────────
  // Original: medalR = BEAD_R_PAI * 3.0 → novo: * 2.4  (−20%)
  const medalR = BEAD_R_PAI * 2.4;

  // Ponto mais baixo da oval
  const ovalBottomX = ovalCX;
  const ovalBottomY = ovalCY + ovalRY;

  // ── Fio entre oval e medalha encurtado em 70% ────────────────────────
  // Original: gap ≈ 4×BEAD_R_AVE + 8 ≈ 32px  →  30% = ~9.6px
  const shortGap = (BEAD_R_AVE * 4 + 8) * 0.30;
  const medalX   = ovalBottomX;
  const medalY   = ovalBottomY + medalR + shortGap;

  // ── Ângulo livre para a medalha na oval ──────────────────────────────
  const medalHalfArcRad = Math.asin(
    Math.min(1, (medalR + BEAD_R_AVE * 1.8) / ovalRX)
  );

  const startAngle = Math.PI / 2 + medalHalfArcRad;
  const arcSpan    = 2 * Math.PI - 2 * medalHalfArcRad;

  // Distribui as 54 contas uniformemente no arco disponível
  const loopPts: { x: number; y: number }[] = [];
  for (let k = 0; k < LOOP_COUNT; k++) {
    const a = startAngle + (k / (LOOP_COUNT - 1)) * arcSpan;
    loopPts.push({
      x: ovalCX + ovalRX * Math.cos(a),
      y: ovalCY + ovalRY * Math.sin(a),
    });
  }

  // Conexão lateral da medalha
  const medalLeftX  = medalX - medalR;
  const medalRightX = medalX + medalR;
  const medalSideY  = medalY;

  // ── Pendente ──────────────────────────────────────────────────────────
  const PEND_X       = medalX;
  const PEND_SPACING = 19;
  const pendCount    = beads.length - LOOP_COUNT; // 5

  const pendStartY = medalY + medalR + BEAD_R_PAI + 5;
  const lastPendY  = pendStartY + (pendCount - 1) * PEND_SPACING;
  const crossTopY  = lastPendY + PEND_SPACING;
  const crossH     = medalR * 1.4;
  const crossW     = crossH * 0.62;

  // ── SVG ───────────────────────────────────────────────────────────────
  const els: React.ReactNode[] = [];

  // DEFS
  els.push(
    <Defs key="defs">
      {/* Ave idle = azul */}
      <RadialGradient id="gAI" cx="35%" cy="30%" r="65%">
        <Stop offset="0%"   stopColor="#B3E5FC" />
        <Stop offset="50%"  stopColor={BEAD_AVE_IDLE} />
        <Stop offset="100%" stopColor="#0277BD" />
      </RadialGradient>
      {/* Ave active = rosa */}
      <RadialGradient id="gAA" cx="35%" cy="30%" r="65%">
        <Stop offset="0%"   stopColor="#F48FB1" />
        <Stop offset="50%"  stopColor={BEAD_AVE_ACTIVE} />
        <Stop offset="100%" stopColor="#4A0035" />
      </RadialGradient>
      {/* Pai idle = azul médio */}
      <RadialGradient id="gPI" cx="35%" cy="30%" r="65%">
        <Stop offset="0%"   stopColor="#B3E5FC" />
        <Stop offset="50%"  stopColor={BEAD_PAI_IDLE} />
        <Stop offset="100%" stopColor="#01579B" />
      </RadialGradient>
      {/* Pai active = roxo-escuro */}
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

  // ── Cordão do laço ────────────────────────────────────────────────────
  for (let i = 0; i < LOOP_COUNT - 1; i++) {
    els.push(
      <Line key={`ll${i}`}
        x1={loopPts[i].x}     y1={loopPts[i].y}
        x2={loopPts[i + 1].x} y2={loopPts[i + 1].y}
        stroke={STRING_COLOR} strokeWidth={1.6}
      />
    );
  }

  // Fio base-dir → borda direita da medalha
  els.push(
    <Line key="s-right-medal"
      x1={loopPts[LOOP_COUNT - 1].x} y1={loopPts[LOOP_COUNT - 1].y}
      x2={medalRightX}               y2={medalSideY}
      stroke={STRING_COLOR} strokeWidth={1.6}
    />
  );

  // Fio borda esquerda da medalha → base-esq
  els.push(
    <Line key="s-left-medal"
      x1={medalLeftX} y1={medalSideY}
      x2={loopPts[0].x} y2={loopPts[0].y}
      stroke={STRING_COLOR} strokeWidth={1.6}
    />
  );

  // ── Medalha ────────────────────────────────────────────────────────────
  els.push(
    <G key="medal">
      <Circle cx={medalX} cy={medalY} r={medalR + 2.5}
        fill="none" stroke="#FFD700" strokeWidth={1.2} strokeDasharray="4,3" />
      <Circle cx={medalX} cy={medalY} r={medalR}
        fill="url(#gMedal)" stroke="#C8A000" strokeWidth={1.8} />
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

  // ── Contas do laço ────────────────────────────────────────────────────
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
      stroke={STRING_COLOR} strokeWidth={1.6}
    />
  );

  // ── Pendente ──────────────────────────────────────────────────────────
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
          x1={PEND_X} y1={py}
          x2={PEND_X} y2={py + PEND_SPACING}
          stroke={STRING_COLOR} strokeWidth={1.6}
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

  // Cordão: última conta → crucifixo
  els.push(
    <Line key="s-pend-cross"
      x1={PEND_X} y1={lastPendY + BEAD_R_PAI}
      x2={PEND_X} y2={crossTopY}
      stroke={STRING_COLOR} strokeWidth={1.6}
    />
  );

  // ── Crucifixo ─────────────────────────────────────────────────────────
  const barY = crossTopY + crossH * 0.28;
  els.push(
    <G key="crucifix">
      <Path d={`M ${PEND_X} ${crossTopY} L ${PEND_X} ${crossTopY + crossH}`}
        stroke="url(#gCross)" strokeWidth={5.5} strokeLinecap="round" />
      <Path d={`M ${PEND_X - crossW / 2} ${barY} L ${PEND_X + crossW / 2} ${barY}`}
        stroke="url(#gCross)" strokeWidth={5.5} strokeLinecap="round" />
      <Circle cx={PEND_X} cy={crossTopY + crossH * 0.13}
        r={crossH * 0.075} fill="#D4A873" />
      <Ellipse cx={PEND_X} cy={crossTopY + crossH * 0.44}
        rx={crossH * 0.075} ry={crossH * 0.15} fill="#D4A873" />
      <Path d={`M ${PEND_X - crossW * 0.36} ${barY + 2} L ${PEND_X + crossW * 0.36} ${barY + 2}`}
        stroke="#D4A873" strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx={PEND_X} cy={crossTopY + crossH * 0.04}
        rx={crossH * 0.14} ry={crossH * 0.045}
        fill="#7B5800" opacity={0.8} />
    </G>
  );

  return <Svg width={width} height={height}>{els}</Svg>;
}
