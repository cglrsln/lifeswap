import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecapCard } from '@/components/RecapCard';
import { shareRecapCard } from '@/share/shareCard';
import { getLastRun } from '@/state/lastRun';
import { loadLastRun, unlockEnding } from '@/storage/progress';
import type { RunSummary } from '@/engine/types';
import { fonts } from '@/theme/game';

export function RecapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const [summary, setSummary] = useState<RunSummary | null>(getLastRun());
  const [isNew, setIsNew] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const stored = getLastRun() ?? (await loadLastRun());
      if (!alive) return;
      if (!stored) {
        setSummary(null);
        return;
      }
      setSummary(stored);
      const unlocked = await unlockEnding(stored.careerId, stored.endingId);
      if (alive) setIsNew(unlocked.isNew);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!summary) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>No life to recap yet.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')}>
          <Text style={styles.link}>Go to the gallery</Text>
        </Pressable>
      </View>
    );
  }

  const theme = summary.theme;

  async function onShare() {
    if (!summary || sharing) return;
    setSharing(true);
    setShareNote(null);
    try {
      const result = await shareRecapCard(cardRef, summary);
      setShareNote(
        result === 'saved'
          ? 'Saved the card image. On a phone, this opens the share sheet.'
          : result === 'text'
            ? 'Shared the story as text.'
            : 'Share sheet opened.',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Share failed.';
      if (message.toLowerCase().includes('abort') || message.toLowerCase().includes('cancel')) {
        setShareNote(null);
      } else {
        setShareNote('Couldn’t share the card. Try again in a moment.');
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.paper }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 }]}
    >
      {isNew ? (
        <View style={[styles.newBanner, { backgroundColor: theme.secondary, borderColor: theme.ink }]}>
          <Text style={[styles.newText, { color: theme.ink }]}>New ending unlocked</Text>
        </View>
      ) : null}
      <View ref={cardRef} collapsable={false}>
        <RecapCard summary={summary} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share this life"
        onPress={() => void onShare()}
        style={({ pressed }) => [styles.primary, { backgroundColor: theme.primary, borderColor: theme.ink }, pressed && styles.pressed]}
      >
        {sharing ? <ActivityIndicator color="#FFFDF8" /> : <Text style={styles.primaryText}>Share this life</Text>}
      </Pressable>
      {shareNote ? <Text style={[styles.note, { color: theme.deep }]}>{shareNote}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace(`/play/${summary.careerId}`)}
        style={({ pressed }) => [styles.secondary, { borderColor: theme.ink }, pressed && styles.pressed]}
      >
        <Text style={[styles.secondaryText, { color: theme.ink }]}>Live it again</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.ghost}>
        <Text style={[styles.ghostText, { color: theme.deep }]}>Back to the gallery</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 12 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF6EE', gap: 12 },
  missingTitle: { fontFamily: fonts.displaySoft, fontSize: 22, color: '#241433' },
  link: { fontFamily: fonts.bodyBold, color: '#6B1240', fontSize: 16 },
  newBanner: { borderWidth: 3, borderRadius: 999, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6 },
  newText: { fontFamily: fonts.bodyBold, fontSize: 14 },
  primary: { borderWidth: 3, borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  primaryText: { fontFamily: fonts.display, fontSize: 22, color: '#FFFDF8' },
  secondary: { borderWidth: 3, borderRadius: 18, paddingVertical: 14, alignItems: 'center', backgroundColor: '#FFFDF8' },
  secondaryText: { fontFamily: fonts.displaySoft, fontSize: 18 },
  ghost: { alignItems: 'center', padding: 8 },
  ghostText: { fontFamily: fonts.bodyBold, fontSize: 15, textDecorationLine: 'underline' },
  note: { fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
  pressed: { transform: [{ translateY: 2 }] },
});
