export type Step = {
  type: "pai" | "ave" | "gloria" | "credo" | "fatima" | "misterio";
  label: string;
  hasBead: boolean;
  meditation?: string; // 👈 NOVO
};


export function generateRosaryFlow(
  mysteries: string[],
  meditations: string[]
): Step[] {
  const steps: Step[] = [];

  // Início
  steps.push({ type: "credo", label: "Creio em Deus Pai", hasBead: false });
  steps.push({ type: "pai", label: "Pai Nosso", hasBead: true });

  steps.push({ type: "ave", label: "Ave Maria", hasBead: true });
  steps.push({ type: "ave", label: "Ave Maria", hasBead: true });
  steps.push({ type: "ave", label: "Ave Maria", hasBead: true });

  steps.push({ type: "gloria", label: "Glória ao Pai", hasBead: false });

  for (let i = 0; i < 5; i++) {
    steps.push({
      type: "misterio",
      label: `${i + 1}º Mistério: ${mysteries[i]}`,
      hasBead: false,
      meditation: meditations[i], // 👈 NOVO
    });

    steps.push({ type: "pai", label: "Pai Nosso", hasBead: true });

    for (let j = 0; j < 10; j++) {
      steps.push({ type: "ave", label: "Ave Maria", hasBead: true });
    }

    steps.push({ type: "gloria", label: "Glória ao Pai", hasBead: false });
    steps.push({ type: "fatima", label: "Ó meu Jesus", hasBead: false });
  }

  return steps;
}