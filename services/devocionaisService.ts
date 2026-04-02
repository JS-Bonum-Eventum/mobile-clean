export type Tema =
  | "Saúde"
  | "Ansiedade"
  | "Depressão"
  | "Gratidão"
  | "Família"
  | "Solidão"
  | "Paciência"
  | "Ira"
  | "Tristeza";

export const TEMAS: Tema[] = [
  "Saúde",
  "Ansiedade",
  "Depressão",
  "Gratidão",
  "Família",
  "Solidão",
  "Paciência",
  "Ira",
  "Tristeza",
];

export interface DiaDevocional {
  dia: number;
  titulo: string;
  reflexao: string;
  leitura: string;
  salmo: string;
  proverbio: string;
}

const PLANOS: Record<Tema, DiaDevocional[]> = {
  Saúde: [
    {
      dia: 1,
      titulo: "Deus, meu médico",
      reflexao:
        "Toda cura vem de Deus. Entregar a nossa saúde nas mãos do Senhor é um ato de profunda fé. Ele conhece cada parte do nosso ser e deseja a nossa plenitude.",
      leitura: "Tiago 5, 14-15",
      salmo: "Salmo 103",
      proverbio: "Provérbios 17, 22",
    },
    {
      dia: 2,
      titulo: "O corpo, templo do Espírito",
      reflexao:
        "Nosso corpo é morada do Espírito Santo. Cuidar de si com amor não é vaidade, é gratidão a Deus pelo dom da vida. Trate seu corpo como sagrado.",
      leitura: "1 Coríntios 6, 19-20",
      salmo: "Salmo 139",
      proverbio: "Provérbios 14, 30",
    },
    {
      dia: 3,
      titulo: "Força na fraqueza",
      reflexao:
        "São Paulo aprendeu que a fraqueza é espaço onde a graça de Deus age. Quando sentimos que não temos mais forças, é precisamente então que Cristo age em nós.",
      leitura: "2 Coríntios 12, 9-10",
      salmo: "Salmo 22",
      proverbio: "Provérbios 3, 7-8",
    },
    {
      dia: 4,
      titulo: "Cura interior",
      reflexao:
        "Jesus não curava apenas os corpos — curava os corações. Pedir cura é também pedir libertação de mágoas, medos e ressentimentos que adoecem a alma.",
      leitura: "Marcos 2, 1-12",
      salmo: "Salmo 41",
      proverbio: "Provérbios 12, 18",
    },
    {
      dia: 5,
      titulo: "Confiança no sofrimento",
      reflexao:
        "Jó perdeu tudo e ainda assim não amaldiçoou a Deus. O sofrimento pode purificar e fortalecer a fé quando o abraçamos com confiança em Deus.",
      leitura: "Jó 2, 10",
      salmo: "Salmo 116",
      proverbio: "Provérbios 18, 14",
    },
    {
      dia: 6,
      titulo: "A paz que excede tudo",
      reflexao:
        "A paz de Deus não depende de circunstâncias externas. É uma paz interior que guarda o coração e a mente mesmo em meio à dor e à incerteza.",
      leitura: "Filipenses 4, 6-7",
      salmo: "Salmo 46",
      proverbio: "Provérbios 4, 20-22",
    },
    {
      dia: 7,
      titulo: "Renovação em Cristo",
      reflexao:
        "Aqueles que esperam no Senhor renovam as suas forças. Termine essa semana crendo que Deus renova sua saúde, sua disposição e sua esperança a cada dia.",
      leitura: "Isaías 40, 31",
      salmo: "Salmo 27",
      proverbio: "Provérbios 3, 5-6",
    },
  ],
  Ansiedade: [
    {
      dia: 1,
      titulo: "Lança sobre Ele tua ansiedade",
      reflexao:
        "Deus nos convida a lançar sobre Ele todas as nossas preocupações. A ansiedade não precisa ser carregada sozinha — há um Pai que cuida de você.",
      leitura: "1 Pedro 5, 7",
      salmo: "Salmo 55",
      proverbio: "Provérbios 12, 25",
    },
    {
      dia: 2,
      titulo: "Não vos turbeis",
      reflexao:
        "Jesus prometeu uma paz que o mundo não consegue dar nem tirar. Diante da ansiedade, recorra à oração e ao silêncio diante de Deus.",
      leitura: "João 14, 27",
      salmo: "Salmo 46",
      proverbio: "Provérbios 3, 21-24",
    },
    {
      dia: 3,
      titulo: "Presente em cada momento",
      reflexao:
        "A ansiedade vive no futuro. A fé vive no presente. Deus está aqui, agora, contigo. Respira fundo e volta ao momento presente com Ele.",
      leitura: "Mateus 6, 34",
      salmo: "Salmo 4",
      proverbio: "Provérbios 16, 3",
    },
    {
      dia: 4,
      titulo: "Orar em vez de ansiar",
      reflexao:
        "Paulo nos ensina: em tudo, com oração e súplica, apresente a Deus os seus pedidos. A oração transforma o peso da ansiedade em confiança.",
      leitura: "Filipenses 4, 6-7",
      salmo: "Salmo 62",
      proverbio: "Provérbios 19, 21",
    },
    {
      dia: 5,
      titulo: "A providência de Deus",
      reflexao:
        "Os pássaros do céu não semeiam nem colhem, e o Pai os sustenta. Quanto mais Ele cuida de você! Confie na providência divina.",
      leitura: "Mateus 6, 25-34",
      salmo: "Salmo 37",
      proverbio: "Provérbios 29, 25",
    },
    {
      dia: 6,
      titulo: "Abrigo sob Suas asas",
      reflexao:
        "Aquele que habita sob a proteção do Altíssimo nada teme. Deus é nosso refúgio e fortaleza — um socorro bem presente em momentos de angústia.",
      leitura: "Salmos 91, 1-4",
      salmo: "Salmo 91",
      proverbio: "Provérbios 14, 26",
    },
    {
      dia: 7,
      titulo: "A paz que guarda o coração",
      reflexao:
        "Que a paz de Cristo reine em seu coração. Você chegou ao fim dessa semana com fé mais firme. Deixe a ansiedade e receba a paz que Ele oferece.",
      leitura: "Colossenses 3, 15",
      salmo: "Salmo 131",
      proverbio: "Provérbios 17, 28",
    },
  ],
  Depressão: [
    {
      dia: 1,
      titulo: "Deus ouve o choro da alma",
      reflexao:
        "Deus não ignora nossa dor interior. Ele ouve até o choro silencioso que não tem palavras. Você não está sozinho neste vale escuro.",
      leitura: "Salmos 34, 18",
      salmo: "Salmo 42",
      proverbio: "Provérbios 12, 25",
    },
    {
      dia: 2,
      titulo: "Eliás na caverna",
      reflexao:
        "O profeta Eliás chegou a pedir a morte de tanto que estava exausto. O anjo de Deus não o repreendeu — lhe deu alimento, água e descanso. Deus cuida de você.",
      leitura: "1 Reis 19, 4-8",
      salmo: "Salmo 88",
      proverbio: "Provérbios 18, 14",
    },
    {
      dia: 3,
      titulo: "A luz no escuro",
      reflexao:
        "Mesmo quando não conseguimos sentir Deus, Ele está presente. A escuridão não O impede. Ele é a luz que nenhuma trevas pode apagar.",
      leitura: "João 1, 5",
      salmo: "Salmo 27",
      proverbio: "Provérbios 4, 18",
    },
    {
      dia: 4,
      titulo: "Deus renova as forças",
      reflexao:
        "A fadiga da alma é real. Mas Deus promete renovar as forças dos que esperam Nele. Permita-se descansar em Deus como numa águia que encontra o vento.",
      leitura: "Isaías 40, 29-31",
      salmo: "Salmo 73",
      proverbio: "Provérbios 24, 10",
    },
    {
      dia: 5,
      titulo: "Alegria que vem de Deus",
      reflexao:
        "A alegria cristã não é superficial — ela coexiste com a dor e aponta para além dela. Peça a Deus que deposite em você uma gota de alegria sobrenatural.",
      leitura: "João 15, 11",
      salmo: "Salmo 16",
      proverbio: "Provérbios 17, 22",
    },
    {
      dia: 6,
      titulo: "Comunidade e cura",
      reflexao:
        "Deus nos criou para a comunidade. Compartilhar a dor com alguém de confiança é sagrado. Não carregue tudo sozinho — busque ajuda com humildade.",
      leitura: "Gálatas 6, 2",
      salmo: "Salmo 147",
      proverbio: "Provérbios 11, 14",
    },
    {
      dia: 7,
      titulo: "Esperança que não decepciona",
      reflexao:
        "A esperança cristã não é ilusão — é certeza fundada em Deus. O que hoje parece noite eterna, Deus transformará em aurora. Persevere.",
      leitura: "Romanos 5, 3-5",
      salmo: "Salmo 30",
      proverbio: "Provérbios 23, 18",
    },
  ],
  Gratidão: [
    {
      dia: 1,
      titulo: "Em tudo dai graças",
      reflexao:
        "A gratidão é o ato mais revolucionário do espírito. Ela transforma o que temos em suficiente e o que somos em dádiva. Comece cada dia dando graças.",
      leitura: "1 Tessalonicenses 5, 18",
      salmo: "Salmo 100",
      proverbio: "Provérbios 15, 15",
    },
    {
      dia: 2,
      titulo: "O décimo leproso",
      reflexao:
        "Dos dez leprosos curados, apenas um voltou para agradecer a Jesus. A gratidão é rara e preciosa. Seja esse um que retorna com o coração cheio de louvor.",
      leitura: "Lucas 17, 11-19",
      salmo: "Salmo 107",
      proverbio: "Provérbios 11, 17",
    },
    {
      dia: 3,
      titulo: "Gratidão pelas pequenas coisas",
      reflexao:
        "O pão de cada dia, o ar que respiramos, o coração que bate — são milagres que tomamos por garantidos. Hoje, olhe para o ordinário com olhos de gratidão.",
      leitura: "Mateus 6, 11",
      salmo: "Salmo 145",
      proverbio: "Provérbios 30, 8-9",
    },
    {
      dia: 4,
      titulo: "Louvando nos tempos difíceis",
      reflexao:
        "Paulo e Silas cantavam louvores na prisão. A gratidão nos tempos de tribulação é a forma mais pura de fé. Ela declara que Deus é maior que o problema.",
      leitura: "Atos 16, 25-26",
      salmo: "Salmo 34",
      proverbio: "Provérbios 17, 3",
    },
    {
      dia: 5,
      titulo: "Gratidão pela salvação",
      reflexao:
        "O maior motivo de gratidão é a salvação oferecida em Cristo. Antes de qualquer outro dom, existe o dom supremo: sermos amados e redimidos por Deus.",
      leitura: "Efésios 2, 4-8",
      salmo: "Salmo 103",
      proverbio: "Provérbios 10, 28",
    },
    {
      dia: 6,
      titulo: "Gratidão que transforma",
      reflexao:
        "Quem pratica a gratidão fica mais feliz, mais resiliente e mais bondoso. A ciência confirma o que a fé já sabia: dar graças faz bem à alma e ao corpo.",
      leitura: "Filipenses 4, 4-7",
      salmo: "Salmo 92",
      proverbio: "Provérbios 15, 30",
    },
    {
      dia: 7,
      titulo: "Um coração sempre grato",
      reflexao:
        "Que essa semana tenha plantado em você o hábito da gratidão. Que ao acordar, antes de qualquer preocupação, o primeiro pensamento seja: obrigado, Senhor.",
      leitura: "Colossenses 3, 15-17",
      salmo: "Salmo 136",
      proverbio: "Provérbios 3, 9-10",
    },
  ],
  Família: [
    {
      dia: 1,
      titulo: "A família, Igreja doméstica",
      reflexao:
        "A família é o primeiro lugar onde aprendemos a amar. Ela é chamada de 'Igreja doméstica' porque é lá que a fé começa a ser vivida e transmitida.",
      leitura: "Efésios 5, 22-33",
      salmo: "Salmo 128",
      proverbio: "Provérbios 24, 3-4",
    },
    {
      dia: 2,
      titulo: "Honrar pai e mãe",
      reflexao:
        "Honrar os pais não é ceder a tudo que dizem, mas tratá-los com amor, respeito e cuidado. É um mandamento que vem com promessa de bênção.",
      leitura: "Êxodo 20, 12",
      salmo: "Salmo 127",
      proverbio: "Provérbios 20, 20",
    },
    {
      dia: 3,
      titulo: "Perdão em família",
      reflexao:
        "As mágoas familiares são as mais profundas. Mas o perdão dentro da família é o mais transformador. Cristo perdoou-nos sem merecer — podemos fazer o mesmo.",
      leitura: "Mateus 18, 21-22",
      salmo: "Salmo 32",
      proverbio: "Provérbios 10, 12",
    },
    {
      dia: 4,
      titulo: "Oração em família",
      reflexao:
        "Onde dois ou três se reúnem em nome de Jesus, Ele está presente. A família que reza unida permanece unida. A oração é o alicerce da família cristã.",
      leitura: "Mateus 18, 20",
      salmo: "Salmo 133",
      proverbio: "Provérbios 22, 6",
    },
    {
      dia: 5,
      titulo: "A Sagrada Família como modelo",
      reflexao:
        "Jesus, Maria e José viveram em Nazaré na simplicidade, no trabalho e na oração. Sua família também pode ser sagrada — não porque é perfeita, mas porque é consagrada a Deus.",
      leitura: "Lucas 2, 51-52",
      salmo: "Salmo 68",
      proverbio: "Provérbios 31, 10-12",
    },
    {
      dia: 6,
      titulo: "Cuidando dos idosos",
      reflexao:
        "Os mais velhos da família carregam sabedoria e histórias preciosas. Cuidar deles com amor e paciência é forma de honrar a Deus e receber bênçãos.",
      leitura: "Sirácide 3, 2-7",
      salmo: "Salmo 71",
      proverbio: "Provérbios 16, 31",
    },
    {
      dia: 7,
      titulo: "Bênção sobre sua família",
      reflexao:
        "Encerre essa semana declarando bênção sobre cada membro da sua família. Deus conhece pelo nome cada pessoa que você ama e cuida delas com infinito amor.",
      leitura: "Números 6, 24-26",
      salmo: "Salmo 128",
      proverbio: "Provérbios 11, 29",
    },
  ],
  Solidão: [
    {
      dia: 1,
      titulo: "Nunca estás só",
      reflexao:
        "A solidão é uma das dores mais profundas do coração humano. Mas Deus prometeu: 'Não te deixarei, nem te abandonarei.' Você nunca está verdadeiramente só.",
      leitura: "Josué 1, 9",
      salmo: "Salmo 23",
      proverbio: "Provérbios 18, 24",
    },
    {
      dia: 2,
      titulo: "Jesus, o amigo fiel",
      reflexao:
        "Jesus conhece a solidão — orou sozinho no Getsêmani, foi abandonado pelos discípulos. Ele entende sua dor de dentro. Fale com Ele como a um amigo.",
      leitura: "João 15, 13-15",
      salmo: "Salmo 62",
      proverbio: "Provérbios 17, 17",
    },
    {
      dia: 3,
      titulo: "Solidão que alimenta",
      reflexao:
        "Jesus frequentemente se recolhia a lugares desertos para orar. A solidão escolhida com Deus não é vazia — é plena. Aprenda a habitar o silêncio com Deus.",
      leitura: "Lucas 5, 16",
      salmo: "Salmo 46",
      proverbio: "Provérbios 4, 23",
    },
    {
      dia: 4,
      titulo: "A comunidade que acolhe",
      reflexao:
        "A Igreja é o Corpo de Cristo — e você é parte dele. Dar um passo em direção a uma comunidade de fé pode romper a solidão e revelar irmãos que você ainda não conhece.",
      leitura: "Romanos 12, 9-13",
      salmo: "Salmo 133",
      proverbio: "Provérbios 27, 17",
    },
    {
      dia: 5,
      titulo: "Servir para pertencer",
      reflexao:
        "Uma das formas mais eficazes de curar a solidão é servir ao próximo. Ao dar de si, descobrimos que fazemos parte de algo maior — a família de Deus.",
      leitura: "Gálatas 6, 9-10",
      salmo: "Salmo 41",
      proverbio: "Provérbios 11, 25",
    },
    {
      dia: 6,
      titulo: "Maria, nossa companhia",
      reflexao:
        "Nossa Senhora não abandona seus filhos. Nos momentos de solidão mais aguda, recorra à Mãe. Ela permanece ao pé da cruz de cada filho que a invoca.",
      leitura: "João 19, 26-27",
      salmo: "Salmo 131",
      proverbio: "Provérbios 31, 25",
    },
    {
      dia: 7,
      titulo: "Cheios de Deus",
      reflexao:
        "O coração humano tem um vazio que só Deus pode preencher. Que ao fim dessa semana você perceba que com Deus dentro de você, nunca mais será completamente solitário.",
      leitura: "Efésios 3, 16-19",
      salmo: "Salmo 84",
      proverbio: "Provérbios 3, 32",
    },
  ],
  Paciência: [
    {
      dia: 1,
      titulo: "Esperar com fé",
      reflexao:
        "Deus age no tempo certo, não no nosso. Esperar não é passividade — é ato de fé profunda que declara: 'Confio no teu tempo, Senhor.'",
      leitura: "Habacuque 2, 3",
      salmo: "Salmo 37",
      proverbio: "Provérbios 21, 5",
    },
    {
      dia: 2,
      titulo: "Perseverança na provação",
      reflexao:
        "A tribulação produz perseverança, e a perseverança produz caráter. A paciência forjada no sofrimento é ouro que nenhuma circunstância pode roubar.",
      leitura: "Romanos 5, 3-5",
      salmo: "Salmo 40",
      proverbio: "Provérbios 14, 29",
    },
    {
      dia: 3,
      titulo: "O lavrador que aguarda",
      reflexao:
        "O lavrador aguarda pacientemente os frutos da terra. A semente plantada hoje na fé brotará no tempo de Deus. Não arranque a planta antes do tempo.",
      leitura: "Tiago 5, 7-8",
      salmo: "Salmo 126",
      proverbio: "Provérbios 16, 32",
    },
    {
      dia: 4,
      titulo: "Manso e humilde de coração",
      reflexao:
        "Jesus se descreve como manso e humilde. A paciência não é fraqueza — é a força de quem aprendeu a não reagir impulsivamente. É virtude de quem conhece a Deus.",
      leitura: "Mateus 11, 29",
      salmo: "Salmo 25",
      proverbio: "Provérbios 15, 18",
    },
    {
      dia: 5,
      titulo: "Suportando uns aos outros",
      reflexao:
        "A paciência com o próximo é uma das formas mais concretas de amor. Suportar as falhas alheias com graça é praticar o que Cristo fez conosco.",
      leitura: "Efésios 4, 1-3",
      salmo: "Salmo 86",
      proverbio: "Provérbios 19, 11",
    },
    {
      dia: 6,
      titulo: "O tempo de Deus é perfeito",
      reflexao:
        "Tudo tem um tempo designado. Confiar no tempo de Deus é libertar-se da ansiedade e do controle. O que é de Deus chegará — espere com alegria.",
      leitura: "Eclesiastes 3, 1-8",
      salmo: "Salmo 130",
      proverbio: "Provérbios 13, 12",
    },
    {
      dia: 7,
      titulo: "A coroa da paciência",
      reflexao:
        "Bem-aventurado quem persevera na tentação, pois receberá a coroa da vida. Sua paciência nesta semana já é vitória. Persevere até o fim.",
      leitura: "Tiago 1, 2-4",
      salmo: "Salmo 27",
      proverbio: "Provérbios 3, 5-6",
    },
  ],
  Ira: [
    {
      dia: 1,
      titulo: "Ira que não peca",
      reflexao:
        "É possível sentir raiva e não pecar. A ira se torna pecado quando a alimentamos ou agimos por ela impulsivamente. Entregue sua raiva ao Senhor antes que ela te domine.",
      leitura: "Efésios 4, 26-27",
      salmo: "Salmo 37",
      proverbio: "Provérbios 29, 11",
    },
    {
      dia: 2,
      titulo: "Lento para a ira",
      reflexao:
        "Um coração que demora a se encolerizar é uma conquista espiritual. Jesus levou uma bofetada e respondeu com serenidade. Que virtude mais difícil e mais bela.",
      leitura: "Tiago 1, 19-20",
      salmo: "Salmo 4",
      proverbio: "Provérbios 16, 32",
    },
    {
      dia: 3,
      titulo: "A raiz da ira",
      reflexao:
        "A ira muitas vezes nasce da ferida, do medo ou da injustiça. Levá-la a Deus em oração é o caminho para compreendê-la e transformá-la em força positiva.",
      leitura: "Mateus 5, 22-24",
      salmo: "Salmo 139",
      proverbio: "Provérbios 14, 17",
    },
    {
      dia: 4,
      titulo: "Perdoar como Cristo perdoou",
      reflexao:
        "O perdão não é sentimento — é decisão. Cristo na cruz pediu perdão pelos que o crucificavam. Perdoar não liberta só quem errou — liberta também quem foi ferido.",
      leitura: "Mateus 18, 21-35",
      salmo: "Salmo 32",
      proverbio: "Provérbios 10, 12",
    },
    {
      dia: 5,
      titulo: "Vencer o mal com o bem",
      reflexao:
        "Não se deixe vencer pelo mal, mas vença o mal pelo bem. Responder à hostilidade com bondade não é ingenuidade — é poder sobrenatural que rompe ciclos de violência.",
      leitura: "Romanos 12, 17-21",
      salmo: "Salmo 34",
      proverbio: "Provérbios 15, 1",
    },
    {
      dia: 6,
      titulo: "Paz interior como escolha",
      reflexao:
        "A paz não é ausência de conflito externo — é uma opção interior. Você pode escolher reagir com serenidade. Isso é maturidade espiritual.",
      leitura: "Colossenses 3, 8-10",
      salmo: "Salmo 131",
      proverbio: "Provérbios 17, 14",
    },
    {
      dia: 7,
      titulo: "Coração novo",
      reflexao:
        "Deus promete tirar o coração de pedra e dar um coração de carne. Peça a Ele um coração renovado — manso, livre da ira e cheio de Seu amor.",
      leitura: "Ezequiel 36, 26",
      salmo: "Salmo 51",
      proverbio: "Provérbios 4, 23",
    },
  ],
  Tristeza: [
    {
      dia: 1,
      titulo: "Benditos os que choram",
      reflexao:
        "Jesus disse: 'Bem-aventurados os que choram, pois serão consolados.' A tristeza não é sinal de fraca fé — é uma emoção humana que Deus acolhe e consola.",
      leitura: "Mateus 5, 4",
      salmo: "Salmo 34",
      proverbio: "Provérbios 12, 25",
    },
    {
      dia: 2,
      titulo: "Jesus que chora",
      reflexao:
        "Quando Lázaro morreu, Jesus chorou. O Filho de Deus chorou diante da dor. Isso revela um Deus que se move com misericórdia diante de cada tristeza nossa.",
      leitura: "João 11, 33-36",
      salmo: "Salmo 56",
      proverbio: "Provérbios 14, 13",
    },
    {
      dia: 3,
      titulo: "No vale da sombra",
      reflexao:
        "Mesmo no vale mais escuro, o Senhor está ao nosso lado. Sua vara e seu cajado nos amparam. A tristeza tem um fim; a presença de Deus, não.",
      leitura: "Salmos 23, 4",
      salmo: "Salmo 23",
      proverbio: "Provérbios 15, 13",
    },
    {
      dia: 4,
      titulo: "A noite passará",
      reflexao:
        "O choro pode durar uma noite, mas a alegria vem pela manhã. A tristeza não é definitiva para quem está nas mãos de Deus. A aurora chegará.",
      leitura: "Salmos 30, 5-6",
      salmo: "Salmo 30",
      proverbio: "Provérbios 4, 18",
    },
    {
      dia: 5,
      titulo: "Consolados para consolar",
      reflexao:
        "Deus nos consola em todas as nossas tribulações para que possamos consolar os outros. Sua dor, transformada por Deus, pode se tornar bálsamo para outra alma ferida.",
      leitura: "2 Coríntios 1, 3-4",
      salmo: "Salmo 147",
      proverbio: "Provérbios 11, 25",
    },
    {
      dia: 6,
      titulo: "A beleza das cinzas",
      reflexao:
        "Deus promete transformar cinzas em beleza e pranto em óleo de alegria. O que parece destruído pode ser matéria-prima para uma nova obra de Deus.",
      leitura: "Isaías 61, 1-3",
      salmo: "Salmo 126",
      proverbio: "Provérbios 13, 12",
    },
    {
      dia: 7,
      titulo: "Alegria que virá",
      reflexao:
        "Encerre essa semana com esperança firme: Deus não desperdiça nenhuma lágrima. Ele as coleciona e as transforma em sementes de uma alegria que ninguém poderá tirar.",
      leitura: "João 16, 22",
      salmo: "Salmo 16",
      proverbio: "Provérbios 23, 18",
    },
  ],
};

export function getPlanoDevocional(tema: Tema): DiaDevocional[] {
  return PLANOS[tema];
}

export const TEMA_ICONS: Record<Tema, string> = {
  Saúde: "❤️",
  Ansiedade: "🕊️",
  Depressão: "🌿",
  Gratidão: "🙏",
  Família: "🏠",
  Solidão: "⭐",
  Paciência: "⏳",
  Ira: "🕊️",
  Tristeza: "🌅",
};

export const TEMA_COLORS: Record<Tema, string> = {
  Saúde: "#27AE60",
  Ansiedade: "#6B9ECA",
  Depressão: "#7B68EE",
  Gratidão: "#C9A84C",
  Família: "#E67E22",
  Solidão: "#8E44AD",
  Paciência: "#16A085",
  Ira: "#E74C3C",
  Tristeza: "#2980B9",
};
