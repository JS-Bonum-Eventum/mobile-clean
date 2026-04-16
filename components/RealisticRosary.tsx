import React from "react";
import Svg, { Circle, Line, Path } from "react-native-svg";

const LIGHT = "#8ecae6";
const DARK = "#023047";
const STRING = "#8d6e63"; // cordão
const METAL = "#c0c0c0"; // medalha/cruz

type Props = {
  beads: ("ave" | "pai")[];
  active: boolean[];
  current: number;
  onPress: (index: number) => void;
  width: number;
  height: number;
};

export function RealisticRosary({
  beads,
  active,
  current,
  onPress,
  width,
  height,
}: Props) {
  const cx = width / 2;
  const cy = height * 0.38;

  const rx = width * 0.33;
  const ry = height * 0.22;

  const elements: any[] = [];

  let index = 0;
  const loopCount = 54;

  let prevX = 0;
  let prevY = 0;

  // 🔵 LAÇO PRINCIPAL
  for (let i = 0; i < loopCount; i++) {
    const angle = (i / loopCount) * 2 * Math.PI;

    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);

    // cordão
    if (i > 0) {
      elements.push(
        <Line
          key={`line-${i}`}
          x1={prevX}
          y1={prevY}
          x2={x}
          y2={y}
          stroke={STRING}
          strokeWidth={2}
        />
      );
    }

    const type = beads[index];

    elements.push(
      <Circle
        key={`bead-${index}`}
        cx={x}
        cy={y}
        r={type === "pai" ? 8 : 5}
        fill={active[index] ? DARK : LIGHT}
        stroke={index === current ? "#ffd166" : "none"}
        strokeWidth={2}
        onPress={() => onPress(index)}
      />
    );

    prevX = x;
    prevY = y;
    index++;
  }

  // fechar o laço
  const firstAngle = 0;
  const firstX = cx + rx * Math.cos(firstAngle);
  const firstY = cy + ry * Math.sin(firstAngle);

  elements.push(
    <Line
      key="close-loop"
      x1={prevX}
      y1={prevY}
      x2={firstX}
      y2={firstY}
      stroke={STRING}
      strokeWidth={2}
    />
  );

  // 🔘 MEDALHA CENTRAL
  const medalY = cy + ry + 20;

  elements.push(
    <Circle
      key="medal"
      cx={cx}
      cy={medalY}
      r={10}
      fill={METAL}
    />
  );

  // 🔽 PARTE PENDENTE
  let prevPendY = medalY;
  let prevPendX = cx;

  for (; index < beads.length; index++) {
    const y = medalY + (index - loopCount + 1) * 22;

    elements.push(
      <Line
        key={`pend-line-${index}`}
        x1={prevPendX}
        y1={prevPendY}
        x2={cx}
        y2={y}
        stroke={STRING}
        strokeWidth={2}
      />
    );

    elements.push(
      <Circle
        key={`pend-bead-${index}`}
        cx={cx}
        cy={y}
        r={beads[index] === "pai" ? 8 : 5}
        fill={active[index] ? DARK : LIGHT}
        stroke={index === current ? "#ffd166" : "none"}
        strokeWidth={2}
        onPress={() => onPress(index)}
      />
    );

    prevPendY = y;
  }

  // ✝️ CRUCIFIXO (simples mas elegante)
  const crossY = prevPendY + 30;

  elements.push(
    <Line
      key="cross-vertical"
      x1={cx}
      y1={crossY}
      x2={cx}
      y2={crossY + 40}
      stroke={METAL}
      strokeWidth={4}
    />
  );

  elements.push(
    <Line
      key="cross-horizontal"
      x1={cx - 15}
      y1={crossY + 15}
      x2={cx + 15}
      y2={crossY + 15}
      stroke={METAL}
      strokeWidth={4}
    />
  );

  return <Svg width={width} height={height}>{elements}</Svg>;
}