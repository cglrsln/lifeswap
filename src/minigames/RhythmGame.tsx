import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameProps } from '@/minigames/types';
import { fonts } from '@/theme/game';

const LEAD = 2500;
const BEATS = 26;
const GAP = 720;
const TOTAL = LEAD + BEATS * GAP;

export function RhythmGame({ ink, primary, onDone }: GameProps) {
  const [now, setNow] = useState(0);
  const hits = useRef(0);
  const finished = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      setNow(elapsed);
      if (elapsed >= TOTAL + 350 && !finished.current) {
        finished.current = true;
        clearInterval(timer);
        const ratio = hits.current / BEATS;
        done.current(ratio >= 0.68 ? 'success' : ratio >= 0.42 ? 'partial' : 'fail');
      }
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const beatIndex = now < LEAD ? -1 : Math.floor((now - LEAD) / GAP);
  const into = now < LEAD ? 0 : (now - LEAD) % GAP;
  const scale = now < LEAD ? 1 : 1.7 - (into / GAP) * 0.7;
  const count = now < LEAD ? Math.max(1, 3 - Math.floor(now / 800)) : null;

  function tap() {
    if (finished.current || now < LEAD) return;
    const target = LEAD + beatIndex * GAP + GAP * 0.92;
    if (Math.abs(now - target) < 200) hits.current += 1;
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.prompt, { color: ink, fontFamily: fonts.display }]}>{count ? String(count) : 'Tap the beat'}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Tap the beat" onPress={tap} style={styles.hit}>
        <View style={[styles.ring, { borderColor: primary, transform: [{ scale }] }]} />
        <View style={[styles.core, { backgroundColor: primary }]} />
      </Pressable>
      <View style={[styles.track, { borderColor: ink }]}>
        <View style={[styles.fill, { backgroundColor: primary, width: `${Math.min(100, (now / TOTAL) * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 280 },
  prompt: { fontSize: 28 },
  hit: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 8 },
  core: { width: 72, height: 72, borderRadius: 36 },
  track: { width: '80%', height: 12, borderWidth: 2, borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%' },
});
