import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  Image,
  ImageSourcePropType,
  Share,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useSettings } from "@/context/SettingsContext";

const MARY_ICON: ImageSourcePropType = require("@/assets/icons/mary.png");
const DOVE_ICON: ImageSourcePropType = require("@/assets/icons/dove.png");

interface Prayer {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  iconName: string;
  iconSet: "ionicons" | "material" | "image";
  imageSource?: ImageSourcePropType;
  accentColor: string;
}

function PrayerIcon({ prayer, size, color }: { prayer: Prayer; size: number; color: string }) {
  // ✅ Estado de erro para fallback visual quando imagem não carrega no iOS
  const [imgError, setImgError] = useState(false);

  if (prayer.iconSet === "image" && prayer.imageSource) {
    const imgSize = Math.round(size * 1.5);

    // ✅ Fallback: se a imagem falhar, exibe ícone Ionicons no lugar
    if (imgError) {
      return <Ionicons name="flower-outline" size={size} color={color} />;
    }

    return (
      <Image
        source={prayer.imageSource}
        style={{ width: imgSize, height: imgSize }}
        resizeMode="contain"
        onError={() => setImgError(true)}
      />
    );
  }
  if (prayer.iconSet === "material") {
    return <MaterialCommunityIcons name={prayer.iconName as any} size={size} color={color} />;
  }
  return <Ionicons name={prayer.iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
}

// ── Texto atualizado da Salve Rainha ─────────────────────────────
const SALVE_RAINHA_TEXT =
  "Salve Rainha, Mãe de misericórdia,\nvida, doçura e esperança nossa, salve!\n\n" +
  "A vós bradamos, os degredados filhos de Eva,\na vós suspiramos, gemendo e chorando\nneste vale de lágrimas.\n\n" +
  "Eia, pois, advogada nossa,\nesses vossos olhos misericordiosos a nós volvei.\n\n" +
  "E depois deste desterro nos mostrai Jesus,\nbendito fruto do vosso ventre.\n\n" +
  "Ó clemente, ó piedosa,\nó doce sempre Virgem Maria.\n\n" +
  "Rogai por nós, santa Mãe de Deus.\nPara que sejamos dignos das promessas de Cristo.\n\nAmém!";

const PRAYERS: Prayer[] = [
  {
    id: "pai-nosso",
    title: "Pai Nosso",
    subtitle: "Oração do Senhor",
    iconName: "cross",
    iconSet: "material",
    accentColor: Colors.light.deepBlue,
    text: `Pai nosso que estais no céu,\nsantificado seja o vosso nome,\nvenha a nós o vosso reino,\nseja feita a vossa vontade,\nassim na terra como no céu.\n\nO pão nosso de cada dia nos dai hoje,\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos\na quem nos tem ofendido.\n\nE não nos deixeis cair em tentação,\nmas livrai-nos do mal.\n\nAmém.`,
  },
  {
    id: "ave-maria",
    title: "Ave Maria",
    subtitle: "Oração à Nossa Senhora",
    iconName: "flower-outline",
    iconSet: "image",
    imageSource: MARY_ICON,
    accentColor: "#E91E8C",
    text: `Ave Maria, cheia de graça,\no Senhor é convosco.\nBendita sois vós entre as mulheres,\ne bendito é o fruto do vosso ventre, Jesus.\n\nSanta Maria, Mãe de Deus,\nrogai por nós pecadores,\nagora e na hora de nossa morte.\n\nAmém.`,
  },
  {
    id: "gloria",
    title: "Glória ao Pai",
    subtitle: "Doxologia",
    iconName: "star",
    iconSet: "ionicons",
    accentColor: Colors.light.gold,
    text: `Glória ao Pai,\nao Filho\ne ao Espírito Santo.\n\nComo era no princípio,\nagora e sempre,\npelos séculos dos séculos.\n\nAmém.`,
  },
  {
    id: "credo",
    title: "Creio em Deus",
    subtitle: "Credo Apostólico",
    iconName: "hands-pray",
    iconSet: "material",
    accentColor: "#3498DB",
    text: `Creio em Deus Pai todo-poderoso,\nCriador do céu e da terra.\nE em Jesus Cristo, seu único Filho, Nosso Senhor,\nque foi concebido pelo poder do Espírito Santo,\nnasceu da Virgem Maria,\npadeceu sob Pôncio Pilatos,\nfoi crucificado, morto e sepultado;\ndesceu à mansão dos mortos;\nressuscitou ao terceiro dia;\nsubiu aos céus,\nestá sentado à direita de Deus Pai todo-poderoso\ne há de vir a julgar os vivos e os mortos.\n\nCreio no Espírito Santo,\nna santa Igreja Católica,\nna comunhão dos santos,\nna remissão dos pecados,\nna ressurreição da carne,\nna vida eterna.\n\nAmém.`,
  },
  {
    id: "anjo-da-guarda",
    title: "Anjo da Guarda",
    subtitle: "Oração ao anjo protetor",
    iconName: "shield-star-outline",
    iconSet: "material",
    accentColor: "#27AE60",
    text: `Santo Anjo do Senhor,\nmeu zeloso guardador,\nse a ti me confiou a piedade divina,\nsempre me rege,\nme guarda,\nme governa\ne ilumina.\n\nAmém.`,
  },
  {
    id: "espirito-santo",
    title: "Oração ao Espírito Santo",
    subtitle: "Invocação ao Paráclito",
    iconName: "bird",
    iconSet: "image",
    imageSource: DOVE_ICON,
    accentColor: "#E74C3C",
    text: `Vinde, Espírito Santo, enchei os corações dos vossos fiéis e acendei neles o fogo do Vosso amor. Enviai o Vosso Espírito e tudo será criado, e renovareis a face da Terra!\n\nOremos: Ó Deus que instruístes os corações dos Vossos fiéis, com a luz do Espírito Santo, fazei que apreciemos retamente todas as coisas, segundo o mesmo Espírito, e gozemos sempre de Sua consolação, por Cristo, Senhor Nosso. Amém!`,
  },
  {
    id: "salve-rainha",
    title: "Salve Rainha",
    subtitle: "Antífona mariana",
    iconName: "flower-outline",
    iconSet: "image",
    imageSource: MARY_ICON,
    accentColor: "#9B59B6",
    text: SALVE_RAINHA_TEXT,
  },
  {
    id: "consagracao-nossa-senhora",
    title: "Consagração a Nossa Senhora",
    subtitle: "Ato de consagração",
    iconName: "flower-outline",
    iconSet: "image",
    imageSource: MARY_ICON,
    accentColor: "#E91E8C",
    text: `Oh, minha Senhora\nE também minha Mãe\nEu me ofereço\nInteiramente todo a vós\nE em prova\nDa minha devoção\nEu hoje vos dou meu coração\nConsagro a vós meus olhos\nMeus ouvidos, minha boca\nTudo o que sou\nDesejo que a vós pertença\nIncomparável Mãe\nGuardai-me, defendei-me\nComo filho\nE propriedade vossa amém!\nComo filho\nE propriedade vossa amém!`,
  },
  {
    id: "salmo-23",
    title: "Salmo 23",
    subtitle: "O Senhor é o meu pastor",
    iconName: "leaf-outline",
    iconSet: "ionicons",
    accentColor: "#27AE60",
    text: `O Senhor é o meu pastor;\nnada me faltará.\n\nFaz-me repousar em pastos verdejantes;\nconduzi-me às águas tranquilas.\nRestabelece as minhas forças;\nguia-me pelas veredas da justiça,\npor amor do seu nome.\n\nMesmo que eu caminhasse\npor um vale tenebroso,\nnão temeria nenhum mal,\npois vós estais comigo;\nO vosso cajado e o vosso báculo\nsão o meu amparo.\n\nPreparais um banquete para mim\nà vista dos meus inimigos;\nperfumai com óleo a minha cabeça\ne o meu cálice transborda.\n\nSim, felicidade e misericórdia\nhão de seguir-me\ntodos os dias da minha vida;\ne habitarei na casa do Senhor\npor longos dias.\n\nAmém.`,
  },
  {
    id: "acalmar-coracao",
    title: "Oração para Acalmar o Coração",
    subtitle: "Paz e serenidade",
    iconName: "water-outline",
    iconSet: "ionicons",
    accentColor: "#6B9ECA",
    text: `Senhor Jesus,\ntu que disseste: "A minha paz eu vos dou",\nconcedei-me a paz do coração.\n\nQuando a ansiedade me dominar,\nlembrai-me que estais ao meu lado.\nQuando o medo me paralisar,\ndai-me coragem para seguir em frente.\nQuando as preocupações me sufocarem,\nfazei-me confiar na vossa providência.\n\nQue eu possa lançar sobre vós\ntodas as minhas preocupações,\npois sei que vós cuidais de mim.\n\nAmém.`,
  },
  {
    id: "agradecimento",
    title: "Oração de Agradecimento",
    subtitle: "Gratidão a Deus",
    iconName: "heart",
    iconSet: "ionicons",
    accentColor: "#E74C3C",
    text: `Senhor e Deus meu,\ngratidão é a palavra que sai do meu coração\nao contemplar tudo o que fizeste por mim.\n\nObrigado pela vida, pela saúde,\npela família, pelos amigos.\nObrigado pelos momentos difíceis\nque me fizeram crescer.\nObrigado pelas graças que recebi\nsem sequer perceber.\n\nFazei-me sempre um coração grato,\ncapaz de reconhecer vossa presença\nem cada detalhe da vida.\n\nAmém.`,
  },
  {
    id: "terco",
    title: "Santo Terço",
    subtitle: "Guia para rezar o Rosário",
    iconName: "infinite-outline",
    iconSet: "ionicons",
    accentColor: Colors.light.gold,
    text: `COMO REZAR O SANTO TERÇO\n\n1. Faça o sinal da cruz\n2. Recite a oração de Oferecimento\n"Divino Jesus, eu vos ofereço este terço (Rosário) que vou rezar, contemplando os mistérios da nossa redenção. Concedei-me, por intercessão de Maria, vossa Mãe Santíssima, a quem me dirijo, as graças necessárias para bem rezá-lo para ganhar as indulgências desta santa devoção."\n3. Recite o Creio em Deus Pai\n4. Reze um Pai Nosso\n5. Reze três Ave Marias (pelas virtudes: Fé, Esperança, Caridade)\n6. Reze um Glória ao Pai\n\nPara cada um dos 5 mistérios:\n• Anuncie o mistério\n• Reze um Pai Nosso\n• Reze dez Ave Marias\n• Reze um Glória ao Pai\n• Reze a Oração de Fátima:\n"Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, levai as almas todas para o Céu, especialmente as que mais precisarem de vossa misericórdia."\n\nMISTÉRIOS GOZOSOS (2ª feira e Sábado)\n1. A Anunciação\n2. A Visitação\n3. O Nascimento de Jesus\n4. A Apresentação no Templo\n5. Jesus encontrado no Templo\n\nMISTÉRIOS DOLOROSOS (3ª e 6ª feira)\n1. A Agonia no Horto\n2. A Flagelação\n3. A Coroação de Espinhos\n4. Jesus carregando a Cruz\n5. A Crucificação\n\nMISTÉRIOS GLORIOSOS (4ª feira e domingo)\n1. A Ressurreição\n2. A Ascensão\n3. A Vinda do Espírito Santo\n4. A Assunção de Maria\n5. A Coroação de Maria\n\nMISTÉRIOS LUMINOSOS (5ª feira)\n1. O Batismo de Jesus\n2. As Bodas de Caná\n3. A Proclamação do Reino\n4. A Transfiguração\n5. A Instituição da Eucaristia\nRecite a oração de Ação de Graças\n"Infinitas graças vos damos, soberana Rainha, pelos benefícios que recebemos todos os dias de vossas mãos liberais. Dignai-vos agora e para sempre tomar-nos debaixo de vosso poderoso amparo, e para mais vos alegrar, vos saudamos com uma Salve Rainha."\n\nTermine com a Salve Rainha.\n\nOpcional: Na Oração de Oferecimento, também pode-se recitar a oração que segue (e também intenções particulares):\nOfereço-Vos também em reparação aos Corações de Jesus e Maria, nas intenções do Imaculado Coração de Maria, nas intenções do Santo Padre, pelo Santo Padre e por toda a Igreja, pela santificação do clero e das famílias, pelas vocações sacerdotais, religiosas, missionárias e leigas, pela Paz no mundo, pelo Brasil.`,
  },
  {
    id: "terco-interativo",
    title: "Santo Terço Interativo",
    subtitle: "Reze o Santo Terço de forma interativa, acompanhando cada conta.",
    iconName: "infinite-outline",
    iconSet: "ionicons",
    accentColor: Colors.light.gold,
    text: "",
  },
  {
    id: "divina-misericordia",
    title: "Coroa da Divina Misericórdia",
    subtitle: "Terço da Misericórdia",
    iconName: "ellipse-outline",
    iconSet: "ionicons",
    accentColor: "#E74C3C",
    text: `O Terço da Misericórdia é uma devoção oficial baseada nas revelações de Santa Faustina Kowalska, reconhecidas pela Igreja.\n\n📿 Como rezar o Terço da Misericórdia\n\n1. Sinal da Cruz\nEm nome do Pai, do Filho e do Espírito Santo. Amém.\n\n2. Orações iniciais:\nPai Nosso · Ave Maria · Creio\n\n🕊️ Nas contas grandes (antes de cada dezena):\n"Eterno Pai, eu Vos ofereço o Corpo e Sangue, Alma e Divindade de Vosso diletíssimo Filho, Nosso Senhor Jesus Cristo, em expiação dos nossos pecados e dos do mundo inteiro."\n\n🙏 Nas contas pequenas (10x cada dezena):\n"Pela Sua dolorosa Paixão, tende misericórdia de nós e do mundo inteiro."\n\n✨ Ao final (3 vezes):\n"Deus Santo, Deus Forte, Deus Imortal, tende piedade de nós e do mundo inteiro."\n\n⏰ É recomendado rezar especialmente às 15h — a Hora da Misericórdia.`,
  },
  {
    id: "lectio-divina",
    title: "Lectio Divina",
    subtitle: "Leitura Orante",
    iconName: "book-open-page-variant",
    iconSet: "material",
    accentColor: "#5C6BC0",
    text: `A Lectio Divina (Leitura Orante) é um método tradicional católico de leitura meditativa da Bíblia, visando a intimidade com Deus através da Sua Palavra. Estruturada em quatro passos — Leitura (Lectio), Meditação (Meditatio), Oração (Oratio) e Contemplação (Contemplatio) — transforma o estudo das Escrituras em um diálogo amoroso e oração.\n\n✦ Passos para Praticar a Lectio Divina\n\nPreparação\nEscolha um lugar calmo, invoque o Espírito Santo e selecione um texto bíblico (geralmente o Evangelho do dia).\n\n1. Leitura (Lectio)\nLeia o texto lentamente, várias vezes, buscando entender o que a Bíblia diz em si mesma.\n\n2. Meditação (Meditatio)\nReflita calmamente a Palavra, questionando como ela se aplica à sua vida pessoal e o que Deus lhe diz hoje.\n\n3. Oração (Oratio)\nResponda a Deus com base no que você meditou, em louvor, súplica ou penitência.\n\n4. Contemplação (Contemplatio)\nSilencie o coração para descansar na presença de Deus e permita que Sua Palavra transforme seu ser.\n\n✦ Recomendações\n\nPode ser feita individualmente ou em grupo, com duração recomendada de pelo menos 30 minutos. Diferencia-se do estudo teológico por ser um encontro de amor. A prática consistente ajuda a cultivar a amizade com Deus e a aplicar a vontade divina no cotidiano.`,
  },
];

// ── PrayerCard ───────────────────────────────────────────────────
function PrayerCard({ prayer, onPress }: { prayer: Prayer; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        style={styles.prayerCard}
      >
        <View style={[styles.prayerIcon, { backgroundColor: prayer.accentColor + "20" }]}>
          <PrayerIcon prayer={prayer} size={26} color={prayer.accentColor} />
        </View>
        <View style={styles.prayerInfo}>
          <Text style={styles.prayerTitle}>{prayer.title}</Text>
          <Text style={styles.prayerSubtitle}>{prayer.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.light.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

// ── PrayerModal ──────────────────────────────────────────────────
function PrayerModal({ prayer, visible, onClose }: { prayer: Prayer | null; visible: boolean; onClose: () => void }) {
  const { settings } = useSettings();
  const insets   = useSafeAreaInsets();
  const topPad   = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  if (!prayer) return null;

  const isLectioDivina = prayer.id === "lectio-divina";

  async function handleShare() {
    if (!prayer.text) return;
    try {
      await Share.share({
        message: "🙏 " + prayer.title + "

" + prayer.text + "

🙏 Compartilhado pelo app Vivo em Deus",
      });
    } catch {}
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { paddingTop: topPad }]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.light.deepBlue} />
          </Pressable>
          <Text style={styles.modalTitle}>{prayer.title}</Text>
          {!!prayer.text && (
            <Pressable onPress={handleShare} style={styles.closeBtn}>
              <Ionicons name="share-social-outline" size={22} color={Colors.light.deepBlue} />
            </Pressable>
          )}
          {!prayer.text && <View style={styles.closeBtn} />}
        </View>
        <ScrollView
          contentContainerStyle={[styles.modalContent, { paddingBottom: bottomPad + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.prayerIconLarge, { backgroundColor: prayer.accentColor + "20" }]}>
            <PrayerIcon prayer={prayer} size={48} color={prayer.accentColor} />
          </View>
          <Text style={styles.modalSubtitle}>{prayer.subtitle}</Text>
          <View style={[styles.divider, { backgroundColor: prayer.accentColor }]} />

          {isLectioDivina ? (
            // Layout elegante para Lectio Divina
            <View style={styles.lectioContainer}>
              {prayer.text.split("\n\n").map((block, idx) => {
                const isTitle = block.startsWith("✦");
                const isStep  = /^\d\./.test(block);
                return (
                  <View key={idx} style={styles.lectioBlock}>
                    <Text style={[
                      styles.prayerText,
                      isTitle && styles.lectioSectionTitle,
                      isStep  && styles.lectioStep,
                      settings.largeText && styles.largeText,
                    ]}>
                      {block}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.prayerText, settings.largeText && styles.largeText]}>
              {prayer.text}
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── OracoesScreen ────────────────────────────────────────────────
export default function OracoesScreen() {
  const insets    = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  // ✅ paddingTop para safe area — só iOS (notch/Dynamic Island)
  // No Android o insets.top já é tratado pela status bar nativa
  const topPad    = Platform.OS === "ios" ? insets.top : 0;
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [modalVisible, setModalVisible]     = useState(false);

  const handleOpenPrayer = async (prayer: Prayer) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (prayer.id === "terco-interativo") { router.push("/terco"); return; }
    setSelectedPrayer(prayer);
    setModalVisible(true);
  };

  const essenciais = PRAYERS.slice(0, 6);
  const marianas   = PRAYERS.slice(6, 8);
  const salmos     = [PRAYERS[8]];
  const especiais  = [PRAYERS[9], PRAYERS[10]];
  const tercos     = [PRAYERS[11], PRAYERS[12], PRAYERS[13]];
  const lectio     = [PRAYERS[14]];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100, paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <MaterialCommunityIcons name="hands-pray" size={28} color={Colors.light.deepBlue} />
        <Text style={styles.screenTitle}>Orações</Text>
      </View>

      <Text style={styles.sectionLabel}>Orações Essenciais</Text>
      {essenciais.map((p) => <PrayerCard key={p.id} prayer={p} onPress={() => handleOpenPrayer(p)} />)}

      <Text style={styles.sectionLabel}>Orações Marianas</Text>
      {[PRAYERS[1], ...marianas].map((p) => <PrayerCard key={p.id} prayer={p} onPress={() => handleOpenPrayer(p)} />)}

      <Text style={styles.sectionLabel}>Salmos</Text>
      {salmos.map((p) => <PrayerCard key={p.id} prayer={p} onPress={() => handleOpenPrayer(p)} />)}

      <Text style={styles.sectionLabel}>Orações Especiais</Text>
      {especiais.map((p) => <PrayerCard key={p.id} prayer={p} onPress={() => handleOpenPrayer(p)} />)}

      <Text style={styles.sectionLabel}>Terços e Novenas</Text>
      {tercos.map((p) => <PrayerCard key={p.id} prayer={p} onPress={() => handleOpenPrayer(p)} />)}

      <Text style={styles.sectionLabel}>Lectio Divina</Text>
      {lectio.map((p) => <PrayerCard key={p.id} prayer={p} onPress={() => handleOpenPrayer(p)} />)}

      <PrayerModal prayer={selectedPrayer} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.cream },
  content: { padding: 16, paddingTop: 16 },
  topBar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginBottom: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
  },
  screenTitle: { fontSize: 22, fontFamily: "Inter_700Bold", fontWeight: "700" as const, color: Colors.light.text },
  sectionLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const,
    color: Colors.light.textMuted, textTransform: "uppercase" as const,
    letterSpacing: 1.2, marginTop: 20, marginBottom: 10,
  },
  prayerCard: {
    backgroundColor: Colors.light.backgroundCard, borderRadius: 16,
    flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 10, gap: 14,
    shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  prayerIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  prayerInfo: { flex: 1 },
  prayerTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, color: Colors.light.text, marginBottom: 2 },
  prayerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  modalRoot: { flex: 1, backgroundColor: Colors.light.cream },
  modalHeader: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
    backgroundColor: Colors.light.backgroundCard,
  },
  closeBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  modalTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", fontWeight: "700" as const, color: Colors.light.deepBlue, textAlign: "center" },
  modalContent: { padding: 24, alignItems: "center" },
  prayerIconLarge: { width: 88, height: 88, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, marginBottom: 16, textAlign: "center" },
  divider: { width: 48, height: 2, borderRadius: 2, marginBottom: 28 },
  prayerText: { fontSize: 18, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 34, textAlign: "center" },
  largeText: { fontSize: 22, lineHeight: 40 },
  // Lectio Divina
  lectioContainer: { width: "100%", gap: 16 },
  lectioBlock: { width: "100%" },
  lectioSectionTitle: {
    fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const,
    color: "#5C6BC0", textAlign: "left", lineHeight: 24,
  },
  lectioStep: {
    fontSize: 17, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const,
    color: Colors.light.deepBlue, textAlign: "left", lineHeight: 28,
  },
});
