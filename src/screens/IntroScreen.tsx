import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CharacterFace } from '@/components/CharacterFace';
import { ShadowCard } from '@/components/ShadowCard';
import { StatPips } from '@/components/StatPips';
import { getCareer } from '@/content';
import { fonts } from '@/theme/game';

export function IntroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const career = getCareer(String(id));
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!career) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>That life isn’t on the shelf.</Text>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button">
          <Text style={styles.link}>Back to the gallery</Text>
        </Pressable>
      </View>
    );
  }

  const theme = career.theme;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.paper }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
    >
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <Text style={[styles.backText, { color: theme.deep }]}>‹ Gallery</Text>
      </Pressable>
      <Text style={[styles.kicker, { color: theme.deep }]}>{career.name.toUpperCase()}</Text>
      <View style={styles.hero}>
        <CharacterFace look={career.character} expression="hopeful" shirt={theme.primary} ink={theme.ink} size={168} />
      </View>
      <Text style={[styles.name, { color: theme.ink }]}>{career.character.name}</Text>
      <Text style={[styles.meta, { color: theme.deep }]}>
        {career.character.pronouns} · starts at {career.startAge}
      </Text>
      <Text style={[styles.intro, { color: theme.ink }]}>{career.intro}</Text>
      <ShadowCard ink={theme.ink} background="#fff">
        <View style={styles.stats}>
          <Text style={[styles.statsTitle, { color: theme.ink }]}>How you start</Text>
          <StatPips stats={career.startStats} ink={theme.ink} />
        </View>
      </ShadowCard>
      <Text style={[styles.note, { color: theme.deep }]}>Swipe or tap. Early choices still follow you.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Start ${career.character.name}'s life`}
        onPress={() => router.push(`/play/${career.id}`)}
        style={({ pressed }) => [styles.start, { backgroundColor: theme.primary, borderColor: theme.ink }, pressed && styles.pressed]}
      >
        <Text style={[styles.startText, { color: '#FFFDF8' }]}>Start this life</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 10 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF6EE', gap: 12 },
  missingText: { fontFamily: fonts.displaySoft, fontSize: 22, color: '#241433' },
  link: { fontFamily: fonts.bodyBold, color: '#6B1240', fontSize: 16 },
  back: { alignSelf: 'flex-start', paddingVertical: 6 },
  backText: { fontFamily: fonts.displaySoft, fontSize: 18 },
  kicker: { fontFamily: fonts.bodyBold, letterSpacing: 1.6, fontSize: 13 },
  hero: { alignItems: 'center', marginTop: 4 },
  name: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, textAlign: 'center' },
  meta: { fontFamily: fonts.bodyBold, fontSize: 15, textAlign: 'center' },
  intro: { fontFamily: fonts.body, fontSize: 17, lineHeight: 24, marginTop: 6 },
  stats: { padding: 14, gap: 10 },
  statsTitle: { fontFamily: fonts.displaySoft, fontSize: 18 },
  note: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  start: {
    marginTop: 8,
    borderWidth: 3,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pressed: { transform: [{ translateY: 2 }] },
  startText: { fontFamily: fonts.display, fontSize: 22 },
});
