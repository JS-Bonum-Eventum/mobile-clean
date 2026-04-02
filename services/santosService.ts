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
  "01-05": { nome: "São João Neumann", descricao: "Bispo de Filadélfia, fundou centenas de escolas católicas.", festa: "5 de janeiro" },
  "01-06": { nome: "Epifania do Senhor", descricao: "Os Reis Magos vêm adorar o Menino Jesus, manifestado a todas as nações.", festa: "6 de janeiro" },
  "01-07": { nome: "São Raimundo de Peñafort", descricao: "Dominicano e canonista, trabalhou pela conversão dos mouros e judeus.", festa: "7 de janeiro" },
  "01-08": { nome: "Batismo do Senhor", descricao: "Jesus é batizado por João no Jordão e proclamado Filho amado do Pai.", festa: "8 de janeiro" },
  "01-09": { nome: "Beata Ana de São Bartolomeu", descricao: "Companheira de Santa Teresa de Ávila, carmelita descalça.", festa: "9 de janeiro" },
  "01-10": { nome: "São Guilherme de Bourges", descricao: "Arcebispo francês do século XII, conhecido por sua vida de penitência.", festa: "10 de janeiro" },
  "01-11": { nome: "São Higino", descricao: "Papa e mártir do século II, organizou a hierarquia eclesiástica.", festa: "11 de janeiro" },
  "01-12": { nome: "São Bento Biscop", descricao: "Fundador dos mosteiros de Wearmouth e Jarrow na Inglaterra.", festa: "12 de janeiro" },
  "01-13": { nome: "São Hilário de Poitiers", descricao: "Doutor da Igreja, chamado 'Atanásio do Ocidente' por sua defesa da fé.", festa: "13 de janeiro" },
  "01-14": { nome: "São Félix de Nola", descricao: "Padre e confessor do século III, suportou perseguições pela fé.", festa: "14 de janeiro" },
  "01-15": { nome: "São Paulo Ermitão", descricao: "Primeiro eremita cristão, viveu 90 anos no deserto do Egito.", festa: "15 de janeiro" },
  "01-16": { nome: "São Marcelo I", descricao: "Papa mártir que reorganizou a Igreja após a perseguição de Diocleciano.", festa: "16 de janeiro" },
  "01-17": { nome: "Santo Antão do Deserto", descricao: "Pai do monasticismo, viveu 105 anos de austeridade no Egito.", festa: "17 de janeiro" },
  "01-18": { nome: "Santa Prisca", descricao: "Jovem mártir romana do século I, discípula dos apóstolos.", festa: "18 de janeiro" },
  "01-19": { nome: "São Canuto da Dinamarca", descricao: "Rei mártir, tentou evangelizar os Vikings e morreu pela fé.", festa: "19 de janeiro" },
  "01-20": { nome: "São Sebastião", descricao: "Mártir romano soldado, invocado contra a peste e por esportistas.", festa: "20 de janeiro" },
  "01-21": { nome: "Santa Inês", descricao: "Jovem mártir de 13 anos que preferiu a morte a renunciar à fé.", festa: "21 de janeiro" },
  "01-22": { nome: "São Vicente de Saragoça", descricao: "Diácono e mártir espanhol, padroeiro dos vinhateiros.", festa: "22 de janeiro" },
  "01-23": { nome: "São Ildefonso de Toledo", descricao: "Arcebispo e doutor espanhol, grande devoto da Virgem Maria.", festa: "23 de janeiro" },
  "01-24": { nome: "São Francisco de Sales", descricao: "Doutor da Igreja, padroeiro dos jornalistas e escritores.", festa: "24 de janeiro" },
  "01-25": { nome: "Conversão de São Paulo", descricao: "Commemoração da transformação radical do perseguidor em apóstolo.", festa: "25 de janeiro" },
  "01-26": { nome: "Santos Timóteo e Tito", descricao: "Discípulos prediletos de São Paulo, primeiros bispos.", festa: "26 de janeiro" },
  "01-27": { nome: "Santa Ângela Mérici", descricao: "Fundadora das Ursulinas, pioneira da educação feminina.", festa: "27 de janeiro" },
  "01-28": { nome: "Santo Tomás de Aquino", descricao: "Doutor Angélico, maior teólogo da Igreja Católica.", festa: "28 de janeiro" },
  "01-29": { nome: "São Sulpício de Bourges", descricao: "Bispo francês do século VII, conhecido por sua caridade.", festa: "29 de janeiro" },
  "01-30": { nome: "São Martinho I", descricao: "Papa e mártir que resistiu ao imperador por defender a fé ortodoxa.", festa: "30 de janeiro" },
  "01-31": { nome: "São João Bosco", descricao: "Fundador dos salesianos, apóstolo da juventude italiana.", festa: "31 de janeiro" },
  "02-01": { nome: "São Inácio de Antioquia", descricao: "Bispo e mártir, discípulo do apóstolo João.", festa: "1 de fevereiro" },
  "02-02": { nome: "Apresentação do Senhor", descricao: "Jesus é apresentado no Templo e reconhecido por Simeão como luz das nações.", festa: "2 de fevereiro" },
  "02-03": { nome: "São Brás", descricao: "Bispo e mártir armênio, padroeiro dos males de garganta.", festa: "3 de fevereiro" },
  "02-04": { nome: "São João de Britto", descricao: "Jesuíta português, missionário na Índia e mártir.", festa: "4 de fevereiro" },
  "02-05": { nome: "Santa Ágata", descricao: "Mártir siciliana do século III, invocada contra doenças.", festa: "5 de fevereiro" },
  "02-06": { nome: "São Paulo Miki e Companheiros", descricao: "Mártires japoneses crucificados em Nagasaki em 1597.", festa: "6 de fevereiro" },
  "02-07": { nome: "Beata Eugénia Joubert", descricao: "Religiosa francesa, fundadora de obra educativa para crianças pobres.", festa: "7 de fevereiro" },
  "02-08": { nome: "São Jerônimo Emiliani", descricao: "Fundador dos Somascos, padroeiro dos órfãos e abandonados.", festa: "8 de fevereiro" },
  "02-09": { nome: "Santa Apolônia", descricao: "Mártir alexandrina, padroeira dos dentistas.", festa: "9 de fevereiro" },
  "02-10": { nome: "Santa Escolástica", descricao: "Irmã de São Bento, fundadora do monasticismo feminino ocidental.", festa: "10 de fevereiro" },
  "02-11": { nome: "Nossa Senhora de Lourdes", descricao: "Memória das aparições a Bernadette Soubirous em 1858.", festa: "11 de fevereiro" },
  "02-12": { nome: "São Eulógio de Córdoba", descricao: "Sacerdote e mártir espanhol, morto pelos mouros em 859.", festa: "12 de fevereiro" },
  "02-13": { nome: "São Jordão de Saxônia", descricao: "Segundo Mestre Geral dos Dominicanos, sucessor de São Domingos.", festa: "13 de fevereiro" },
  "02-14": { nome: "São Valentim", descricao: "Mártir romano do século III, padroeiro dos enamorados.", festa: "14 de fevereiro" },
  "02-15": { nome: "Santos Fausto, Januário e Marcial", descricao: "Mártires de Córdoba do século III.", festa: "15 de fevereiro" },
  "02-16": { nome: "São Onésimo", descricao: "Escravo convertido por São Paulo, depois bispo e mártir.", festa: "16 de fevereiro" },
  "02-17": { nome: "Sete Santos Fundadores dos Servitas", descricao: "Fundadores da Ordem dos Servos de Maria no século XIII.", festa: "17 de fevereiro" },
  "02-18": { nome: "São Simeão de Jerusalém", descricao: "Segundo bispo de Jerusalém, parente de Jesus, mártir.", festa: "18 de fevereiro" },
  "02-19": { nome: "São Conrado de Piacenza", descricao: "Nobre italiano que renunciou tudo para viver como eremita.", festa: "19 de fevereiro" },
  "02-20": { nome: "São Francisco de Paola (memorial)", descricao: "Fundador dos Mínimos, famoso por milagres.", festa: "20 de fevereiro" },
  "02-21": { nome: "São Pedro Damião", descricao: "Doutor da Igreja, reformador monástico do século XI.", festa: "21 de fevereiro" },
  "02-22": { nome: "Cátedra de São Pedro", descricao: "Celebramos a missão de Pedro como fundamento e pastor da Igreja.", festa: "22 de fevereiro" },
  "02-23": { nome: "São Policarpo de Esmirna", descricao: "Bispo e mártir, discípulo do apóstolo João, queimado aos 86 anos.", festa: "23 de fevereiro" },
  "02-24": { nome: "São Modesto", descricao: "Mártir do século IV na perseguição de Diocleciano.", festa: "24 de fevereiro" },
  "02-25": { nome: "São Cesário de Nazianzo", descricao: "Médico irmão de São Gregório Nazianzeno, convertido ao monaquismo.", festa: "25 de fevereiro" },
  "02-26": { nome: "São Alexandre de Alexandria", descricao: "Bispo que presidiu o Concílio de Niceia com Atanásio.", festa: "26 de fevereiro" },
  "02-27": { nome: "São Gabriel da Virgem das Dores", descricao: "Passionista italiano, morreu jovem com fama de santidade.", festa: "27 de fevereiro" },
  "02-28": { nome: "Beato Daniel Brottier", descricao: "Espiritano francês, missionário no Senegal e capelão na Primeira Guerra.", festa: "28 de fevereiro" },
  "02-29": { nome: "São Osvaldo de Worcester", descricao: "Arcebispo inglês, reformador monástico do século X.", festa: "29 de fevereiro" },
  "03-01": { nome: "São Davi do País de Gales", descricao: "Padroeiro do País de Gales, bispo missionário do século VI.", festa: "1 de março" },
  "03-02": { nome: "São Simeão o Velho", descricao: "Monge sírio do século V, viveu 37 anos num pilar em oração.", festa: "2 de março" },
  "03-03": { nome: "Santa Catarina Drexel", descricao: "Fundadora das Irmãs do Santíssimo Sacramento, missionária para negros e índios.", festa: "3 de março" },
  "03-04": { nome: "São Casimiro", descricao: "Príncipe polonês do século XV, padroeiro da Polônia.", festa: "4 de março" },
  "03-05": { nome: "São Adriano de Cesareia", descricao: "Mártir da perseguição de Maximiano.", festa: "5 de março" },
  "03-06": { nome: "São Marcos de Mileto", descricao: "Bispo e fundador de mosteiros na Síria do século VI.", festa: "6 de março" },
  "03-07": { nome: "Santas Perpétua e Felicidade", descricao: "Mártires africanas do século III, modelo de coragem e fidelidade.", festa: "7 de março" },
  "03-08": { nome: "São João de Deus", descricao: "Fundador dos Irmãos Hospitaleiros, padroeiro dos doentes.", festa: "8 de março" },
  "03-09": { nome: "Santa Francisca Romana", descricao: "Nobre romana, fundadora das Oblatas Beneditinas.", festa: "9 de março" },
  "03-10": { nome: "São João Ogilvie", descricao: "Jesuíta escocês mártir, beatificado em 1929.", festa: "10 de março" },
  "03-11": { nome: "São Constâncio de Pérugia", descricao: "Sacerdote mártir da perseguição de Aureliano.", festa: "11 de março" },
  "03-12": { nome: "São Gregório I Magno", descricao: "Doutor da Igreja, Papa que reformou a liturgia e o canto gregoriano.", festa: "12 de março" },
  "03-13": { nome: "São Rodrigo de Córdoba", descricao: "Sacerdote mártir morto pelos mouros em 857.", festa: "13 de março" },
  "03-14": { nome: "Santa Matilde da Alemanha", descricao: "Rainha consorte da Alemanha, fundadora de mosteiros.", festa: "14 de março" },
  "03-15": { nome: "São Luísén de Lacken", descricao: "Abade irlandês do século VI, missionário na França.", festa: "15 de março" },
  "03-16": { nome: "Santa Letícia de Roma", descricao: "Virgem e mártir da perseguição de Diocleciano.", festa: "16 de março" },
  "03-17": { nome: "São Patrício", descricao: "Apóstolo da Irlanda, evangelizou os celtas no século V.", festa: "17 de março" },
  "03-18": { nome: "São Cirilo de Jerusalém", descricao: "Doutor da Igreja, autor das famosas catequeses batismais.", festa: "18 de março" },
  "03-19": { nome: "São José, Esposo de Maria", descricao: "Padroeiro da Igreja Universal, modelo de pai e trabalhador.", festa: "19 de março" },
  "03-20": { nome: "São Cutberto de Lindisfarne", descricao: "Bispo missionário na Northúmbria, o 'Apóstolo do Norte'.", festa: "20 de março" },
  "03-21": { nome: "São Benedito de Núrsia", descricao: "Pai do monasticismo ocidental, autor da Regra beneditina.", festa: "21 de março" },
  "03-22": { nome: "São Deogracias de Cartago", descricao: "Bispo que vendeu vasos sagrados para resgatar prisioneiros.", festa: "22 de março" },
  "03-23": { nome: "São Turíbio de Mogrovejo", descricao: "Arcebispo de Lima, evangelizador da América do Sul.", festa: "23 de março" },
  "03-24": { nome: "São Óscar de Hamburgo", descricao: "Arcebispo missionário da Escandinávia, Apóstolo do Norte.", festa: "24 de março" },
  "03-25": { nome: "Anunciação do Senhor", descricao: "O arcanjo Gabriel anuncia a Maria que ela conceberá o Filho de Deus.", festa: "25 de março" },
  "03-26": { nome: "São Bráulio de Saragoça", descricao: "Bispo e doutor espanhol, discípulo de Santo Isidoro.", festa: "26 de março" },
  "03-27": { nome: "São Ruperto de Salzburgo", descricao: "Bispo missionário, evangelizador dos bávaros.", festa: "27 de março" },
  "03-28": { nome: "São Giotto de Moggio", descricao: "Abade beneditino italiano do século XIII.", festa: "28 de março" },
  "03-29": { nome: "São Bertoldo do Monte Carmelo", descricao: "Prior-geral do Monte Carmelo, um dos fundadores da Ordem Carmelita.", festa: "29 de março" },
  "03-30": { nome: "São João Clímaco", descricao: "Monge sinático, autor da 'Escada do Paraíso', guia da vida espiritual.", festa: "30 de março" },
  "03-31": { nome: "São Benjamim", descricao: "Diácono e mártir persa do século V, sofreu pela fé com alegria heroica.", festa: "31 de março" },
  "04-01": { nome: "São Hugo de Grenoble", descricao: "Bispo reformador francês do século XI, acolheu São Bruno.", festa: "1 de abril" },
  "04-02": { nome: "São Francisco de Paula", descricao: "Fundador dos Mínimos, famoso por milagres de cura.", festa: "2 de abril" },
  "04-03": { nome: "São Ricardo de Chichester", descricao: "Bispo inglês do século XIII, defensor da liberdade da Igreja.", festa: "3 de abril" },
  "04-04": { nome: "Santo Isidoro de Sevilha", descricao: "Último dos Padres da Igreja Latina, Doutor da Igreja.", festa: "4 de abril" },
  "04-05": { nome: "São Vicente Ferrer", descricao: "Dominicano, grande pregador itinerante do século XIV.", festa: "5 de abril" },
  "04-06": { nome: "São Celso de Armagh", descricao: "Arcebispo irlandês do século XII, reformador da Igreja na Irlanda.", festa: "6 de abril" },
  "04-07": { nome: "São João Batista de la Salle", descricao: "Fundador dos Irmãos das Escolas Cristãs, patrono dos educadores.", festa: "7 de abril" },
  "04-08": { nome: "São Dionísio de Corinto", descricao: "Bispo do século II, grande correspondente e doutor da Igreja primitiva.", festa: "8 de abril" },
  "04-09": { nome: "Santa Waldetrudis", descricao: "Abadessa e fundadora do mosteiro de Mons, na Bélgica.", festa: "9 de abril" },
  "04-10": { nome: "São Fulberto de Chartres", descricao: "Bispo e teólogo francês, defensor da Imaculada Conceição.", festa: "10 de abril" },
  "04-11": { nome: "São Estanislau de Cracóvia", descricao: "Bispo e mártir polonês do século XI.", festa: "11 de abril" },
  "04-12": { nome: "São Zenão de Verona", descricao: "Bispo africano de Verona, padroeiro da cidade.", festa: "12 de abril" },
  "04-13": { nome: "São Martinho I", descricao: "Papa mártir que resistiu ao imperador por defender a fé ortodoxa.", festa: "13 de abril" },
  "04-14": { nome: "São Liduvino de Schiedam", descricao: "Mística holandesa que suportou décadas de sofrimento físico com alegria.", festa: "14 de abril" },
  "04-15": { nome: "Beato César de Bus", descricao: "Sacerdote francês fundador da Congregação da Doutrina Cristã.", festa: "15 de abril" },
  "04-16": { nome: "Santa Bernadette Soubirous", descricao: "A pequena vidente de Lourdes a quem Nossa Senhora apareceu.", festa: "16 de abril" },
  "04-17": { nome: "São Roberto de Molesme", descricao: "Fundador do mosteiro de Cister, pai do movimento cisterciense.", festa: "17 de abril" },
  "04-18": { nome: "Beata Maria da Encarnação Rosal", descricao: "Fundadora das Bethlemitas, primeira beata centro-americana.", festa: "18 de abril" },
  "04-19": { nome: "São Leão IX", descricao: "Papa reformador do século XI, antecedeu o Grande Cisma.", festa: "19 de abril" },
  "04-20": { nome: "São Marcelino de Embrun", descricao: "Bispo missionário na Gália do século IV.", festa: "20 de abril" },
  "04-21": { nome: "São Anselmo de Cantuária", descricao: "Doutor da Igreja, autor do argumento ontológico para Deus.", festa: "21 de abril" },
  "04-22": { nome: "São Teodoro de Sykeon", descricao: "Bispo e taumaturgo do século VI, famoso por milagres.", festa: "22 de abril" },
  "04-23": { nome: "São Jorge", descricao: "Mártir e soldado, padroeiro da Inglaterra, Portugal e do Brasil.", festa: "23 de abril" },
  "04-24": { nome: "São Fidélis de Sigmaringa", descricao: "Primeiro mártir capuchinho, morto em 1622.", festa: "24 de abril" },
  "04-25": { nome: "São Marcos Evangelista", descricao: "Autor do segundo Evangelho, fundador da Igreja em Alexandria.", festa: "25 de abril" },
  "04-26": { nome: "Nossa Senhora do Bom Conselho", descricao: "Invocamos Maria como guia e conselheira em nossa vida de fé.", festa: "26 de abril" },
  "04-27": { nome: "Santo Estêvão de Perm", descricao: "Bispo missionário russo, criou o alfabeto para evangelizar os Zyrianos.", festa: "27 de abril" },
  "04-28": { nome: "São Luís Maria Grignion de Montfort", descricao: "Apóstolo mariano, autor do 'Tratado da Verdadeira Devoção a Maria'.", festa: "28 de abril" },
  "04-29": { nome: "Santa Catarina de Sena", descricao: "Doutora da Igreja, mística e conselheira de papas.", festa: "29 de abril" },
  "04-30": { nome: "São Pio V", descricao: "Papa dominicano que padronizou a Missa de Trento.", festa: "30 de abril" },
  "05-01": { nome: "São José Trabalhador", descricao: "Memória de São José como modelo de dignidade do trabalho.", festa: "1 de maio" },
  "05-02": { nome: "São Atanásio", descricao: "Doutor da Igreja, 'Atanásio contra o mundo', defensor da divindade de Cristo.", festa: "2 de maio" },
  "05-03": { nome: "Santos Filipe e Tiago Apóstolos", descricao: "Dois dos Doze, celebrados juntos pela tradição latina.", festa: "3 de maio" },
  "05-04": { nome: "São Florian", descricao: "Oficial romano e mártir, padroeiro da Áustria e dos bombeiros.", festa: "4 de maio" },
  "05-05": { nome: "Beato Nunzio Sulprizio", descricao: "Jovem operário napolitano, modelo de santidade no sofrimento.", festa: "5 de maio" },
  "05-06": { nome: "São João de Ávila", descricao: "Doutor da Igreja, 'Apóstolo da Andaluzia', mestre de Santa Teresa.", festa: "6 de maio" },
  "05-07": { nome: "Santa Rosa Venerini", descricao: "Fundadora das Ursulinasdo Sagrado Coração, pioneira do ensino feminino.", festa: "7 de maio" },
  "05-08": { nome: "São Pedro de Tarantasia", descricao: "Arcebispo de Tarantasia e depois papa (Inocêncio V).", festa: "8 de maio" },
  "05-09": { nome: "São Gregório Nazianzeno", descricao: "Doutor da Igreja, 'Teólogo' por excelência na tradição oriental.", festa: "9 de maio" },
  "05-10": { nome: "São João de Ávila (alternativo)", descricao: "Padroeiro do clero secular espanhol, mestre espiritual.", festa: "10 de maio" },
  "05-11": { nome: "Santos Inácio de Laconi", descricao: "Frade capuchinho, humilde questuante famoso por milagres.", festa: "11 de maio" },
  "05-12": { nome: "Santos Nereu e Aquileu", descricao: "Mártires romanos dos primeiros séculos.", festa: "12 de maio" },
  "05-13": { nome: "Nossa Senhora de Fátima", descricao: "Memória das aparições de Maria a três pastorinhos em 1917.", festa: "13 de maio" },
  "05-14": { nome: "São Matias Apóstolo", descricao: "Escolhido para substituir Judas entre os Doze apóstolos.", festa: "14 de maio" },
  "05-15": { nome: "São Isidoro Lavrador", descricao: "Camponês espanhol, padroeiro dos lavradores e da cidade de Madrid.", festa: "15 de maio" },
  "05-16": { nome: "São Simão Stock", descricao: "Prior-geral dos Carmelitas, recebeu o escapulário de Nossa Senhora.", festa: "16 de maio" },
  "05-17": { nome: "São Pascoal Bailão", descricao: "Frade leigo franciscano, padroeiro dos congressos eucarísticos.", festa: "17 de maio" },
  "05-18": { nome: "São João I", descricao: "Papa e mártir do século VI, morreu preso pelo rei ostrogodo Teodorico.", festa: "18 de maio" },
  "05-19": { nome: "São Celestino V", descricao: "Papa que renunciou ao pontificado, fundador dos Celestinos.", festa: "19 de maio" },
  "05-20": { nome: "São Bernardino de Sena", descricao: "Franciscano, grande pregador do Nome de Jesus no século XV.", festa: "20 de maio" },
  "05-21": { nome: "São Cristóvão Magallanes e Companheiros", descricao: "Mártires mexicanos da Cristiada (1926-1928).", festa: "21 de maio" },
  "05-22": { nome: "Santa Rita de Cássia", descricao: "Agostiniana italiana, padroeira das causas impossíveis.", festa: "22 de maio" },
  "05-23": { nome: "São João Batista de Rossi", descricao: "Sacerdote romano do século XVIII, apóstolo dos pobres de Roma.", festa: "23 de maio" },
  "05-24": { nome: "Nossa Senhora Auxiliadora", descricao: "Maria é celebrada como auxiliadora da Igreja e dos fiéis.", festa: "24 de maio" },
  "05-25": { nome: "São Gregório VII", descricao: "Papa reformador do século XI, defensor da liberdade da Igreja.", festa: "25 de maio" },
  "05-26": { nome: "São Filipe Neri", descricao: "Fundador do Oratório, 'apóstolo de Roma', cheio de alegria e humor.", festa: "26 de maio" },
  "05-27": { nome: "São Bede o Venerável", descricao: "Doutor da Igreja, monge e historiador inglês do século VIII.", festa: "27 de maio" },
  "05-28": { nome: "São Bernardo de Menthon", descricao: "Arcediago que fundou os hospícios nos Alpes, padroeiro dos alpinistas.", festa: "28 de maio" },
  "05-29": { nome: "São Paulo VI", descricao: "Papa que conduziu e encerrou o Concílio Vaticano II.", festa: "29 de maio" },
  "05-30": { nome: "São Joana d'Arc", descricao: "Heroína e mártir francesa, padroeira da França.", festa: "30 de maio" },
  "05-31": { nome: "Visitação de Maria a Isabel", descricao: "Maria visita sua prima Isabel, carregando Jesus em seu seio.", festa: "31 de maio" },
  "06-01": { nome: "São Justino Mártir", descricao: "Primeiro filósofo cristão, mártir em Roma no século II.", festa: "1 de junho" },
  "06-02": { nome: "Santos Marcelino e Pedro", descricao: "Sacerdote e exorcista mártires romanos do século III.", festa: "2 de junho" },
  "06-03": { nome: "São Carlos Lwanga e Companheiros", descricao: "Mártires ugandeses do século XIX, jovens que morreram pela fé.", festa: "3 de junho" },
  "06-04": { nome: "Santa Saturnina", descricao: "Virgem e mártir da África, torturada pela fé em Cristo.", festa: "4 de junho" },
  "06-05": { nome: "São Bonifácio", descricao: "Apóstolo da Germânia, arcebispo mártir do século VIII.", festa: "5 de junho" },
  "06-06": { nome: "São Norberto", descricao: "Fundador dos Premonstratenses (Norbertinos), arcebispo de Magdeburgo.", festa: "6 de junho" },
  "06-07": { nome: "São Colmcille de Iona", descricao: "Monge missionário irlandês, evangelizador da Escócia.", festa: "7 de junho" },
  "06-08": { nome: "São Medardo de Noyon", descricao: "Bispo francês do século VI, padroeiro do tempo.", festa: "8 de junho" },
  "06-09": { nome: "São Efrém da Síria", descricao: "Doutor da Igreja, poeta e hino grafo sírio do século IV.", festa: "9 de junho" },
  "06-10": { nome: "Beata Margarida Ebner", descricao: "Dominicana alemã do século XIV, mística com estigmas espirituais.", festa: "10 de junho" },
  "06-11": { nome: "São Barnabé Apóstolo", descricao: "Companheiro de Paulo, pregou o Evangelho pelo Mediterrâneo.", festa: "11 de junho" },
  "06-12": { nome: "São João de Sahagún", descricao: "Agostiniano espanhol, pregador reformador do século XV.", festa: "12 de junho" },
  "06-13": { nome: "Santo Antônio de Pádua", descricao: "Doutor da Igreja, 'martelo dos hereges', padroeiro dos pobres.", festa: "13 de junho" },
  "06-14": { nome: "São Basílio Magno", descricao: "Doutor da Igreja, organizador do monasticismo oriental.", festa: "14 de junho" },
  "06-15": { nome: "São Vito", descricao: "Mártir jovem romano, padroeiro dos epilépticos e da dança.", festa: "15 de junho" },
  "06-16": { nome: "São João Francisco Régis", descricao: "Jesuíta francês, missionário nas montanhas da Ardèche.", festa: "16 de junho" },
  "06-17": { nome: "São Gregório Barbarigo", descricao: "Cardeal veneziano, defensor dos direitos dos pobres.", festa: "17 de junho" },
  "06-18": { nome: "São Gregório de Nazianzo", descricao: "Patriarca de Constantinopla, Doutor da Igreja.", festa: "18 de junho" },
  "06-19": { nome: "São Romualdo", descricao: "Fundador da Ordem Camaldulense, reformador do monasticismo.", festa: "19 de junho" },
  "06-20": { nome: "São Silverio", descricao: "Papa e mártir do século VI, exilado pela imperatriz Teodora.", festa: "20 de junho" },
  "06-21": { nome: "São Luís Gonzaga", descricao: "Jovem jesuíta, padroeiro da juventude cristã.", festa: "21 de junho" },
  "06-22": { nome: "Santos João Fisher e Tomás More", descricao: "Mártires ingleses que recusaram negar a autoridade do Papa.", festa: "22 de junho" },
  "06-23": { nome: "Santa Eteldredis", descricao: "Rainha e abadessa inglesa, fundadora da abadia de Ely.", festa: "23 de junho" },
  "06-24": { nome: "Natividade de São João Batista", descricao: "O Precursor de Jesus, 'voz que clama no deserto'.", festa: "24 de junho" },
  "06-25": { nome: "São Guilherme de Verceli", descricao: "Fundador da Congregação de Monte Vergine, ermitão italiano.", festa: "25 de junho" },
  "06-26": { nome: "São Josemaria Escrivá", descricao: "Fundador do Opus Dei, canonizado em 2002.", festa: "26 de junho" },
  "06-27": { nome: "São Cirilo de Alexandria", descricao: "Doutor da Igreja, defensor do título 'Mãe de Deus' para Maria.", festa: "27 de junho" },
  "06-28": { nome: "São Ireneu de Lião", descricao: "Bispo e mártir do século II, grande defensor da fé contra a gnose.", festa: "28 de junho" },
  "06-29": { nome: "Santos Pedro e Paulo", descricao: "Os dois grandes apóstolos: a rocha e a espada da Igreja.", festa: "29 de junho" },
  "06-30": { nome: "Santos Primeiros Mártires da Igreja de Roma", descricao: "Os cristãos martirizados por Nero após o incêndio de Roma.", festa: "30 de junho" },
  "07-01": { nome: "Beato Junípero Serra", descricao: "Missionário franciscano, evangelizador da Califórnia.", festa: "1 de julho" },
  "07-02": { nome: "São Oto de Bamberg", descricao: "Bispo alemão, 'Apóstolo dos Pomerânios' do século XII.", festa: "2 de julho" },
  "07-03": { nome: "São Tomé Apóstolo", descricao: "O apóstolo da dúvida que depois proclamou 'Meu Senhor e meu Deus!'", festa: "3 de julho" },
  "07-04": { nome: "Santa Isabel de Portugal", descricao: "Rainha de Portugal, conhecida pela sua caridade e amor à paz.", festa: "4 de julho" },
  "07-05": { nome: "São Antônio Maria Zaccaria", descricao: "Fundador dos Barnabitas, médico e padre do século XVI.", festa: "5 de julho" },
  "07-06": { nome: "Santa Maria Goretti", descricao: "Jovem mártir italiana que morreu defendendo sua pureza.", festa: "6 de julho" },
  "07-07": { nome: "Beatos Mártires de Tlaxcala", descricao: "Três jovens astecas convertidos e martirizados no México colonial.", festa: "7 de julho" },
  "07-08": { nome: "São Adriano III", descricao: "Papa do século IX, beatificado por Clemente X.", festa: "8 de julho" },
  "07-09": { nome: "São Augusto Czartoryski", descricao: "Príncipe polonês salesiano, morreu jovem com fama de santidade.", festa: "9 de julho" },
  "07-10": { nome: "Sete Irmãos Mártires", descricao: "Filhos de Santa Felicidade, martirizados em Roma no século II.", festa: "10 de julho" },
  "07-11": { nome: "São Bento de Núrsia", descricao: "Pai do monasticismo ocidental, padroeiro da Europa.", festa: "11 de julho" },
  "07-12": { nome: "São João Gualberto", descricao: "Fundador dos Vallumbrosianos, perdonou o assassino de seu irmão.", festa: "12 de julho" },
  "07-13": { nome: "São Henrique II", descricao: "Imperador do Sacro Império Romano, modelo de governante cristão.", festa: "13 de julho" },
  "07-14": { nome: "São Camilo de Lellis", descricao: "Fundador dos Ministros dos Enfermos, padroeiro dos hospitais.", festa: "14 de julho" },
  "07-15": { nome: "São Boaventura", descricao: "Doutor Seráfico, Ministro-Geral dos Franciscanos.", festa: "15 de julho" },
  "07-16": { nome: "Nossa Senhora do Carmo", descricao: "Memória da devoção carmelita a Maria como Estrela do Mar.", festa: "16 de julho" },
  "07-17": { nome: "Beata Carmela Bhatti", descricao: "Fundadora das Irmãzinhas do Sagrado Coração, paquistanesa.", festa: "17 de julho" },
  "07-18": { nome: "Santa Sinclética de Alexandria", descricao: "Mãe do deserto, uma das primeiras mulheres anacoretas.", festa: "18 de julho" },
  "07-19": { nome: "São Simeão Salos", descricao: "Monge sírio 'louco por Cristo', exemplo de humildade radical.", festa: "19 de julho" },
  "07-20": { nome: "Santa Margarida de Antioquia", descricao: "Mártir síria do século III, padroeira das parturientes.", festa: "20 de julho" },
  "07-21": { nome: "São Lourenço de Brindisi", descricao: "Doutor da Igreja, capuchinho italiano, grande missionário.", festa: "21 de julho" },
  "07-22": { nome: "Santa Maria Madalena", descricao: "A primeira testemunha da Ressurreição, 'apóstola dos apóstolos'.", festa: "22 de julho" },
  "07-23": { nome: "Santa Brígida da Suécia", descricao: "Mística medieval, padroeira da Europa.", festa: "23 de julho" },
  "07-24": { nome: "São Xisto II e Companheiros", descricao: "Papa e mártires romanos do século III.", festa: "24 de julho" },
  "07-25": { nome: "São Tiago Apóstolo", descricao: "Primeiro apóstolo mártir, padroeiro da Espanha.", festa: "25 de julho" },
  "07-26": { nome: "Santa Ana e São Joaquim", descricao: "Avós maternos de Jesus, pais da Virgem Maria.", festa: "26 de julho" },
  "07-27": { nome: "São Pantalião", descricao: "Médico e mártir da perseguição de Diocleciano.", festa: "27 de julho" },
  "07-28": { nome: "Santos Nazário e Celso", descricao: "Mártires milaneses, cujos corpos foram encontrados por São Ambrósio.", festa: "28 de julho" },
  "07-29": { nome: "Santa Marta", descricao: "Irmã de Maria e Lázaro, hospedeira de Jesus em Betânia.", festa: "29 de julho" },
  "07-30": { nome: "São Pedro Crisólogo", descricao: "Doutor da Igreja, arcebispo de Ravena, 'Doutor da Palavra'.", festa: "30 de julho" },
  "07-31": { nome: "Santo Inácio de Loyola", descricao: "Fundador da Companhia de Jesus, autor dos Exercícios Espirituais.", festa: "31 de julho" },
  "08-01": { nome: "São Afonso de Ligório", descricao: "Doutor da Igreja, fundador dos Redentoristas, bispo e teólogo moral.", festa: "1 de agosto" },
  "08-02": { nome: "São Eusébio de Verceli", descricao: "Bispo e confessor do século IV, defensor da fé nicena.", festa: "2 de agosto" },
  "08-03": { nome: "São Líder de Utrecht", descricao: "Bispo missionário na Holanda do século VIII.", festa: "3 de agosto" },
  "08-04": { nome: "São João Maria Vianney", descricao: "O Cura d'Ars, padroeiro dos párocos, grande confessor.", festa: "4 de agosto" },
  "08-05": { nome: "Dedicação da Basílica de Santa Maria Maior", descricao: "A maior basílica mariana do mundo, em Roma.", festa: "5 de agosto" },
  "08-06": { nome: "Transfiguração do Senhor", descricao: "Jesus revela sua glória divina a Pedro, Tiago e João no Tabor.", festa: "6 de agosto" },
  "08-07": { nome: "São Sisto II e Companheiros", descricao: "Papa e mártires do século III.", festa: "7 de agosto" },
  "08-08": { nome: "São Domingos de Gusmão", descricao: "Fundador da Ordem dos Pregadores (Dominicanos).", festa: "8 de agosto" },
  "08-09": { nome: "Santa Teresa Benedita da Cruz (Edith Stein)", descricao: "Filósofa e mártir carmelita, morta em Auschwitz.", festa: "9 de agosto" },
  "08-10": { nome: "São Lourenço", descricao: "Diácono e mártir romano, grelhou com alegria pela fé.", festa: "10 de agosto" },
  "08-11": { nome: "Santa Clara de Assis", descricao: "Fundadora das Clarissas, grande mística franciscana.", festa: "11 de agosto" },
  "08-12": { nome: "Santa Joana Francisca de Chantal", descricao: "Co-fundadora das Visitandinas com São Francisco de Sales.", festa: "12 de agosto" },
  "08-13": { nome: "Santos Ponciano e Hipólito", descricao: "Mártires romanos do século III.", festa: "13 de agosto" },
  "08-14": { nome: "São Maximiliano Kolbe", descricao: "Franciscano mártir em Auschwitz que se ofereceu no lugar de um pai de família.", festa: "14 de agosto" },
  "08-15": { nome: "Assunção de Nossa Senhora", descricao: "Maria é levada em corpo e alma para a glória do céu.", festa: "15 de agosto" },
  "08-16": { nome: "São Estêvão da Hungria", descricao: "Primeiro rei cristão da Hungria, evangelizador do seu povo.", festa: "16 de agosto" },
  "08-17": { nome: "São Jacinto", descricao: "Dominicano polonês, 'Apóstolo do Norte', evangelizador da Europa Central.", festa: "17 de agosto" },
  "08-18": { nome: "Santa Helena", descricao: "Mãe do imperador Constantino, encontrou a verdadeira Cruz de Cristo.", festa: "18 de agosto" },
  "08-19": { nome: "São João Eudes", descricao: "Fundador dos Eudistas, apóstolo dos Sagrados Corações.", festa: "19 de agosto" },
  "08-20": { nome: "São Bernardo de Claraval", descricao: "Doutor Melífluo, reformador cistercense do século XII.", festa: "20 de agosto" },
  "08-21": { nome: "São Pio X", descricao: "Papa que promoveu a comunhão frequente e a catequese.", festa: "21 de agosto" },
  "08-22": { nome: "Nossa Senhora do Imaculado Coração", descricao: "Memória do amor materno e puro de Maria pela humanidade.", festa: "22 de agosto" },
  "08-23": { nome: "Santa Rosa de Lima", descricao: "Primeira santa das Américas, terciária dominicana do Peru.", festa: "23 de agosto" },
  "08-24": { nome: "São Bartolomeu Apóstolo", descricao: "Um dos Doze, pregou o Evangelho na Índia e na Armênia.", festa: "24 de agosto" },
  "08-25": { nome: "São Luís IX", descricao: "Rei da França, modelo de governante cristão do século XIII.", festa: "25 de agosto" },
  "08-26": { nome: "Nossa Senhora do Perpétuo Socorro", descricao: "Veneramos o famoso ícone de Maria que socorre em todas as necessidades.", festa: "26 de agosto" },
  "08-27": { nome: "Santa Mônica", descricao: "Mãe de Santo Agostinho, modelo de perseverança na oração pelos filhos.", festa: "27 de agosto" },
  "08-28": { nome: "Santo Agostinho de Hipona", descricao: "Doutor da Graça, autor das Confissões: 'Fizeste-nos para Ti'.", festa: "28 de agosto" },
  "08-29": { nome: "Martírio de São João Batista", descricao: "João paga com a vida sua coragem de anunciar a verdade.", festa: "29 de agosto" },
  "08-30": { nome: "São Félix e Adauto", descricao: "Mártires romanos do século III, padroeiros da alegria cristã.", festa: "30 de agosto" },
  "08-31": { nome: "São Raimundo Nona", descricao: "Mercedário catalão, fundador de hospitais para os cativos.", festa: "31 de agosto" },
  "09-01": { nome: "São Egídio Ermitão", descricao: "Eremita provençal do século VII, padroeiro dos mendigos.", festa: "1 de setembro" },
  "09-02": { nome: "São Elpídio de Aton", descricao: "Abade da Capadócia, fundador de mosteiro na Itália.", festa: "2 de setembro" },
  "09-03": { nome: "São Gregório Magno", descricao: "Doutor da Igreja, Papa que reformou a liturgia e o canto gregoriano.", festa: "3 de setembro" },
  "09-04": { nome: "Santa Rosália de Palermo", descricao: "Eremita siciliana, padroeira de Palermo, invocada contra a peste.", festa: "4 de setembro" },
  "09-05": { nome: "São Lourenço Giustiniani", descricao: "Primeiro Patriarca de Veneza, fundador dos Cânegos Seculares de São Jorge.", festa: "5 de setembro" },
  "09-06": { nome: "São Magnus da Frísia", descricao: "Bispo missionário, evangelizador dos Frisões.", festa: "6 de setembro" },
  "09-07": { nome: "São Clodoaldo (Cloude)", descricao: "Neto do rei Franco Clodoveu, renunciou ao trono para ser monge.", festa: "7 de setembro" },
  "09-08": { nome: "Natividade de Nossa Senhora", descricao: "Celebramos o nascimento da Virgem Maria, aurora da nossa salvação.", festa: "8 de setembro" },
  "09-09": { nome: "São Pedro Claver", descricao: "Jesuíta espanhol, 'escravo dos escravos', missionário entre os africanos na Colômbia.", festa: "9 de setembro" },
  "09-10": { nome: "São Nicolau de Tolentino", descricao: "Agostiniano italiano, famoso por seu jejum e oração.", festa: "10 de setembro" },
  "09-11": { nome: "São Proto e Jacinto", descricao: "Mártires romanos do século III, irmãos de criação.", festa: "11 de setembro" },
  "09-12": { nome: "Santíssimo Nome de Maria", descricao: "Celebramos o Nome de Maria, invocado em todas as necessidades.", festa: "12 de setembro" },
  "09-13": { nome: "São João Crisóstomo", descricao: "Doutor da Igreja, 'boca de ouro', grande pregador de Constantinopla.", festa: "13 de setembro" },
  "09-14": { nome: "Exaltação da Santa Cruz", descricao: "Celebramos a Cruz de Cristo como instrumento de salvação e vitória.", festa: "14 de setembro" },
  "09-15": { nome: "Nossa Senhora das Dores", descricao: "Meditamos os sofrimentos de Maria junto à Cruz de seu Filho.", festa: "15 de setembro" },
  "09-16": { nome: "São Cornélio e São Cipriano", descricao: "Mártires do século III, padroeiros da unidade da Igreja.", festa: "16 de setembro" },
  "09-17": { nome: "São Roberto Bellarmino", descricao: "Doutor da Igreja, cardeal jesuíta e grande apologista do século XVI.", festa: "17 de setembro" },
  "09-18": { nome: "São Tomás de Vilanova", descricao: "Arcebispo de Valência, chamado 'Pai dos Pobres' por sua caridade.", festa: "18 de setembro" },
  "09-19": { nome: "São Januário", descricao: "Bispo e mártir de Nápoles, padroeiro da cidade.", festa: "19 de setembro" },
  "09-20": { nome: "Santos André Kim Taegon e Paulo Chong Hasang", descricao: "Mártires coreanos do século XIX.", festa: "20 de setembro" },
  "09-21": { nome: "São Mateus Apóstolo e Evangelista", descricao: "Cobrador de impostos chamado por Jesus, autor do primeiro Evangelho.", festa: "21 de setembro" },
  "09-22": { nome: "São Maurício e Companheiros", descricao: "Oficiais romanos mártires da Legião Tebana do século III.", festa: "22 de setembro" },
  "09-23": { nome: "São Pio de Pietrelcina (Padre Pio)", descricao: "Franciscano capuchinho com estigmas, grande confessor.", festa: "23 de setembro" },
  "09-24": { nome: "Nossa Senhora das Mercês", descricao: "Festa da Ordem da Mercê, fundada para resgatar cativos.", festa: "24 de setembro" },
  "09-25": { nome: "São Finbar de Cork", descricao: "Bispo irlandês, fundador do mosteiro e cidade de Cork.", festa: "25 de setembro" },
  "09-26": { nome: "Santos Cosme e Damião", descricao: "Médicos gêmeos mártires, padroeiros dos médicos.", festa: "26 de setembro" },
  "09-27": { nome: "São Vicente de Paulo", descricao: "Fundador da Congregação da Missão e das Filhas da Caridade.", festa: "27 de setembro" },
  "09-28": { nome: "São Venceslau de Boêmia", descricao: "Duque mártir da Boêmia, padroeiro da República Tcheca.", festa: "28 de setembro" },
  "09-29": { nome: "Santos Arcanjos Miguel, Gabriel e Rafael", descricao: "Os três arcanjos mensageiros e protetores do povo de Deus.", festa: "29 de setembro" },
  "09-30": { nome: "São Jerônimo", descricao: "Doutor da Igreja, tradutor da Bíblia para o latim (Vulgata).", festa: "30 de setembro" },
  "10-01": { nome: "Santa Teresinha do Menino Jesus", descricao: "Doutora da Igreja, patrona das missões, mestre do 'pequeno caminho'.", festa: "1 de outubro" },
  "10-02": { nome: "Santos Anjos da Guarda", descricao: "Celebramos os anjos que Deus destina a cada pessoa para sua proteção.", festa: "2 de outubro" },
  "10-03": { nome: "São Geraldo de Braga", descricao: "Arcebispo de Braga, organizador da Igreja em Portugal.", festa: "3 de outubro" },
  "10-04": { nome: "São Francisco de Assis", descricao: "Fundador dos Franciscanos, o 'Poverello' que amava a Criação.", festa: "4 de outubro" },
  "10-05": { nome: "São Flávio Domiciliano", descricao: "Neto de Vespasiano, cônsul romano convertido e mártir.", festa: "5 de outubro" },
  "10-06": { nome: "São Bruno Cartusiano", descricao: "Fundador dos Cartusos, o mais austero dos Ordens monásticas.", festa: "6 de outubro" },
  "10-07": { nome: "Nossa Senhora do Rosário", descricao: "Festa da devoção que Maria revelou a São Domingos para a salvação das almas.", festa: "7 de outubro" },
  "10-08": { nome: "Santa Pelágia de Antioquia", descricao: "Atriz pecadora convertida, que passou o resto da vida em penitência.", festa: "8 de outubro" },
  "10-09": { nome: "São Dionísio e Companheiros", descricao: "Mártires de Paris do século III, padroeiros da França.", festa: "9 de outubro" },
  "10-10": { nome: "São Francisco Borgia", descricao: "Terceiro Prepositor Geral dos Jesuítas, convertido após viuvez.", festa: "10 de outubro" },
  "10-11": { nome: "São João XXIII", descricao: "Papa que convocou o Concílio Vaticano II, canonizado em 2014.", festa: "11 de outubro" },
  "10-12": { nome: "Nossa Senhora Aparecida", descricao: "Padroeira do Brasil, encontrada por pescadores em 1717.", festa: "12 de outubro" },
  "10-13": { nome: "São Eduardo o Confessor", descricao: "Rei inglês do século XI, modelo de justiça e piedade.", festa: "13 de outubro" },
  "10-14": { nome: "São Calisto I", descricao: "Papa e mártir do século III, antes escravo, defensor dos pecadores.", festa: "14 de outubro" },
  "10-15": { nome: "Santa Teresa de Ávila", descricao: "Doutora da Igreja, reformadora do Carmelo, mística espanhola.", festa: "15 de outubro" },
  "10-16": { nome: "Santa Margarida Maria Alacoque", descricao: "Visitandina francesa a quem Jesus revelou seu Sagrado Coração.", festa: "16 de outubro" },
  "10-17": { nome: "Santo Inácio de Antioquia", descricao: "Bispo e mártir, discípulo do apóstolo João, chamou-se 'portador de Deus'.", festa: "17 de outubro" },
  "10-18": { nome: "São Lucas Evangelista", descricao: "Médico e evangelista, autor do terceiro Evangelho e dos Atos.", festa: "18 de outubro" },
  "10-19": { nome: "São Paulo da Cruz", descricao: "Fundador dos Passionistas, místico italiano do século XVIII.", festa: "19 de outubro" },
  "10-20": { nome: "São João de Capistrano", descricao: "Franciscano italiano, 'Apóstolo da Europa', pregou a cruzada.", festa: "20 de outubro" },
  "10-21": { nome: "Santa Úrsula e Companheiras", descricao: "Mártires de Colônia, princesa bretã e suas companheiras.", festa: "21 de outubro" },
  "10-22": { nome: "São João Paulo II", descricao: "O grande papa peregrino, proclamado Santo em 2014.", festa: "22 de outubro" },
  "10-23": { nome: "São João de Capistrano", descricao: "Franciscano e pregador cruzado, mártir do século XV.", festa: "23 de outubro" },
  "10-24": { nome: "São Antônio Maria Claret", descricao: "Fundador dos Claretianos, arcebispo de Cuba.", festa: "24 de outubro" },
  "10-25": { nome: "São Crispim e Crispiniano", descricao: "Mártires sapateiros, padroeiros dos artesãos do couro.", festa: "25 de outubro" },
  "10-26": { nome: "São Evaristo", descricao: "Papa do século II, quinto sucessor de São Pedro.", festa: "26 de outubro" },
  "10-27": { nome: "Beato Bartolomeu Gutiérrez", descricao: "Agostiniano espanhol, mártir no Japão em 1632.", festa: "27 de outubro" },
  "10-28": { nome: "Santos Simão e Judas Apóstolos", descricao: "Dois dos Doze, pregadores do Evangelho no Oriente.", festa: "28 de outubro" },
  "10-29": { nome: "São Narciso de Jerusalém", descricao: "Bispo de Jerusalém no século III, famoso por milagres.", festa: "29 de outubro" },
  "10-30": { nome: "São Marcelino", descricao: "Mártir romano do século IV, companheiro de São Pedro.", festa: "30 de outubro" },
  "10-31": { nome: "Vigília de Todos os Santos", descricao: "A véspera da solenidade de Todos os Santos, tempo de oração pelos fiéis.", festa: "31 de outubro" },
  "11-01": { nome: "Todos os Santos", descricao: "Celebramos todos os santos do Céu, conhecidos e desconhecidos.", festa: "1 de novembro" },
  "11-02": { nome: "Todos os Fiéis Defuntos", descricao: "Commemoração de todos os que partiram, na esperança da ressurreição.", festa: "2 de novembro" },
  "11-03": { nome: "São Martinho de Porres", descricao: "Dominicano peruano mestiço, padroeiro dos barbeiros e dos pobres.", festa: "3 de novembro" },
  "11-04": { nome: "São Carlos Borromeu", descricao: "Cardeal reformador, figura central do Concílio de Trento.", festa: "4 de novembro" },
  "11-05": { nome: "São Zacarias e Santa Isabel", descricao: "Pais de São João Batista, ancestrais de Jesus pela linha materna.", festa: "5 de novembro" },
  "11-06": { nome: "São Leonardo de Noblac", descricao: "Eremita francês do século VI, padroeiro dos presos.", festa: "6 de novembro" },
  "11-07": { nome: "São Ernesto de Zwiefalten", descricao: "Abade beneditino do século XII, missionário na Terra Santa.", festa: "7 de novembro" },
  "11-08": { nome: "Quatro Santos Coroados", descricao: "Mártires romanos, escultores que se recusaram a esculpir ídolos.", festa: "8 de novembro" },
  "11-09": { nome: "Dedicação da Basílica de Latrão", descricao: "A catedral do Papa, 'mãe e cabeça de todas as igrejas'.", festa: "9 de novembro" },
  "11-10": { nome: "São Leão Magno", descricao: "Doutor da Igreja, Papa que convenceu Átila a poupar Roma.", festa: "10 de novembro" },
  "11-11": { nome: "São Martinho de Tours", descricao: "Bispo e monge, modelo de caridade: dividiu seu manto com um pobre.", festa: "11 de novembro" },
  "11-12": { nome: "São Josafá Kuncevyc", descricao: "Bispo e mártir ucraniano, trabalhador pela união das Igrejas.", festa: "12 de novembro" },
  "11-13": { nome: "São Estanislau Kostka", descricao: "Jovem jesuíta polonês, morto aos 18 anos com fama de santidade.", festa: "13 de novembro" },
  "11-14": { nome: "São Serapião de Argel", descricao: "Mercedário inglês, mártir no norte da África no século XIII.", festa: "14 de novembro" },
  "11-15": { nome: "São Alberto Magno", descricao: "Doutor Universal, mestre de Tomás de Aquino.", festa: "15 de novembro" },
  "11-16": { nome: "Santa Gertrudes a Grande", descricao: "Mística beneditina alemã, doutora não oficial da Igreja.", festa: "16 de novembro" },
  "11-17": { nome: "Santa Isabel da Hungria", descricao: "Rainha que renunciou ao trono para servir os pobres.", festa: "17 de novembro" },
  "11-18": { nome: "Dedicação das Basílicas de Pedro e Paulo", descricao: "Memória da consagração das grandes basílicas romanas.", festa: "18 de novembro" },
  "11-19": { nome: "Santa Matilde da Hackeborn", descricao: "Mística beneditina, autora do 'Livro da Graça Especial'.", festa: "19 de novembro" },
  "11-20": { nome: "São Edmundo Rei", descricao: "Rei mártir da Anglia Oriental, morto pelos Vikings em 869.", festa: "20 de novembro" },
  "11-21": { nome: "Apresentação de Maria no Templo", descricao: "Meditamos a consagração de Maria a Deus desde sua infância.", festa: "21 de novembro" },
  "11-22": { nome: "Santa Cecília", descricao: "Mártir romana, padroeira da música sacra.", festa: "22 de novembro" },
  "11-23": { nome: "São Clemente I", descricao: "Terceiro sucessor de São Pedro, autor da famosa Carta aos Coríntios.", festa: "23 de novembro" },
  "11-24": { nome: "São André Dung-Lac e Companheiros", descricao: "Mártires vietnamitas dos séculos XVII-XIX.", festa: "24 de novembro" },
  "11-25": { nome: "Santa Catarina de Alexandria", descricao: "Mártir egípcia, padroeira dos filósofos e estudantes.", festa: "25 de novembro" },
  "11-26": { nome: "São Leonardo de Porto Maurício", descricao: "Franciscano italiano, pregador das Estações da Cruz.", festa: "26 de novembro" },
  "11-27": { nome: "São Francisco António Fasani", descricao: "Franciscano italiano, Provincial e guardião dos pobres.", festa: "27 de novembro" },
  "11-28": { nome: "Santo Estêvão o Jovem", descricao: "Monge mártir de Constantinopla, morto por defender os ícones.", festa: "28 de novembro" },
  "11-29": { nome: "São Saturnino de Toulouse", descricao: "Primeiro bispo de Toulouse, mártir arrastado por um touro.", festa: "29 de novembro" },
  "11-30": { nome: "São André Apóstolo", descricao: "Irmão de Pedro, primeiro chamado por Jesus, padroeiro da Escócia e Rússia.", festa: "30 de novembro" },
  "12-01": { nome: "São Elói de Noyon", descricao: "Ourives e bispo francês, padroeiro dos ourives e trabalhadores do metal.", festa: "1 de dezembro" },
  "12-02": { nome: "Beata Rafaela Maria do Sagrado Coração", descricao: "Fundadora das Escravas do Sagrado Coração de Jesus.", festa: "2 de dezembro" },
  "12-03": { nome: "São Francisco Xavier", descricao: "Jesuíta missionário na Ásia, batizou mais de 30 mil pessoas.", festa: "3 de dezembro" },
  "12-04": { nome: "Santa Bárbara", descricao: "Virgem e mártir, padroeira dos artilheiros e moribundos.", festa: "4 de dezembro" },
  "12-05": { nome: "São Sabas", descricao: "Abade palestino do século V, fundador da grande laura de Mar Saba.", festa: "5 de dezembro" },
  "12-06": { nome: "São Nicolau de Mira", descricao: "Bispo do século IV, modelo de generosidade, origem do Papai Noel.", festa: "6 de dezembro" },
  "12-07": { nome: "São Ambrósio de Milão", descricao: "Doutor da Igreja, batizou Santo Agostinho, compositor de hinos.", festa: "7 de dezembro" },
  "12-08": { nome: "Imaculada Conceição de Maria", descricao: "Maria foi concebida sem a mancha do pecado original.", festa: "8 de dezembro" },
  "12-09": { nome: "São Pedro Fourier", descricao: "Sacerdote francês, fundador das Canonisas de Nossa Senhora.", festa: "9 de dezembro" },
  "12-10": { nome: "Nossa Senhora de Loreto", descricao: "Veneramos a Santa Casa de Nazaré, transportada milagrosamente.", festa: "10 de dezembro" },
  "12-11": { nome: "São Dâmaso I", descricao: "Papa do século IV, mandou São Jerônimo traduzir a Bíblia.", festa: "11 de dezembro" },
  "12-12": { nome: "Nossa Senhora de Guadalupe", descricao: "Aparição de Maria a Juan Diego no México, padroeira das Américas.", festa: "12 de dezembro" },
  "12-13": { nome: "Santa Lúcia", descricao: "Mártir siciliana, padroeira dos cegos e da visão.", festa: "13 de dezembro" },
  "12-14": { nome: "São João da Cruz", descricao: "Doutor Místico, co-reformador do Carmelo com Santa Teresa.", festa: "14 de dezembro" },
  "12-15": { nome: "São Valeriano de Abenza", descricao: "Bispo mártir da África do Norte.", festa: "15 de dezembro" },
  "12-16": { nome: "Beata Virgem Maria (Advento)", descricao: "Em pleno Advento, honramos Maria que carrega Jesus ao mundo.", festa: "16 de dezembro" },
  "12-17": { nome: "São Lázaro de Betânia", descricao: "Amigo e ressuscitado por Jesus, depois bispo de Chipre.", festa: "17 de dezembro" },
  "12-18": { nome: "São Graciano de Tours", descricao: "Primeiro bispo de Tours, evangelizador da Gália.", festa: "18 de dezembro" },
  "12-19": { nome: "São Anastásio I", descricao: "Papa do século IV/V, defensor da ortodoxia contra o origenismo.", festa: "19 de dezembro" },
  "12-20": { nome: "São Domingos de Silos", descricao: "Abade beneditino espanhol do século XI, famoso por milagres.", festa: "20 de dezembro" },
  "12-21": { nome: "São Pedro Canísio", descricao: "Doutor da Igreja, jesuíta alemão, o grande apóstolo da Contra-Reforma.", festa: "21 de dezembro" },
  "12-22": { nome: "São Flávia Domitila", descricao: "Neta do imperador Vespasiano, mártir por sua fé.", festa: "22 de dezembro" },
  "12-23": { nome: "São João de Kanti", descricao: "Teólogo polonês do século XV, professor universitário e servo dos pobres.", festa: "23 de dezembro" },
  "12-24": { nome: "Vigília de Natal", descricao: "Preparamos nossos corações para acolher o Filho de Deus que nasce.", festa: "24 de dezembro" },
  "12-25": { nome: "Natividade do Senhor (Natal)", descricao: "Celebramos o nascimento de Jesus Cristo, o Filho de Deus feito homem.", festa: "25 de dezembro" },
  "12-26": { nome: "São Estêvão Proto-mártir", descricao: "O primeiro mártir da Igreja, apedrejado por sua fé em Cristo.", festa: "26 de dezembro" },
  "12-27": { nome: "São João Apóstolo e Evangelista", descricao: "O discípulo amado, único apóstolo não mártir, autor do 4° Evangelho.", festa: "27 de dezembro" },
  "12-28": { nome: "Santos Inocentes Mártires", descricao: "As crianças mortas por Herodes à procura do Menino Jesus.", festa: "28 de dezembro" },
  "12-29": { nome: "São Tomás Becket", descricao: "Arcebispo de Cantuária mártir, morto na própria catedral em 1170.", festa: "29 de dezembro" },
  "12-30": { nome: "São Sabino de Assis", descricao: "Bispo mártir, padroeiro de Assis.", festa: "30 de dezembro" },
  "12-31": { nome: "São Silvestre I", descricao: "Papa durante o reinado de Constantino, presidiu o Concílio de Niceia.", festa: "31 de dezembro" },
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
