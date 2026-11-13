import { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { GameProps } from '@/minigames/types';
import { fonts } from '@/theme/game';

const DURATION = 24000;

export function BalanceGame({ ink, primary, onDone }: GameProps) {
  const [offset, setOffset] = useState(0);
  const [progress, setProgress] = useState(0);
  const hold = useRef(0);
  const inZone = useRef(0);
  const alive = useRef(0);
  const fell = useRef(false);
  const finished = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        hold.current = 0;
      },
      onPanResponderMove: (_, gesture) => {
        hold.current = Math.max(-110, Math.min(110, gesture.dx * 0.9));
      },
      onPanResponderRelease: () => {
        hold.current = 0;
      },
    }),
  ).current;

  useEffect(() => {
    const started = Date.now();
    let wobble = 0;
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      wobble += 0.18;
      const drift = Math.sin(wobble) * 78 + Math.sin(wobble * 0.37) * 36;
      const corrected = drift - hold.current;
      setOffset(corrected);
      alive.current += 50;
      if (Math.abs(corrected) < 42) inZone.current += 50;
      if (Math.abs(corrected) > 120) fell.current = true;
      setProgress(Math.min(1, elapsed / DURATION));
      if ((elapsed >= DURATION || (fell.current && elapsed > 8000)) && !finished.current) {
        finished.current = true;
        clearInterval(timer);
        if (fell.current && inZone.current / alive.current < 0.45) {
          done.current('fail');
          return;
        }
        const ratio = inZone.current / Math.max(1, alive.current);
        done.current(ratio >= 0.62 ? 'success' : ratio >= 0.4 ? 'partial' : 'fail');
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.wrap} {...pan.panHandlers}>
      <Text style={[styles.prompt, { color: ink, fontFamily: fonts.display }]}>Hold the pose</Text>
      <View style={[styles.beam, { borderColor: ink }]}>
        <View style={[styles.zone, { backgroundColor: primary }]} />
        <View style={[styles.dancer, { transform: [{ translateX: offset }] }]}>
          <View style={[styles.head, { backgroundColor: ink }]} />
          <View style={[styles.body, { backgroundColor: primary }]} />
        </View>
      </View>
      <Text style={[styles.help, { color: ink, fontFamily: fonts.body }]}>Drag to stay centered</Text>
      <View style={[styles.track, { borderColor: ink }]}>
        <View style={[styles.fill, { backgroundColor: primary, width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 280 },
  prompt: { fontSize: 28 },
  beam: {
    width: 260,
    height: 86,
    borderWidth: 3,
    borderRadius: 40,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
  },
  zone: { position: 'absolute', alignSelf: 'center', width: 70, height: 70, borderRadius: 35, opacity: 0.35 },
  dancer: { position: 'absolute', alignSelf: 'center', left: '50%', marginLeft: -10, alignItems: 'center' },
  head: { width: 16, height: 16, borderRadius: 8 },
  body: { width: 18, height: 28, borderTopLeftRadius: 8, borderTopRightRadius: 8, marginTop: 2 },
  help: { fontSize: 14 },
  track: { width: '80%', height: 12, borderWidth: 2, borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%' },
});
