import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const SOBRE = {
  icon: "information-circle-outline" as const,
  paragraphs: [
    'O aplicativo "Vivo em Deus" foi desenvolvido com o propósito de auxiliar fiéis católicos em sua caminhada diária de fé, proporcionando acesso fácil e organizado a conteúdos espirituais.',
    'Por meio deste aplicativo, o usuário pode acompanhar a liturgia diária, refletir sobre o Evangelho, realizar orações tradicionais da Igreja, e fortalecer sua vida espiritual com conteúdos inspiradores.',
    'O "Vivo em Deus" é destinado a todas as pessoas que desejam se aproximar de Deus, independentemente do nível de conhecimento religioso, oferecendo uma experiência simples, acolhedora e edificante.',
    'Nosso objetivo é incentivar momentos de oração, reflexão e conexão com Deus no dia a dia, contribuindo para uma vida mais plena, equilibrada e guiada pela fé.',
                                      ,
    '© 2026 Vivo em Deus. Todos os direitos reservados.

Este aplicativo e todo o seu conteúdo são protegidos por leis de direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição ou modificação sem autorização expressa.

Alguns conteúdos podem ter origem em fontes públicas ou religiosas amplamente difundidas, sendo utilizados com finalidade espiritual e educativa.

O aplicativo não possui vínculo oficial com instituições religiosas específicas.',
  ],
};

const TERMOS = {
  icon: "document-text-outline" as const,
  paragraphs: [
    'Ao utilizar o aplicativo "Vivo em Deus", o usuário concorda com os presentes Termos de Uso.',
    'O aplicativo tem caráter informativo e religioso, oferecendo conteúdos voltados à fé católica, como orações, leituras bíblicas e liturgia diária. O uso do aplicativo é de responsabilidade do usuário.',
    'Não garantimos disponibilidade contínua ou livre de erros, podendo o aplicativo passar por atualizações, melhorias ou interrupções temporárias sem aviso prévio.',
    'O usuário compromete-se a utilizar o aplicativo de forma adequada, respeitando sua finalidade religiosa e não realizando qualquer uso indevido que possa comprometer seu funcionamento.',
    'O conteúdo disponibilizado tem fins espirituais e não substitui orientações religiosas oficiais, aconselhamento pastoral ou qualquer outro tipo de orientação especializada.',
    'Ao continuar utilizando o aplicativo, o usuário declara estar ciente e de acordo com estes termos.',
  ],
};

const PRIVACIDADE = {
  icon: "shield-checkmark-outline" as const,
  paragraphs: [
    'A sua privacidade é importante para nós. Esta Política de Privacidade descreve como o aplicativo "Vivo em Deus" trata as informações dos usuários.',
    'O aplicativo não coleta, armazena ou compartilha dados pessoais sensíveis dos usuários sem consentimento.',
    'Algumas informações podem ser coletadas automaticamente por serviços de terceiros utilizados no aplicativo, como o Google AdMob, com a finalidade de exibir anúncios relevantes. Esses dados podem incluir informações não identificáveis, como tipo de dispositivo, sistema operacional e interações com anúncios.',
    'O aplicativo pode solicitar permissões do dispositivo, como notificações, exclusivamente para melhorar a experiência do usuário, como envio de lembretes diários.',
    'Não compartilhamos dados pessoais com terceiros, exceto quando necessário para o funcionamento de serviços integrados (como plataformas de anúncios), sempre respeitando as políticas dessas plataformas.',
    'O usuário pode, a qualquer momento, interromper o uso do aplicativo ou desativar permissões diretamente nas configurações do dispositivo.',
    'Recomendamos que o usuário revise também as políticas de privacidade dos serviços de terceiros utilizados, como o Google AdMob.',
    'Este aplicativo utiliza serviços de terceiros, como o Google AdMob, que podem coletar e processar dados de acordo com suas próprias políticas de privacidade. Recomendamos a leitura da política de privacidade do Google: https://policies.google.com/privacy',
    'A política de Privacidade do site pode ser acessada publicamente em https://aquatic-carver-4c9.notion.site/Pol-tica-de-Privacidade-Vivo-em-Deus-33a30daf411e80c4a2fcf6806b0ca3c0?source=copy_link',
    'Ao utilizar o aplicativo, você concorda com esta Política de Privacidade.',
  ],
};

function getContent(key: string) {
  const k = key?.toLowerCase();
  if (k === "termos" || k?.includes("termos")) return TERMOS;
  if (k === "privacidade" || k?.includes("privacidade")) return PRIVACIDADE;
  return SOBRE;
}

export default function InfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { titulo, tipo } = useLocalSearchParams<{ titulo: string; tipo: string }>();

  const content = getContent(tipo ?? titulo ?? "");

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.deepBlue} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {titulo || "Informações"}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconCircle}>
          <Ionicons name={content.icon} size={44} color={Colors.light.deepBlue} />
        </View>

        <Text style={styles.pageTitle}>{titulo || "Informações"}</Text>

        <View style={styles.divider} />

        {content.paragraphs.map((para, idx) => (
          <Text key={idx} style={styles.paragraph}>
            {para}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    backgroundColor: Colors.light.backgroundCard,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    textAlign: "center",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.light.deepBlue + "12",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: Colors.light.deepBlue,
    textAlign: "center",
    marginBottom: 4,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.light.gold,
    marginVertical: 20,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 26,
    textAlign: "left",
    alignSelf: "stretch",
    marginBottom: 16,
  },
});
