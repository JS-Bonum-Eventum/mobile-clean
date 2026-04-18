import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Santo {
  nome: string;
  descricao: string;
  festa: string;
}

// ─── Cache key ─────────────────────────────────────────────────────────────
const CACHE_KEY_PREFIX = "vivo_em_deus_santo_v1_";

// ─── Generic fallback ──────────────────────────────────────────────────────
const FALLBACK: Santo = {
  nome: "Santo do dia indisponível",
  descricao:
    "Hoje celebramos um santo da nossa Igreja. Que seu exemplo nos inspire a viver na fé. 🙏",
  festa: "",
};

// ─── Static calendar — keyed by "MM-DD" ────────────────────────────────────
const SANTOS: Record<string, Santo> = {
  "01-01": { nome: "Solenidade de Maria Santíssima", descricao: "Celebramos Maria como Mãe de Deus, abrindo o ano sob sua proteção.", festa: "1 de janeiro" },
  "01-02": { nome: "Santos Basílio e Gregório Nazianzeno", descricao: "Doutores da Igreja do século IV, grandes defensores da fé trinitária.", festa: "2 de janeiro" },
  "01-03": { nome: "Santo Nome de Jesus", descricao: "Meditamos no poder do Nome de Jesus, pelo qual somos salvos.", festa: "3 de janeiro" },
  "01-04": { nome: "Santa Isabel Ana Seton", descricao: "Primeira santa nascida nos EUA, fundadora das Irmãs da Caridade.", festa: "4 de janeiro" },
  "01-05": { nome: "São João Neumann", descricao: "Bispo missionário pioneiro no sistema de escolas católicas.", festa: "5 de janeiro" },
  "01-06": { nome: "Epifania do Senhor", descricao: "Manifestação de Jesus a todos os povos, representada pelos Reis Magos.", festa: "6 de janeiro" },
  "01-07": { nome: "São Raimundo de Penhaforte", descricao: "Padroeiro dos canonistas e grande pregador da Ordem dos Pregadores.", festa: "7 de janeiro" },
  "01-08": { nome: "São Severino", descricao: "Apóstolo da Nórica, conhecido por sua caridade e vida de oração.", festa: "8 de janeiro" },
  "01-09": { nome: "Santo Adriano de Cantuária", descricao: "Abade africano que promoveu a educação cristã na Inglaterra.", festa: "9 de janeiro" },
  "01-10": { nome: "São Gregório de Nissa", descricao: "Bispo e teólogo místico, irmão de São Basílio Magno.", festa: "10 de janeiro" },
  "01-11": { nome: "Santo Higino", descricao: "Papa e mártir do século II que organizou a hierarquia eclesiástica.", festa: "11 de janeiro" },
  "01-12": { nome: "Santa Arcângela Girlani", descricao: "Virgem carmelita conhecida por seus êxtases e visões místicas.", festa: "12 de janeiro" },
  "01-13": { nome: "Santo Hilário de Poitiers", descricao: "Bispo e Doutor da Igreja, defensor da divindade de Cristo.", festa: "13 de janeiro" },
  "01-14": { nome: "São Félix de Nola", descricao: "Presbítero que sofreu perseguições e foi libertado milagrosamente.", festa: "14 de janeiro" },
  "01-15": { nome: "Santo Amaro", descricao: "Discípulo de São Bento, modelo de obediência e humildade.", festa: "15 de janeiro" },
  "01-16": { nome: "São Marcelo I", descricao: "Papa que reorganizou a Igreja após as perseguições de Diocleciano.", festa: "16 de janeiro" },
  "01-17": { nome: "Santo Antão", descricao: "Pai do monaquismo cristão e grande exemplo de vida eremítica.", festa: "17 de janeiro" },
  "01-18": { nome: "Santa Margarida da Hungria", descricao: "Princesa que escolheu a vida religiosa e a penitência severa.", festa: "18 de janeiro" },
  "01-19": { nome: "São Mário e Família", descricao: "Mártires que morreram em Roma por professarem a fé cristã.", festa: "19 de janeiro" },
  "01-20": { nome: "São Sebastião", descricao: "Mártir soldado, protetor contra a peste e flechado por sua fé.", festa: "20 de janeiro" },
  "01-21": { nome: "Santa Inês", descricao: "Jovem mártir romana, símbolo de pureza e castidade.", festa: "21 de janeiro" },
  "01-22": { nome: "São Vicente de Saragoça", descricao: "Diácono e mártir, padroeiro de Lisboa e dos vinicultores.", festa: "22 de janeiro" },
  "01-23": { nome: "São Ildefonso de Toledo", descricao: "Bispo e grande devoto da Virgem Maria e sua virgindade perpétua.", festa: "23 de janeiro" },
  "01-24": { nome: "São Francisco de Sales", descricao: "Bispo, Doutor da Igreja e padroeiro dos jornalistas e escritores.", festa: "24 de janeiro" },
  "01-25": { nome: "Conversão de São Paulo", descricao: "Celebramos a mudança radical do apóstolo no caminho de Damasco.", festa: "25 de janeiro" },
  "01-26": { nome: "Santos Timóteo e Tito", descricao: "Discípulos de São Paulo e bispos da Igreja primitiva.", festa: "26 de janeiro" },
  "01-27": { nome: "Santa Ângela Mérici", descricao: "Fundadora da Companhia de Santa Úrsula (Ursulinas).", festa: "27 de janeiro" },
  "01-28": { nome: "Santo Tomás de Aquino", descricao: "Doutor Angélico, mestre da teologia e da filosofia cristã.", festa: "28 de janeiro" },
  "01-29": { nome: "São Valério", descricao: "Bispo de Saragoça e mestre de São Vicente mártir.", festa: "29 de janeiro" },
  "01-30": { nome: "Santa Jacinta Mariscotti", descricao: "Religiosa franciscana que se converteu a uma vida de penitência.", festa: "30 de janeiro" },
  "01-31": { nome: "São João Bosco", descricao: "Pai e mestre da juventude, fundador da Família Salesiana.", festa: "31 de janeiro" },
  "02-01": { nome: "Santa Veridiana", descricao: "Virgem que viveu em reclusão e penitência por 34 anos.", festa: "1 de fevereiro" },
  "02-02": { nome: "Apresentação do Senhor", descricao: "Jesus é apresentado no Templo como Luz para iluminar as nações.", festa: "2 de fevereiro" },
  "02-03": { nome: "São Brás", descricao: "Bispo e mártir, conhecido pela bênção das gargantas.", festa: "3 de fevereiro" },
  "02-04": { nome: "São João de Brito", descricao: "Missionário jesuíta e mártir na Índia.", festa: "4 de fevereiro" },
  "02-05": { nome: "Santa Águeda", descricao: "Virgem e mártir siciliana, protetora contra doenças de mama.", festa: "5 de fevereiro" },
  "02-06": { nome: "São Paulo Miki e Companheiros", descricao: "Mártires do Japão crucificados por sua fé em Nagasaki.", festa: "6 de fevereiro" },
  "02-07": { nome: "São Teodoro de Heracleia", descricao: "General romano e mártir sob o imperador Licínio.", festa: "7 de fevereiro" },
  "02-08": { nome: "Santa Josefina Bakhita", descricao: "Escrava sudanesa que se tornou religiosa e santa da liberdade.", festa: "8 de fevereiro" },
  "02-09": { nome: "Santa Apolônia", descricao: "Mártir de Alexandria, invocada contra dores de dente.", festa: "9 de fevereiro" },
  "02-10": { nome: "Santa Escolástica", descricao: "Irmã de São Bento e fundadora do ramo feminino beneditino.", festa: "10 de fevereiro" },
  "02-11": { nome: "Nossa Senhora de Lourdes", descricao: "Recordação das aparições da Virgem a Santa Bernadette.", festa: "11 de fevereiro" },
  "02-12": { nome: "Santos Mártires de Abitina", descricao: "Grupo de mártires africanos que morreram por celebrar a Eucaristia.", festa: "12 de fevereiro" },
  "02-13": { nome: "São Benigno de Todi", descricao: "Presbítero e mártir durante as perseguições romanas.", festa: "13 de fevereiro" },
  "02-14": { nome: "Santos Cirilo e Metódio", descricao: "Padroeiros da Europa e apóstolos dos povos eslavos.", festa: "14 de fevereiro" },
  "02-15": { nome: "São Cláudio de la Colombière", descricao: "Jesuíta e confessor de Santa Margarida Maria Alacoque.", festa: "15 de fevereiro" },
  "02-16": { nome: "Santa Juliana de Nicomédia", descricao: "Mártir que preferiu a morte a renunciar à sua fé e virgindade.", festa: "16 de fevereiro" },
  "02-17": { nome: "Sete Santos Fundadores dos Servitas", descricao: "Nobre florentinos que fundaram a Ordem dos Servos de Maria.", festa: "17 de fevereiro" },
  "02-18": { nome: "São Fra Angelico", descricao: "Pintor dominicano conhecido pela santidade de sua arte.", festa: "18 de fevereiro" },
  "02-19": { nome: "São Conrado de Placência", descricao: "Eremita franciscano que viveu uma vida de extrema penitência.", festa: "19 de fevereiro" },
  "02-20": { nome: "Santos Francisco e Jacinta Marto", descricao: "Os pastorinhos de Fátima, exemplos de oração e sacrifício.", festa: "20 de fevereiro" },
  "02-21": { nome: "São Pedro Damião", descricao: "Bispo e Doutor da Igreja, reformador da vida monástica.", festa: "21 de fevereiro" },
  "02-22": { nome: "Cátedra de São Pedro", descricao: "Celebração do magistério e autoridade do Papa como sucessor de Pedro.", festa: "22 de fevereiro" },
  "02-23": { nome: "São Policarpo", descricao: "Bispo de Esmirna e discípulo do Apóstolo João, mártir da fé.", festa: "23 de fevereiro" },
  "02-24": { nome: "São Sérgio de Cesarea", descricao: "Monge e mártir durante a perseguição de Diocleciano.", festa: "24 de fevereiro" },
  "02-25": { nome: "São Luís Versiglia", descricao: "Bispo salesiano e mártir na China, defensor da juventude.", festa: "25 de fevereiro" },
  "02-26": { nome: "São Porfírio de Gaza", descricao: "Bispo que combateu o paganismo e destruiu templos idólatras.", festa: "26 de fevereiro" },
  "02-27": { nome: "São Gregório de Narek", descricao: "Monge armênio e Doutor da Igreja, mestre da oração.", festa: "27 de fevereiro" },
  "02-28": { nome: "São Romano", descricao: "Abade que viveu como eremita no Jura e fundou mosteiros.", festa: "28 de fevereiro" },
  "02-29": { nome: "Santo Osvaldo de Worcester", descricao: "Bispo que promoveu a reforma monástica na Inglaterra (em anos bissextos).", festa: "29 de fevereiro" },
  "03-01": { nome: "São David de Gales", descricao: "Bispo e padroeiro do País de Gales, mestre da ascese.", festa: "1 de março" },
  "03-02": { nome: "Santa Inês de Praga", descricao: "Princesa que fundou o primeiro mosteiro de Clarissas na Boêmia.", festa: "2 de março" },
  "03-03": { nome: "Santa Cunegunda", descricao: "Imperatriz do Sacro Império, conhecida por sua caridade e castidade.", festa: "3 de março" },
  "03-04": { nome: "São Casimiro", descricao: "Príncipe polonês, modelo de pureza e devoção à Eucaristia.", festa: "4 de março" },
  "03-05": { nome: "São João José da Cruz", descricao: "Franciscano místico conhecido por seus milagres e austeridade.", festa: "5 de março" },
  "03-06": { nome: "Santa Coleta", descricao: "Reformadora da Ordem das Clarissas, mística e visionária.", festa: "6 de março" },
  "03-07": { nome: "Santas Perpétua e Felicidade", descricao: "Mártires africanas que testemunharam Cristo no coliseu de Cartago.", festa: "7 de março" },
  "03-08": { nome: "São João de Deus", descricao: "Fundador da Ordem Hospitaleira, padroeiro dos hospitais.", festa: "8 de março" },
  "03-09": { nome: "Santa Francisca Romana", descricao: "Mística e mãe de família, fundadora das Oblatas de Tor de’ Specchi.", festa: "9 de março" },
  "03-10": { nome: "São Macário de Jerusalém", descricao: "Bispo que ajudou Santa Helena a encontrar a Verdadeira Cruz.", festa: "10 de março" },
  "03-11": { nome: "São Eulógio de Córdova", descricao: "Mártir da Espanha islâmica, autor de crônicas dos mártires.", festa: "11 de março" },
  "03-12": { nome: "São Teófanes o Confessor", descricao: "Abade bizantino que defendeu o culto às sagradas imagens.", festa: "12 de março" },
  "03-13": { nome: "Santa Eufrásia", descricao: "Virgem que se dedicou à humildade extrema e ao serviço comunitário.", festa: "13 de março" },
  "03-14": { nome: "Santa Matilde", descricao: "Rainha da Alemanha, modelo de paciência, caridade e oração.", festa: "14 de março" },
  "03-15": { nome: "São Clemente Maria Hofbauer", descricao: "Redentorista que propagou a fé na Áustria e Polônia.", festa: "15 de março" },
  "03-16": { nome: "São João de Brébeuf", descricao: "Missionário jesuíta e mártir entre os índios na América do Norte.", festa: "16 de março" },
  "03-17": { nome: "São Patrício", descricao: "Bispo e apóstolo da Irlanda, utilizou o trevo para explicar a Trindade.", festa: "17 de março" },
  "03-18": { nome: "São Cirilo de Jerusalém", descricao: "Bispo e Doutor da Igreja, autor das famosas catequeses mistagógicas.", festa: "18 de março" },
  "03-19": { nome: "São José", descricao: "Esposo da Virgem Maria e Padroeiro Universal da Igreja.", festa: "19 de março" },
  "03-20": { nome: "São Martinho de Braga", descricao: "Apóstolo dos Suevos e organizador da Igreja na Galiza.", festa: "20 de março" },
  "03-21": { nome: "São Nicolau de Flüe", descricao: "Eremita e padroeiro da Suíça, conhecido como 'Irmão Klaus'.", festa: "21 de março" },
  "03-22": { nome: "São Lea de Roma", descricao: "Viúva romana que abandonou as riquezas para viver em austeridade.", festa: "22 de março" },
  "03-23": { nome: "São Toríbio de Mogrovejo", descricao: "Bispo de Lima e grande evangelizador da América Latina.", festa: "23 de março" },
  "03-24": { nome: "Santa Catarina da Suécia", descricao: "Filha de Santa Brígida e dedicada à proteção das mulheres grávidas.", festa: "24 de março" },
  "03-25": { nome: "Anunciação do Senhor", descricao: "O momento em que Maria diz 'Sim' a Deus e o Verbo se faz carne.", festa: "25 de março" },
  "03-26": { nome: "São Ludgero", descricao: "Missionário na Saxônia e primeiro bispo de Münster.", festa: "26 de março" },
  "03-27": { nome: "São Ruperto", descricao: "Bispo missionário e fundador da cidade de Salzburgo.", festa: "27 de março" },
  "03-28": { nome: "São Gontrão", descricao: "Rei de Borgonha que se destacou pela caridade e arrependimento.", festa: "28 de março" },
  "03-29": { nome: "São Ludolfo", descricao: "Bispo e mártir, defensor da liberdade da Igreja frente ao Estado.", festa: "29 de março" },
  "03-30": { nome: "São João Clímaco", descricao: "Monge e autor da 'Escada do Paraíso', obra clássica da ascese.", festa: "30 de março" },
  "03-31": { nome: "São Benjamim", descricao: "Diácono e mártir persa que morreu pregando o Evangelho.", festa: "31 de março" },
  "04-01": { nome: "São Hugo de Grenoble", descricao: "Bispo que ajudou São Bruno a fundar a Ordem da Cartuxa.", festa: "1 de abril" },
  "04-02": { nome: "São Francisco de Paula", descricao: "Fundador da Ordem dos Mínimos, conhecido por sua humildade.", festa: "2 de abril" },
  "04-03": { nome: "São Ricardo de Chichester", descricao: "Bispo inglês modelo de caridade para com os pobres e clero.", festa: "3 de abril" },
  "04-04": { nome: "São Isidoro de Sevilha", descricao: "Bispo e Doutor da Igreja, autor das 'Etimologias'.", festa: "4 de abril" },
  "04-05": { nome: "São Vicente Ferrer", descricao: "Pregador dominicano famoso por seus milagres e sermões apocalípticos.", festa: "5 de abril" },
  "04-06": { nome: "São Prudêncio", descricao: "Bispo de Troyes e grande teólogo sobre a graça divina.", festa: "6 de abril" },
  "04-07": { nome: "São João Batista de La Salle", descricao: "Padroeiro dos educadores e fundador dos Irmãos das Escolas Cristãs.", festa: "7 de abril" },
  "04-08": { nome: "Santa Júlia Billiart", descricao: "Fundadora das Irmãs de Nossa Senhora, mestre da catequese.", festa: "8 de abril" },
  "04-09": { nome: "Santa Casilda de Toledo", descricao: "Jovem convertida que levava pães aos prisioneiros cristãos.", festa: "9 de abril" },
  "04-10": { nome: "São Madalena de Canossa", descricao: "Fundadora das Filhas da Caridade Canossianas.", festa: "10 de abril" },
  "04-11": { nome: "São Estanislau", descricao: "Bispo de Cracóvia e mártir, assassinado por defender a moral cristã.", festa: "11 de abril" },
  "04-12": { nome: "São Júlio I", descricao: "Papa que defendeu Santo Atanásio e a ortodoxia contra o arianismo.", festa: "12 de abril" },
  "04-13": { nome: "São Martinho I", descricao: "Papa e mártir, o último papa a sofrer o martírio.", festa: "13 de abril" },
  "04-14": { nome: "Santa Lidvina", descricao: "Virgem holandesa que suportou 38 anos de enfermidade com alegria.", festa: "14 de abril" },
  "04-15": { nome: "São Damião de Molokai", descricao: "Apóstolo dos leprosos no Havaí, onde ele mesmo contraiu a doença.", festa: "15 de abril" },
  "04-16": { nome: "Santa Bernadette Soubirous", descricao: "A vidente de Lourdes, que viveu em humildade e sofrimento.", festa: "16 de abril" },
  "04-17": { nome: "Santo Aniceto", descricao: "Papa que recebeu São Policarpo para discutir a data da Páscoa.", festa: "17 de abril" },
  "04-18": { nome: "São Galdino", descricao: "Bispo de Milão que trabalhou na reconstrução da cidade e da fé.", festa: "18 de abril" },
  "04-19": { nome: "Santo Expedito", descricao: "Mártir romano, invocado como o santo das causas urgentes.", festa: "19 de abril" },
  "04-20": { nome: "Santa Inês de Montepulciano", descricao: "Mística dominicana conhecida por sua vida de milagres e êxtases.", festa: "20 de abril" },
  "04-21": { nome: "Santo Anselmo", descricao: "Bispo, Doutor da Igreja e pai da escolástica medieval.", festa: "21 de abril" },
  "04-22": { nome: "São Sotero e São Caio", descricao: "Papas e mártires que guiaram a Igreja nos tempos primitivos.", festa: "22 de abril" },
  "04-23": { nome: "São Jorge", descricao: "Mártir soldado, símbolo da vitória da fé sobre o mal.", festa: "23 de abril" },
  "04-24": { nome: "São Fidélis de Sigmaringa", descricao: "Mártir capuchinho e pregador da fé na Suíça.", festa: "24 de abril" },
  "04-25": { nome: "São Marcos Evangelista", descricao: "Autor do segundo Evangelho e companheiro de São Pedro.", festa: "25 de abril" },
  "04-26": { nome: "Nossa Senhora do Bom Conselho", descricao: "Invocamos a sabedoria da Virgem para guiar nossas decisões.", festa: "26 de abril" },
  "04-27": { nome: "Santa Zita", descricao: "Serva doméstica, padroeira das empregadas do lar.", festa: "27 de abril" },
  "04-28": { nome: "São Pedro Chanel", descricao: "Primeiro mártir da Oceania e missionário marista.", festa: "28 de abril" },
  "04-29": { nome: "Santa Catarina de Sena", descricao: "Doutora da Igreja e mediadora da paz, padroeira da Europa.", festa: "29 de abril" },
  "04-30": { nome: "São Pio V", descricao: "Papa dominicano que aplicou as reformas do Concílio de Trento.", festa: "30 de abril" },
  "05-01": { nome: "São José Operário", descricao: "Padroeiro dos trabalhadores, exemplo de santificação do trabalho.", festa: "1 de maio" },
  "05-02": { nome: "Santo Atanásio", descricao: "Bispo e Doutor da Igreja, o grande 'coluna da Igreja' contra o arianismo.", festa: "2 de maio" },
  "05-03": { nome: "Santos Filipe e Tiago Menor", descricao: "Apóstolos de Jesus que deram a vida pela propagação do Reino.", festa: "3 de maio" },
  "05-04": { nome: "São Floriano", descricao: "Mártir austríaco e padroeiro dos bombeiros.", festa: "4 de maio" },
  "05-05": { nome: "Santo Ângelo da Sicília", descricao: "Carmelita e mártir, conhecido por seu zelo apostólico.", festa: "5 de maio" },
  "05-06": { nome: "São Domingos Sávio", descricao: "Jovem discípulo de Dom Bosco, modelo de santidade juvenil.", festa: "6 de maio" },
  "05-07": { nome: "Santa Rosa Venerini", descricao: "Pioneira na educação feminina na Itália.", festa: "7 de maio" },
  "05-08": { nome: "Nossa Senhora de Luján", descricao: "Padroeira da Argentina e exemplo de humildade.", festa: "8 de maio" },
  "05-09": { nome: "São Pacômio", descricao: "Fundador da vida cenobítica (monástica comunitária).", festa: "9 de maio" },
  "05-10": { nome: "São João de Ávila", descricao: "Apóstolo da Andaluzia e Doutor da Igreja.", festa: "10 de maio" },
  "05-11": { nome: "Santo Inácio de Láconi", descricao: "Capuchinho humilde conhecido como 'o santo da esmola'.", festa: "11 de maio" },
  "05-12": { nome: "Santos Nereu e Aquileu", descricao: "Soldados romanos mártires que abandonaram as armas por Cristo.", festa: "12 de maio" },
  "05-13": { nome: "Nossa Senhora de Fátima", descricao: "Celebramos as aparições da Virgem aos três pastorinhos em Portugal.", festa: "13 de maio" },
  "05-14": { nome: "São Matias", descricao: "O apóstolo escolhido para ocupar o lugar de Judas Iscariotes.", festa: "14 de maio" },
  "05-15": { nome: "São Isidoro Lavrador", descricao: "Camponês espanhol que santificou sua vida no trabalho rural.", festa: "15 de maio" },
  "05-16": { nome: "São Simão Stock", descricao: "Carmelita que recebeu o Escapulário de Nossa Senhora.", festa: "16 de maio" },
  "05-17": { nome: "São Pascoal Bailão", descricao: "Religioso franciscano e grande devoto da Eucaristia.", festa: "17 de maio" },
  "05-18": { nome: "São João I", descricao: "Papa e mártir que sofreu na prisão pela unidade da Igreja.", festa: "18 de maio" },
  "05-19": { nome: "Santo Ivo", descricao: "Padroeiro dos advogados, conhecido como 'o advogado dos pobres'.", festa: "19 de maio" },
  "05-20": { nome: "São Bernardino de Sena", descricao: "Frade franciscano e grande propagador do Nome de Jesus.", festa: "20 de maio" },
  "05-21": { nome: "São Cristóvão Magalhães e Companheiros", descricao: "Mártires mexicanos durante a perseguição religiosa.", festa: "21 de maio" },
  "05-22": { nome: "Santa Rita de Cássia", descricao: "A 'Santa das Causas Impossíveis', modelo de esposa, mãe e religiosa.", festa: "22 de maio" },
  "05-23": { nome: "São João Batista de Rossi", descricao: "Presbítero que se dedicou aos pobres e marginalizados em Roma.", festa: "23 de maio" },
  "05-24": { nome: "Nossa Senhora Auxiliadora", descricao: "Título de Maria como socorro dos cristãos em tempos difíceis.", festa: "24 de maio" },
  "05-25": { nome: "São Beda Venerável", descricao: "Monge beneditino e Doutor da Igreja, historiador e teólogo.", festa: "25 de maio" },
  "05-26": { nome: "São Filipe Néri", descricao: "O 'Apóstolo de Roma', conhecido por sua alegria e caridade.", festa: "26 de maio" },
  "05-27": { nome: "Santo Agostinho de Cantuária", descricao: "Bispo que evangelizou o povo inglês e fundou sedes episcopais.", festa: "27 de maio" },
  "05-28": { nome: "São Germano de Paris", descricao: "Bispo conhecido por sua austeridade e amor pelos pobres.", festa: "28 de maio" },
  "05-29": { nome: "São Paulo VI", descricao: "Papa que concluiu o Concílio Vaticano II e promoveu o diálogo moderno.", festa: "29 de maio" },
  "05-30": { nome: "Santa Joana d'Arc", descricao: "Jovem mártir francesa que seguiu vozes divinas para salvar seu país.", festa: "30 de maio" },
  "05-31": { nome: "Visitação de Nossa Senhora", descricao: "Maria visita sua prima Isabel e proclama o Magnificat.", festa: "31 de maio" },
  "06-01": { nome: "São Justino", descricao: "Mártir e um dos primeiros grandes filósofos e apologistas cristãos.", festa: "1 de junho" },
  "06-02": { nome: "Santos Marcelino e Pedro", descricao: "Mártires romanos que converteram seus carcereiros.", festa: "2 de junho" },
  "06-03": { nome: "São Carlos Lwanga e Companheiros", descricao: "Mártires de Uganda que morreram defendendo a pureza cristã.", festa: "3 de junho" },
  "06-04": { nome: "São Quirino de Síscia", descricao: "Bispo e mártir, afogado com uma pedra de moinho por sua fé.", festa: "4 de junho" },
  "06-05": { nome: "São Bonifácio", descricao: "Bispo e mártir, conhecido como o 'Apóstolo da Alemanha'.", festa: "5 de junho" },
  "06-06": { nome: "São Norberto", descricao: "Fundador da Ordem Premonstratense e grande promotor da Eucaristia.", festa: "6 de junho" },
  "06-07": { nome: "Santo Antônio Maria Gianelli", descricao: "Bispo conhecido pela caridade heroica durante a cólera.", festa: "7 de junho" },
  "06-08": { nome: "São Medardo", descricao: "Bispo francês amado pelo povo por sua generosidade.", festa: "8 de junho" },
  "06-09": { nome: "São José de Anchieta", descricao: "Jesuíta e 'Apóstolo do Brasil', evangelizador dos indígenas.", festa: "9 de junho" },
  "06-10": { nome: "Anjo da Guarda de Portugal", descricao: "Devoção ao protetor celestial da nação portuguesa.", festa: "10 de junho" },
  "06-11": { nome: "São Barnabé", descricao: "Apóstolo e companheiro de São Paulo nas missões iniciais.", festa: "11 de junho" },
  "06-12": { nome: "São Gaspar Bertoni", descricao: "Fundador dos Estigmatinos, exemplo de paciência no sofrimento.", festa: "12 de junho" },
  "06-13": { nome: "Santo Antônio de Pádua", descricao: "Doutor Evangélico, grande pregador e santo dos milagres.", festa: "13 de junho" },
  "06-14": { nome: "São Eliseu", descricao: "Profeta bíblico, sucessor de Elias e homem de milagres.", festa: "14 de junho" },
  "06-15": { nome: "Santa Germana Cousin", descricao: "Pastora humilde que suportou maus-tratos com amor cristão.", festa: "15 de junho" },
  "06-16": { nome: "São Juliano de Mainz", descricao: "Mártir que testemunhou a Cristo nos primeiros séculos.", festa: "16 de junho" },
  "06-17": { nome: "São Rainério de Pisa", descricao: "Padroeiro dos viajantes, converteu-se de uma vida mundana.", festa: "17 de junho" },
  "06-18": { nome: "São Gregório Barbarigo", descricao: "Cardeal reformador que seguiu o espírito de São Carlos Borromeu.", festa: "18 de junho" },
  "06-19": { nome: "São Romualdo", descricao: "Abade e fundador da Ordem dos Camaldulenses.", festa: "19 de junho" },
  "06-20": { nome: "Papa São Silvério", descricao: "Papa e mártir, vítima de intrigas políticas e defensor da verdade.", festa: "20 de junho" },
  "06-21": { nome: "São Luís Gonzaga", descricao: "Religioso jesuíta e padroeiro da juventude cristã.", festa: "21 de junho" },
  "06-22": { nome: "Santos João Fisher e Tomás Moore", descricao: "Mártires ingleses que preferiram a morte à apostasia.", festa: "22 de junho" },
  "06-23": { nome: "São José Cafasso", descricao: "Sacerdote que assistia os condenados à morte e mestre de santos.", festa: "23 de junho" },
  "06-24": { nome: "Natividade de São João Batista", descricao: "Celebramos o nascimento do Precursor do Senhor.", festa: "24 de junho" },
  "06-25": { nome: "São Guilherme de Vercelli", descricao: "Abade e fundador de mosteiros na Itália.", festa: "25 de junho" },
  "06-26": { nome: "São Josemaria Escrivá", descricao: "Fundador do Opus Dei, pregador da santidade na vida cotidiana.", festa: "26 de junho" },
  "06-27": { nome: "São Cirilo de Alexandria", descricao: "Bispo e Doutor da Igreja, defensor da maternidade divina de Maria.", festa: "27 de junho" },
  "06-28": { nome: "Irineu de Lyon", descricao: "Bispo e mártir, grande teólogo contra as heresias gnósticas.", festa: "28 de junho" },
  "06-29": { nome: "São Pedro e São Paulo", descricao: "Colunas da Igreja, mártires e fundadores da fé em Roma.", festa: "29 de junho" },
  "06-30": { nome: "Santos Protomártires de Roma", descricao: "Os primeiros cristãos martirizados por Nero após o incêndio de Roma.", festa: "30 de junho" },
  "07-01": { nome: "São Junípero Serra", descricao: "Missionário franciscano, fundador de missões na Califórnia.", festa: "1 de julho" },
  "07-02": { nome: "São Bernardino Realino", descricao: "Jesuíta que serviu com extrema caridade o povo de Lecce.", festa: "2 de julho" },
  "07-03": { nome: "São Tomé", descricao: "Apóstolo que professou a fé ao tocar as feridas do Cristo Ressuscitado.", festa: "3 de julho" },
  "07-04": { nome: "Santa Isabel de Portugal", descricao: "Rainha da paz e defensora dos pobres e doentes.", festa: "4 de julho" },
  "07-05": { nome: "Santo Antônio Maria Zaccaria", descricao: "Fundador dos Barnabitas e promotor da devoção à Eucaristia.", festa: "5 de julho" },
  "07-06": { nome: "Santa Maria Goretti", descricao: "Jovem mártir da pureza que perdoou seu assassino.", festa: "6 de julho" },
  "07-07": { nome: "São Panteno", descricao: "Padre da Igreja e mestre da escola teológica de Alexandria.", festa: "7 de julho" },
  "07-08": { nome: "Santos Adriano e Natália", descricao: "Cônjuges que testemunharam a fé juntos até o martírio.", festa: "8 de julho" },
  "07-09": { nome: "Santa Paulina do Coração Agonizante de Jesus", descricao: "Primeira santa do Brasil, dedicada aos doentes e idosos.", festa: "9 de julho" },
  "07-10": { nome: "Santos Sete Irmãos Mártires", descricao: "Filhos de Santa Felicidade, martirizados pela fé em Roma.", festa: "10 de julho" },
  "07-11": { nome: "São Bento de Núrsia", descricao: "Pai do monaquismo ocidental e padroeiro da Europa.", festa: "11 de julho" },
  "07-12": { nome: "Santos Luís Martin e Zélia Guérin", descricao: "Pais de Santa Teresinha, exemplo de santidade no matrimônio.", festa: "12 de julho" },
  "07-13": { nome: "Santa Henrique e Santa Cunegunda", descricao: "Casal real que governou com justiça e fé no século XI.", festa: "13 de julho" },
  "07-14": { nome: "São Camilo de Lellis", descricao: "Padroeiro dos enfermos e fundadores dos Ministros dos Enfermos.", festa: "14 de julho" },
  "07-15": { nome: "São Boaventura", descricao: "Doutor Seráfico, grande filósofo e místico franciscano.", festa: "15 de julho" },
  "07-16": { nome: "Nossa Senhora do Carmo", descricao: "A Virgem que entregou o escapulário como sinal de salvação.", festa: "16 de julho" },
  "07-17": { nome: "Leo Ignácio Mangin e Companheiros", descricao: "Mártires jesuítas na China durante a revolta dos Boxers.", festa: "17 de julho" },
  "07-18": { nome: "São Frederico de Utrecht", descricao: "Bispo e mártir, assassinado por pregar contra o adultério real.", festa: "18 de julho" },
  "07-19": { nome: "Santo Arsênio", descricao: "Eremita egípcio famoso por sua vida de silêncio e lágrimas.", festa: "19 de julho" },
  "07-20": { nome: "Santo Apolinário de Ravena", descricao: "Bispo e mártir, discípulo de São Pedro e apóstolo de Ravena.", festa: "20 de julho" },
  "07-21": { nome: "São Lourenço de Brindisi", descricao: "Capuchinho e Doutor da Igreja, diplomata e teólogo.", festa: "21 de julho" },
  "07-22": { nome: "Santa Maria Madalena", descricao: "A 'Apóstola dos Apóstolos', primeira testemunha da Ressurreição.", festa: "22 de julho" },
  "07-23": { nome: "Santa Brígida da Suécia", descricao: "Mística, fundadora e padroeira da Europa.", festa: "23 de julho" },
  "07-24": { nome: "São Charbel Makhlouf", descricao: "Monge maronita libanês conhecido por seus milagres.", festa: "24 de julho" },
  "07-25": { nome: "São Tiago Maior", descricao: "Apóstolo e primeiro dos doze a sofrer o martírio por Cristo.", festa: "25 de julho" },
  "07-26": { nome: "Santos Joaquim e Ana", descricao: "Pais da Virgem Maria e avós de Jesus.", festa: "26 de julho" },
  "07-27": { nome: "São Pantaleão", descricao: "Médico e mártir, um dos 14 santos auxiliares.", festa: "27 de julho" },
  "07-28": { nome: "São Pedro Poveda", descricao: "Sacerdote e mártir espanhol, fundador da Instituição Teresiana.", festa: "28 de julho" },
  "07-29": { nome: "Santa Marta, Maria e Lázaro", descricao: "Os amigos de Jesus que O acolheram em sua casa em Betânia.", festa: "29 de julho" },
  "07-30": { nome: "São Pedro Crisólogo", descricao: "Bispo e Doutor da Igreja, conhecido por seus sermões eloquentes.", festa: "30 de julho" },
  "07-31": { nome: "São Inácio de Loyola", descricao: "Fundador da Companhia de Jesus (Jesuítas) e autor dos Exercícios Espirituais.", festa: "31 de julho" },
  "08-01": { nome: "Santo Afonso Maria de Ligório", descricao: "Doutor da Igreja e fundador dos Redentoristas, mestre da moral.", festa: "1 de agosto" },
  "08-02": { nome: "Santo Eusébio de Vercelli", descricao: "Bispo que lutou contra o arianismo e fundou a vida comum clerical.", festa: "2 de agosto" },
  "08-03": { nome: "Santa Lídia", descricao: "A primeira convertida de São Paulo na Europa, em Filipos.", festa: "3 de agosto" },
  "08-04": { nome: "São João Maria Vianney", descricao: "O Cura d'Ars, padroeiro dos párocos e modelo de confessor.", festa: "4 de agosto" },
  "08-05": { nome: "Dedicação da Basílica de Santa Maria Maior", descricao: "Celebração do milagre da neve e honra à Mãe de Deus em Roma.", festa: "5 de agosto" },
  "08-06": { nome: "Transfiguração do Senhor", descricao: "Jesus revela Sua glória divina aos apóstolos no monte Tabor.", festa: "6 de agosto" },
  "08-07": { nome: "São Sisto II e Companheiros", descricao: "Papa e mártires mortos durante a celebração da missa nas catacumbas.", festa: "7 de agosto" },
  "08-08": { nome: "São Domingos de Gusmão", descricao: "Fundador da Ordem dos Pregadores (Dominicanos) e devoto do Rosário.", festa: "8 de agosto" },
  "08-09": { nome: "Santa Teresa Benedita da Cruz", descricao: "Edith Stein, filósofa, carmelita e mártir em Auschwitz.", festa: "9 de agosto" },
  "08-10": { nome: "São Lourenço", descricao: "Diácono e mártir romano, famoso por seu serviço aos pobres.", festa: "10 de agosto" },
  "08-11": { nome: "Santa Clara de Assis", descricao: "Fundadora das Clarissas e fiel seguidora da pobreza franciscana.", festa: "11 de agosto" },
  "08-12": { nome: "Santa Joana de Chantal", descricao: "Viúva e fundadora da Ordem da Visitação com São Francisco de Sales.", festa: "12 de agosto" },
  "08-13": { nome: "Santos Ponciano e Hipólito", descricao: "Papa e teólogo que morreram exilados nas minas da Sardenha.", festa: "13 de agosto" },
  "08-14": { nome: "São Maximiliano Maria Kolbe", descricao: "Mártir da caridade que deu a vida por outro prisioneiro em Auschwitz.", festa: "14 de agosto" },
  "08-15": { nome: "Assunção de Nossa Senhora", descricao: "Maria elevada ao céu em corpo e alma pela glória de Deus.", festa: "15 de agosto" },
  "08-16": { nome: "São Estêvão da Hungria", descricao: "Primeiro rei húngaro, converteu seu povo à fé cristã.", festa: "16 de agosto" },
  "08-17": { nome: "Santa Beatriz da Silva", descricao: "Fundadora da Ordem da Imaculada Conceição (Concepcionistas).", festa: "17 de agosto" },
  "08-18": { nome: "Santa Helena", descricao: "Mãe do imperador Constantino, descobridora da Santa Cruz.", festa: "18 de agosto" },
  "08-19": { nome: "São João Eudes", descricao: "Sacerdote e promotor da devoção aos Sagrados Corações.", festa: "19 de agosto" },
  "08-20": { nome: "São Bernardo de Claraval", descricao: "Doutor Melífluo, abade cisterciense e místico mariano.", festa: "20 de agosto" },
  "08-21": { nome: "São Pio X", descricao: "Papa da Eucaristia, combateu o modernismo e incentivou a comunhão frequente.", festa: "21 de agosto" },
  "08-22": { nome: "Nossa Senhora Rainha", descricao: "Maria coroada como Rainha do céu e da terra.", festa: "22 de agosto" },
  "08-23": { nome: "Santa Rosa de Lima", descricao: "Primeira santa das Américas, mística de profunda penitência.", festa: "23 de agosto" },
  "08-24": { nome: "São Bartolomeu", descricao: "Apóstolo de Jesus, identificado como o Natanael do Evangelho.", festa: "24 de agosto" },
  "08-25": { nome: "São Luís IX de França", descricao: "Rei santo, modelo de justiça, piedade e defesa da fé.", festa: "25 de agosto" },
  "08-26": { nome: "Santa Maria de Jesus Crucificado", descricao: "Carmelita palestina, conhecida como a 'Pequena Árabe'.", festa: "26 de agosto" },
  "08-27": { nome: "Santa Mônica", descricao: "Mãe de Santo Agostinho, que através das lágrimas obteve sua conversão.", festa: "27 de agosto" },
  "08-28": { nome: "Santo Agostinho", descricao: "Bispo de Hipona e Doutor da Graça, autor das 'Confissões'.", festa: "28 de agosto" },
  "08-29": { nome: "Martírio de São João Batista", descricao: "Celebramos a morte do Precursor por sua fidelidade à verdade.", festa: "29 de agosto" },
  "08-30": { nome: "São Félix e São Adauto", descricao: "Mártires que confessaram a fé durante a perseguição de Diocleciano.", festa: "30 de agosto" },
  "08-31": { nome: "São Raimundo Nonato", descricao: "Religioso mercedário que libertou escravos cristãos na África.", festa: "31 de agosto" },
  "09-01": { nome: "São Egídio", descricao: "Abade eremita, um dos santos mais populares da Idade Média.", festa: "1 de setembro" },
  "09-02": { nome: "Santa Inês de Bohemia", descricao: "Princesa que fundou o primeiro mosteiro de Clarissas em Praga.", festa: "2 de setembro" },
  "09-03": { nome: "São Gregório Magno", descricao: "Papa e Doutor da Igreja, reformador da liturgia e do canto gregoriano.", festa: "3 de setembro" },
  "09-04": { nome: "Santa Rosália de Palermo", descricao: "Virgem eremita e padroeira contra as pestes.", festa: "4 de setembro" },
  "09-05": { nome: "Santa Teresa de Calcutá", descricao: "Fundadora das Missionárias da Caridade, serva dos 'pobres entre os pobres'.", festa: "5 de setembro" },
  "09-06": { nome: "São Zacarias", descricao: "Profeta do Antigo Testamento que predisse a entrada de Jesus em Jerusalém.", festa: "6 de setembro" },
  "09-07": { nome: "Santa Regina", descricao: "Mártir francesa que preferiu a morte a casar-se com um pagão.", festa: "7 de setembro" },
  "09-08": { nome: "Natividade de Nossa Senhora", descricao: "A aurora da salvação: o nascimento da Mãe do Salvador.", festa: "8 de setembro" },
  "09-09": { nome: "São Pedro Claver", descricao: "Jesuíta espanhol e 'escravo dos escravos' na Colômbia.", festa: "9 de setembro" },
  "09-10": { nome: "São Nicolau de Tolentino", descricao: "Frade agostiniano conhecido por sua caridade e milagres.", festa: "10 de setembro" },
  "09-11": { nome: "São João Crisóstomo", descricao: "Bispo de Constantinopla, Doutor da Igreja e 'Boca de Ouro'.", festa: "11 de setembro" },
  "09-12": { nome: "Santíssimo Nome de Maria", descricao: "Honramos o nome da Virgem como refúgio e intercessão poderosa.", festa: "12 de setembro" },
  "09-13": { nome: "São João Crisóstomo (festa universal)", descricao: "Doutor da Igreja, famoso por sua pregação eloquente.", festa: "13 de setembro" },
  "09-14": { nome: "Exaltação da Santa Cruz", descricao: "Celebramos a Cruz como instrumento de nossa redenção.", festa: "14 de setembro" },
  "09-15": { nome: "Nossa Senhora das Dores", descricao: "Recordamos o sofrimento de Maria junto à Cruz de seu Filho.", festa: "15 de setembro" },
  "09-16": { nome: "Santos Cornélio e Cipriano", descricao: "Papa e Bispo que defenderam a unidade da Igreja sob perseguição.", festa: "16 de setembro" },
  "09-17": { nome: "São Roberto Belarmino", descricao: "Cardeal jesuíta e Doutor da Igreja, mestre das controvérsias.", festa: "17 de setembro" },
  "09-18": { nome: "São José de Cupertino", descricao: "O 'santo voador', padroeiro dos estudantes com dificuldades.", festa: "18 de setembro" },
  "09-19": { nome: "São Januário", descricao: "Bispo e mártir de Nápoles, famoso pelo milagre da liquefação do sangue.", festa: "19 de setembro" },
  "09-20": { nome: "Santo André Kim e Companheiros", descricao: "Primeiros mártires coreanos que plantaram a fé na península.", festa: "20 de setembro" },
  "09-21": { nome: "São Mateus", descricao: "Apóstolo e Evangelista, o cobrador de impostos que seguiu a Cristo.", festa: "21 de setembro" },
  "09-22": { nome: "São Maurício e Companheiros", descricao: "Soldados da Legião Tebana mártires por não sacrificarem aos ídolos.", festa: "22 de setembro" },
  "09-23": { nome: "São Pio de Pietrelcina", descricao: "Padre Pio, capuchinho estigmatizado e grande confessor.", festa: "23 de setembro" },
  "09-24": { nome: "Nossa Senhora das Mercês", descricao: "Devoção à Virgem como libertadora dos cativos cristãos.", festa: "24 de setembro" },
  "09-25": { nome: "São Cleofas", descricao: "Discípulo de Emaús que reconheceu Jesus ao partir do pão.", festa: "25 de setembro" },
  "09-26": { nome: "Santos Cosme e Damião", descricao: "Médicos mártires que tratavam os doentes gratuitamente por amor a Cristo.", festa: "26 de setembro" },
  "09-27": { nome: "São Vicente de Paulo", descricao: "Padroeiro das obras de caridade e fundador dos Lazaristas e Filhas da Caridade.", festa: "27 de setembro" },
  "09-28": { nome: "São Venceslau", descricao: "Duque da Boêmia e mártir, modelo de governante cristão.", festa: "28 de setembro" },
  "09-29": { nome: "Santos Arcanjos Miguel, Gabriel e Rafael", descricao: "Os príncipes da milícia celestial e mensageiros de Deus.", festa: "29 de setembro" },
  "09-30": { nome: "São Jerônimo", descricao: "Doutor da Igreja e tradutor da Bíblia para o latim (Vulgata).", festa: "30 de setembro" },
  "10-01": { nome: "Santa Teresinha do Menino Jesus", descricao: "Padroeira das Missões e Doutora da Igreja, mestra da 'Pequena Via'.", festa: "1 de outubro" },
  "10-02": { nome: "Santos Anjos da Guarda", descricao: "Celebramos a proteção constante dos anjos sobre cada um de nós.", festa: "2 de outubro" },
  "10-03": { nome: "Santos Mártires de Cunhaú e Uruaçu", descricao: "Mártires brasileiros massacrados por ódio à fé católica.", festa: "3 de outubro" },
  "10-04": { nome: "São Francisco de Assis", descricao: "O 'Poverello', fundador da Ordem Franciscana e amante da criação.", festa: "4 de outubro" },
  "10-05": { nome: "Santa Faustina Kowalska", descricao: "A secretária da Divina Misericórdia, mística polonesa.", festa: "5 de outubro" },
  "10-06": { nome: "São Bruno", descricao: "Fundador da Ordem da Cartuxa, mestre do silêncio e da solidão.", festa: "6 de outubro" },
  "10-07": { nome: "Nossa Senhora do Rosário", descricao: "Celebração da vitória de Lepanto e do poder da oração do Rosário.", festa: "7 de outubro" },
  "10-08": { nome: "Santa Pelágia", descricao: "Atriz convertida que viveu uma vida de extrema penitência no deserto.", festa: "8 de outubro" },
  "10-09": { nome: "São Dionísio e Companheiros", descricao: "Primeiro bispo de Paris e mártir, decapitado por Cristo.", festa: "9 de outubro" },
  "10-10": { nome: "São Francisco de Borja", descricao: "Nobre jesuíta que renunciou ao mundo pela glória de Deus.", festa: "10 de outubro" },
  "10-11": { nome: "São João XXIII", descricao: "O 'Papa Bom', que convocou o Concílio Vaticano II.", festa: "11 de outubro" },
  "10-12": { nome: "Nossa Senhora Aparecida", descricao: "Padroeira do Brasil, encontrada por pescadores no Rio Paraíba.", festa: "12 de outubro" },
  "10-13": { nome: "São Eduardo o Confessor", descricao: "Rei da Inglaterra conhecido por sua piedade e amor aos pobres.", festa: "13 de outubro" },
  "10-14": { nome: "São Calisto I", descricao: "Papa e mártir, que organizou as catacumbas de Roma.", festa: "14 de outubro" },
  "10-15": { nome: "Santa Teresa de Ávila", descricao: "Doutora da Igreja e reformadora do Carmelo, mestra da oração.", festa: "15 de outubro" },
  "10-16": { nome: "Santa Edwiges", descricao: "Padroeira dos endividados, modelo de humildade e caridade.", festa: "16 de outubro" },
  "10-17": { nome: "Santo Inácio de Antioquia", descricao: "Bispo e mártir, o 'Trigo de Cristo' moído nos dentes das feras.", festa: "17 de outubro" },
  "10-18": { nome: "São Lucas Evangelista", descricao: "Médico, pintor e autor do terceiro Evangelho e dos Atos.", festa: "18 de outubro" },
  "10-19": { nome: "Santos Isaac Jogues e João de Brébeuf", descricao: "Mártires jesuítas na América do Norte.", festa: "19 de outubro" },
  "10-20": { nome: "São Paulo da Cruz", descricao: "Fundador dos Passionistas, pregador da Paixão de Cristo.", festa: "20 de outubro" },
  "10-21": { nome: "Santa Úrsula e Companheiras", descricao: "Virgens mártires que deram a vida pela fé e pureza.", festa: "21 de outubro" },
  "10-22": { nome: "São João Paulo II", descricao: "O Papa missionário que levou o Evangelho a todos os cantos da terra.", festa: "22 de outubro" },
  "10-23": { nome: "São João da Capistrano", descricao: "Frade franciscano e defensor da cristandade contra o invasor.", festa: "23 de outubro" },
  "10-24": { nome: "São Antônio Maria Claret", descricao: "Fundador dos Claretianos e apóstolo de Cuba e Espanha.", festa: "24 de outubro" },
  "10-25": { nome: "Santo Antônio de Sant'Anna Galvão", descricao: "Frei Galvão, o primeiro santo brasileiro, famoso pelas pílulas milagrosas.", festa: "25 de outubro" },
  "10-26": { nome: "Santo Evaristo", descricao: "Papa e mártir que organizou os títulos paroquiais em Roma.", festa: "26 de outubro" },
  "10-27": { nome: "São Gonçalo de Lagos", descricao: "Agostiniano português dedicado ao ensino e caridade.", festa: "27 de outubro" },
  "10-28": { nome: "Santos Simão e Judas Tadeu", descricao: "Apóstolos de Jesus; Judas é o padroeiro das causas desesperadas.", festa: "28 de outubro" },
  "10-29": { nome: "São Narciso de Jerusalém", descricao: "Bispo que presidiu o sínodo sobre a celebração da Páscoa.", festa: "29 de outubro" },
  "10-30": { nome: "São Geraldo de Potenza", descricao: "Bispo amado por sua retidão e cuidado pastoral.", festa: "30 de outubro" },
  "10-31": { nome: "São Afonso Rodrigues", descricao: "Irmão jesuíta que serviu como porteiro com extrema santidade.", festa: "31 de outubro" },
  "11-01": { nome: "Solenidade de Todos os Santos", descricao: "Honramos todos os santos que gozam da visão beatífica no céu.", festa: "1 de novembro" },
  "11-02": { nome: "Comemoração de Todos os Fiéis Defuntos", descricao: "Dia de oração e sufrágio pelas almas no Purgatório.", festa: "2 de novembro" },
  "11-03": { nome: "São Martinho de Porres", descricao: "O 'Santo da Vassoura', modelo de humildade e caridade racial.", festa: "3 de novembro" },
  "11-04": { nome: "São Carlos Borromeu", descricao: "Bispo reformador e gigante da caridade durante a peste em Milão.", festa: "4 de novembro" },
  "11-05": { nome: "Santos Zacarias e Isabel", descricao: "Pais de São João Batista e modelos de fidelidade a Deus.", festa: "5 de novembro" },
  "11-06": { nome: "São Nuno de Santa Maria", descricao: "O Condestável de Portugal que se tornou carmelita.", festa: "6 de novembro" },
  "11-07": { nome: "São Vilibrordo", descricao: "Bispo beneditino e apóstolo da Holanda e Luxemburgo.", festa: "7 de novembro" },
  "11-08": { nome: "Beato João Duns Escoto", descricao: "Doutor Sutil, defensor do dogma da Imaculada Conceição.", festa: "8 de novembro" },
  "11-09": { nome: "Dedicação da Basílica de Latrão", descricao: "Celebramos a 'mãe e cabeça de todas as igrejas do mundo'.", festa: "9 de novembro" },
  "11-10": { nome: "São Leão Magno", descricao: "Papa e Doutor da Igreja, defensor da unidade e da fé ortodoxa.", festa: "10 de novembro" },
  "11-11": { nome: "São Martinho de Tours", descricao: "O soldado que partiu o manto com um pobre e tornou-se bispo.", festa: "11 de novembro" },
  "11-12": { nome: "São Josafá", descricao: "Bispo e mártir, lutou pela união da Igreja Oriental com Roma.", festa: "12 de novembro" },
  "11-13": { nome: "São Diego de Alcalá", descricao: "Franciscano leigo conhecido por seus milagres e amor aos pobres.", festa: "13 de novembro" },
  "11-14": { nome: "São Nicolau Tavelic e Companheiros", descricao: "Missionários mártires na Terra Santa.", festa: "14 de novembro" },
  "11-15": { nome: "Santo Alberto Magno", descricao: "Doutor Universal, mestre de São Tomás de Aquino e cientista.", festa: "15 de novembro" },
  "11-16": { nome: "Santa Gertrudes Magna", descricao: "Mística beneditina e grande vidente do Sagrado Coração.", festa: "16 de novembro" },
  "11-17": { nome: "Santa Isabel da Hungria", descricao: "Princesa que se dedicou inteiramente ao serviço dos pobres.", festa: "17 de novembro" },
  "11-18": { nome: "Dedicação das Basílicas de São Pedro e São Paulo", descricao: "Honra aos túmulos dos dois grandes apóstolos em Roma.", festa: "18 de novembro" },
  "11-19": { nome: "São Roque González e Companheiros", descricao: "Mártires das reduções jesuíticas na América do Sul.", festa: "19 de novembro" },
  "11-20": { nome: "São Félix de Valois", descricao: "Cofundador da Ordem da Santíssima Trindade para libertação de cativos.", festa: "20 de novembro" },
  "11-21": { nome: "Apresentação de Nossa Senhora", descricao: "Maria oferecida a Deus no Templo ainda criança.", festa: "21 de novembro" },
  "11-22": { nome: "Santa Cecília", descricao: "Virgem e mártir, padroeira da música sacra.", festa: "22 de novembro" },
  "11-23": { nome: "São Clemente I", descricao: "Papa e mártir, autor de importantes epístolas à Igreja primitiva.", festa: "23 de novembro" },
  "11-24": { nome: "Santo André Dung-Lac e Companheiros", descricao: "Mártires vietnamitas que sofreram por sua fé católica.", festa: "24 de novembro" },
  "11-25": { nome: "Santa Catarina de Alexandria", descricao: "Virgem e mártir, padroeira dos filósofos e estudantes.", festa: "25 de novembro" },
  "11-26": { nome: "São Leonardo de Porto Maurício", descricao: "Pregador franciscano e grande promotor da Via-Sacra.", festa: "26 de novembro" },
  "11-27": { nome: "Nossa Senhora da Medalha Milagrosa", descricao: "Celebramos a aparição de Maria a Santa Catarina Labouré.", festa: "27 de novembro" },
  "11-28": { nome: "São Tiago das Marcas", descricao: "Pregador e defensor da fé contra as heresias.", festa: "28 de novembro" },
  "11-29": { nome: "São Saturnino", descricao: "Mártir e primeiro bispo de Toulouse, na França.", festa: "29 de novembro" },
  "11-30": { nome: "São André Apóstolo", descricao: "Irmão de Pedro e o primeiro a ser chamado por Jesus.", festa: "30 de novembro" },
  "12-01": { nome: "Santo Elígio", descricao: "Padroeiro dos ourives e ferreiros, modelo de honestidade e caridade.", festa: "1 de dezembro" },
  "12-02": { nome: "Santa Bibiana", descricao: "Virgem e mártir romana que resistiu à apostasia.", festa: "2 de dezembro" },
  "12-03": { nome: "São Francisco Xavier", descricao: "Apóstolo das Índias e do Japão, padroeiro das missões.", festa: "3 de dezembro" },
  "12-04": { nome: "São João Damasceno", descricao: "Doutor da Igreja e defensor das imagens sagradas contra o iconoclasmo.", festa: "4 de dezembro" },
  "12-05": { nome: "São Sabas", descricao: "Abade na Palestina, fundador de vários mosteiros ('Lavras').", festa: "5 de dezembro" },
  "12-06": { nome: "São Nicolau de Mira", descricao: "Bispo caridoso, protetor das crianças e inspirador do Papai Noel.", festa: "6 de dezembro" },
  "12-07": { nome: "Santo Ambrósio", descricao: "Bispo de Milão, Doutor da Igreja e mestre de Santo Agostinho.", festa: "7 de dezembro" },
  "12-08": { nome: "Imaculada Conceição de Nossa Senhora", descricao: "Dogma que afirma que Maria foi preservada do pecado original.", festa: "8 de dezembro" },
  "12-09": { nome: "São Juan Diego", descricao: "O vidente de Nossa Senhora de Guadalupe, místico indígena.", festa: "9 de dezembro" },
  "12-10": { nome: "Nossa Senhora de Loreto", descricao: "Celebração da transladação da Santa Casa de Nazaré.", festa: "10 de dezembro" },
  "12-11": { nome: "São Dâmaso I", descricao: "Papa que comissionou a tradução da Vulgata a São Jerônimo.", festa: "11 de dezembro" },
  "12-12": { nome: "Nossa Senhora de Guadalupe", descricao: "Padroeira das Américas, que deixou sua imagem no manto de Juan Diego.", festa: "12 de dezembro" },
  "12-13": { nome: "Santa Luzia", descricao: "Virgem e mártir, protetora da visão e portadora da luz da fé.", festa: "13 de dezembro" },
  "12-14": { nome: "São João da Cruz", descricao: "Doutor Místico e reformador do Carmelo com Santa Teresa.", festa: "14 de dezembro" },
  "12-15": { nome: "Santa Virgínia Centurione Bracelli", descricao: "Fundadora dedicada à educação e amparo de jovens pobres.", festa: "15 de dezembro" },
  "12-16": { nome: "Santa Adelaide", descricao: "Imperatriz que exerceu o poder com caridade e justiça cristã.", festa: "16 de dezembro" },
  "12-17": { nome: "São Lázaro", descricao: "O amigo de Jesus ressuscitado dos mortos.", festa: "17 de dezembro" },
  "12-18": { nome: "Expectação do Parto de Nossa Senhora", descricao: "O dia de Nossa Senhora do Ó, em santa espera pelo Natal.", festa: "18 de dezembro" },
  "12-19": { nome: "Santo Urbano V", descricao: "Papa que trabalhou pela reforma da Igreja e o retorno a Roma.", festa: "19 de dezembro" },
  "12-20": { nome: "São Domingos de Silos", descricao: "Abade beneditino conhecido por seus milagres e restauração monástica.", festa: "20 de dezembro" },
  "12-21": { nome: "São Pedro Canísio", descricao: "Jesuíta e Doutor da Igreja, o 'Segundo Apóstolo da Alemanha'.", festa: "21 de dezembro" },
  "12-22": { nome: "Santa Francisca Xavier Cabrini", descricao: "Padroeira dos imigrantes e primeira cidadã americana canonizada.", festa: "22 de dezembro" },
  "12-23": { nome: "São João Câncio", descricao: "Sacerdote polonês modelo de ciência unida à grande caridade.", festa: "23 de dezembro" },
  "12-24": { nome: "Santos Antepassados de Jesus", descricao: "Honramos os patriarcas e justos que esperaram o Messias.", festa: "24 de dezembro" },
  "12-25": { nome: "Natal de Nosso Senhor Jesus Cristo", descricao: "O Verbo de Deus se faz homem e habita entre nós.", festa: "25 de dezembro" },
  "12-26": { nome: "São Estêvão", descricao: "O primeiro mártir da Igreja, cheio de fé e do Espírito Santo.", festa: "26 de dezembro" },
  "12-27": { nome: "São João Evangelista", descricao: "O 'discípulo amado', apóstolo da caridade e teólogo do Verbo.", festa: "27 de dezembro" },
  "12-28": { nome: "Santos Inocentes", descricao: "As crianças mártires de Belém que deram a vida por Cristo.", festa: "28 de dezembro" },
  "12-29": { nome: "São Tomás Becket", descricao: "Bispo e mártir, assassinado na catedral por defender a Igreja.", festa: "29 de dezembro" },
  "12-30": { nome: "Sagrada Família", descricao: "Modelo de santidade para todos os lares cristãos.", festa: "30 de dezembro" },
  "12-31": { nome: "São Silvestre I", descricao: "Papa do tempo de Constantino, encerra o ano civil em ação de graças.", festa: "31 de dezembro" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function getTodayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getSantoDodia(): Santo {
  const key = getTodayKey();
  return SANTOS[key] ?? FALLBACK;
}

// ─── Primary API: calendario.catolico.app ──────────────────────────────────
async function fetchFromPrimaryApi(signal: AbortSignal): Promise<Santo | null> {
  try {
    const res = await fetch("https://api.calendario.catolico.app/v1/today", {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const nome: string =
      data?.santo || data?.name || data?.title || data?.celebration || "";
    if (!nome || nome.trim().length < 3) return null;
    return {
      nome: nome.trim(),
      descricao: data?.description || data?.descricao || FALLBACK.descricao,
      festa: data?.date || data?.data || getTodayKey(),
    };
  } catch {
    return null;
  }
}

// ─── Fallback API: calapi.inadiutorium.cz ──────────────────────────────────
async function fetchFromFallbackApi(signal: AbortSignal): Promise<Santo | null> {
  try {
    const res = await fetch(
      "https://calapi.inadiutorium.cz/api/v0/en/calendars/general-en/today",
      { signal, headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const celebrations: Array<{ title?: string; name?: string }> =
      data?.celebrations || [];
    const title = celebrations[0]?.title || celebrations[0]?.name || "";
    if (!title || title.trim().length < 3) return null;
    return {
      nome: title.trim(),
      descricao: FALLBACK.descricao,
      festa: getTodayKey(),
    };
  } catch {
    return null;
  }
}

// ─── Main export: async with AsyncStorage cache ────────────────────────────
export async function fetchSantoDodia(): Promise<Santo> {
  const todayStr = getTodayDateString();
  const cacheKey = CACHE_KEY_PREFIX + todayStr;

  // 1. Check persistent cache
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed: Santo = JSON.parse(cached);
      if (parsed?.nome) return parsed;
    }
  } catch {
    // ignore cache read error
  }

  // 2. Static calendar — always reliable
  const staticSanto = SANTOS[getTodayKey()];
  if (staticSanto) {
    // Persist so next launch is instant
    try { await AsyncStorage.setItem(cacheKey, JSON.stringify(staticSanto)); } catch {}
    return staticSanto;
  }

  // 3. Try primary API, then fallback API (for days not in static calendar)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const primary = await fetchFromPrimaryApi(controller.signal);
    if (primary) {
      clearTimeout(timer);
      try { await AsyncStorage.setItem(cacheKey, JSON.stringify(primary)); } catch {}
      return primary;
    }

    const fallback = await fetchFromFallbackApi(controller.signal);
    clearTimeout(timer);
    if (fallback) {
      try { await AsyncStorage.setItem(cacheKey, JSON.stringify(fallback)); } catch {}
      return fallback;
    }
  } catch {
    clearTimeout(timer);
  }

  // 4. Final fallback
  return FALLBACK;
}
