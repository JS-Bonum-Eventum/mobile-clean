export type Mystery = {
  title: string;
  items: string[];
  meditations: string[];
};

const MYSTERIES = {
  gozosos: {
    title: "Mistérios Gozosos",
    items: [
      "A Anunciação",
      "A Visitação",
      "O Nascimento de Jesus",
      "A Apresentação no Templo",
      "Jesus encontrado no Templo",
    ],
    meditations: [
      "Maria acolhe com fé o plano de Deus.",
      "Maria leva Jesus aos outros com amor.",
      "Jesus nasce pobre para nos salvar.",
      "Maria oferece Jesus ao Pai.",
      "Jesus nos ensina a buscar as coisas do Pai.",
    ],
  },

  dolorosos: {
    title: "Mistérios Dolorosos",
    items: [
      "A Agonia no Horto",
      "A Flagelação",
      "A Coroação de Espinhos",
      "Jesus carregando a Cruz",
      "A Crucificação",
    ],
    meditations: [
      "Jesus aceita a vontade do Pai com amor.",
      "Jesus sofre por nossos pecados.",
      "Jesus é humilhado por amor a nós.",
      "Jesus carrega nossa cruz.",
      "Jesus entrega sua vida pela nossa salvação.",
    ],
  },

  gloriosos: {
    title: "Mistérios Gloriosos",
    items: [
      "A Ressurreição",
      "A Ascensão",
      "A Vinda do Espírito Santo",
      "A Assunção de Maria",
      "A Coroação de Maria",
    ],
    meditations: [
      "Cristo vence a morte e nos dá vida.",
      "Jesus sobe ao céu e nos prepara um lugar.",
      "O Espírito Santo fortalece a Igreja.",
      "Maria é elevada ao céu.",
      "Maria é coroada Rainha do Céu e da Terra.",
    ],
  },

  luminosos: {
    title: "Mistérios Luminosos",
    items: [
      "O Batismo de Jesus",
      "As Bodas de Caná",
      "A Proclamação do Reino",
      "A Transfiguração",
      "A Instituição da Eucaristia",
    ],
    meditations: [
      "Jesus revela-se como Filho amado do Pai.",
      "Maria intercede por nós.",
      "Jesus nos chama à conversão.",
      "Jesus revela sua glória divina.",
      "Jesus se entrega como alimento.",
    ],
  },
};

export function getMysteryOfDay(): Mystery {
  const day = new Date().getDay();

  if (day === 1 || day === 6) return MYSTERIES.gozosos;
  if (day === 2 || day === 5) return MYSTERIES.dolorosos;
  if (day === 3 || day === 0) return MYSTERIES.gloriosos;
  return MYSTERIES.luminosos;
}