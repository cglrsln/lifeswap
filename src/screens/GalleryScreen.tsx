import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CharacterFace } from '@/components/CharacterFace';
import { ShadowCard } from '@/components/ShadowCard';
import { careers, TOTAL_ENDINGS } from '@/content';
import { countUnlocked, emptyProgress, loadProgress, resetProgress, type Progress } from '@/storage/progress';
import { fonts } from '@/theme/game';

export function GalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState<Progress>(emptyProgress());
  const [armReset, setArmReset] = useState(false);
  const [showSketches, setShowSketches] = useState(false);
  const found = countUnlocked(progress);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadProgress().then((next) => {
        if (alive) setProgress(next);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 }]}
    >
      <View style={styles.blobPink} />
      <View style={styles.blobTeal} />
      <Text style={styles.kicker}>WAKE UP AS SOMEONE ELSE</Text>
      <Text style={styles.wordmark}>Lifeswap</Text>
      <Text style={styles.tagline}>Live a day you would never get.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Wake up as Maya, 16, ballet student"
        onPress={() => router.push('/realday')}
        style={({ pressed }) => [styles.realCta, pressed && styles.pressed]}
      >
        <Text style={styles.realKicker}>TODAY</Text>
        <Text style={styles.realTitle}>Wake up as Maya</Text>
        <Text style={styles.realMeta}>16 · ballet student · one real day</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => setShowSketches((open) => !open)}
        style={styles.sketchLink}
      >
        <Text style={styles.sketchText}>{showSketches ? 'Hide cartoon prototype' : 'Cartoon prototype'}</Text>
      </Pressable>
      {showSketches ? (
        <>
      <View style={styles.progressPill}>
        <Text style={styles.progressText}>
          {found} of {TOTAL_ENDINGS} endings found
        </Text>
      </View>
      <Text style={styles.section}>Earlier sketches</Text>
      {careers.map((career) => {
        const unlocked = progress.unlocked[career.id] ?? [];
        return (
          <Pressable
            key={career.id}
            accessibilityRole="button"
            accessibilityLabel={`Play as a ${career.name}, ${unlocked.length} of ${career.endings.length} endings found`}
            onPress={() => router.push(`/career/${career.id}`)}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <ShadowCard ink={career.theme.ink} background={career.theme.card}>
              <View style={[styles.stripe, { backgroundColor: career.theme.primary }]} />
              <View style={styles.cardRow}>
                <CharacterFace look={career.character} expression="hopeful" shirt={career.theme.primary} ink={career.theme.ink} size={92} />
                <View style={styles.cardCopy}>
                  <Text style={[styles.careerName, { color: career.theme.deep }]}>{career.name}</Text>
                  <Text style={[styles.who, { color: career.theme.ink }]}>
                    {career.character.name} · age {career.startAge}
                  </Text>
                  <Text style={[styles.blurb, { color: career.theme.ink }]}>{career.blurb}</Text>
                  <Text style={[styles.endingCount, { color: career.theme.deep }]}>
                    {unlocked.length} of {career.endings.length} endings
                  </Text>
                  <View style={styles.chips}>
                    {career.endings.map((ending) => {
                      const open = unlocked.includes(ending.id);
                      return (
                        <View
                          key={ending.id}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: open ? career.theme.secondary : '#F4F1EA',
                              borderColor: career.theme.ink,
                            },
                          ]}
                        >
                          <Text style={[styles.chipText, { color: career.theme.ink }]} numberOfLines={1}>
                            {open ? ending.title : 'Locked'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ShadowCard>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (!armReset) {
            setArmReset(true);
            return;
          }
          void resetProgress().then(() => {
            setProgress(emptyProgress());
            setArmReset(false);
          });
        }}
        style={styles.reset}
      >
        <Text style={styles.resetText}>{armReset ? 'Tap again to erase saved endings' : 'Reset saved progress'}</Text>
      </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF6EE' },
  content: { paddingHorizontal: 18, gap: 12 },
  blobPink: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFD0E4',
    top: -40,
    right: -50,
  },
  blobTeal: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#D7F3E8',
    top: 120,
    left: -60,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.4,
    color: '#6B1240',
    fontSize: 12,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 54,
    color: '#241433',
    lineHeight: 58,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: '#241433',
    lineHeight: 24,
    maxWidth: 320,
  },
  progressPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#241433',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  progressText: { color: '#FFF6EE', fontFamily: fonts.bodyBold, fontSize: 14 },
  section: {
    marginTop: 8,
    fontFamily: fonts.displaySoft,
    fontSize: 22,
    color: '#241433',
  },
  pressed: { transform: [{ translateY: 2 }] },
  stripe: { height: 10 },
  cardRow: { flexDirection: 'row', gap: 4, paddingRight: 12, paddingBottom: 12, alignItems: 'center' },
  cardCopy: { flex: 1, gap: 2, paddingTop: 8 },
  careerName: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32 },
  who: { fontFamily: fonts.bodyBold, fontSize: 13 },
  blurb: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, marginTop: 2 },
  endingCount: { fontFamily: fonts.bodyBold, fontSize: 13, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 120 },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 11 },
  realCta: {
    backgroundColor: '#1C1412',
    borderRadius: 22,
    padding: 18,
    gap: 4,
  },
  realKicker: { color: '#E7B7CF', fontFamily: fonts.bodyBold, letterSpacing: 1.6, fontSize: 12 },
  realTitle: { color: '#FFF6EE', fontFamily: fonts.display, fontSize: 32, lineHeight: 36 },
  realMeta: { color: '#F3E6D8', fontFamily: fonts.body, fontSize: 15 },
  sketchLink: { alignSelf: 'center', paddingVertical: 8 },
  sketchText: { fontFamily: fonts.body, color: '#6D5A73', textDecorationLine: 'underline', fontSize: 14 },
  reset: { alignSelf: 'center', padding: 12 },
  resetText: { fontFamily: fonts.body, color: '#6D5A73', textDecorationLine: 'underline', fontSize: 14 },
});
