import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameProps } from '@/minigames/types';
import { fonts } from '@/theme/game';

const STEPS = 10;
const WINDOW = 2100;
const LIMIT = 34000;

export function RescueGame({ primary, onDone }: GameProps) {
  const [step, setStep] = useState(0);
  const [left, setLeft] = useState(LIMIT);
  const [arm, setArm] = useState(0);
  const stepRef = useRef(0);
  const misses = useRef(0);
  const finished = useRef(false);
  const started = useRef(Date.now());
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - started.current;
      setLeft(Math.max(0, LIMIT - elapsed));
      const local = elapsed % WINDOW;
      setArm(local / WINDOW);
      if (elapsed >= LIMIT && !finished.current) {
        finished.current = true;
        clearInterval(timer);
        done.current('fail');
      }
    }, 40);
    return () => clearInterval(timer);
  }, []);

  function move() {
    if (finished.current) return;
    const elapsed = Date.now() - started.current;
    const local = elapsed % WINDOW;
    const good = local > WINDOW * 0.62;
    if (!good) {
      misses.current += 1;
      return;
    }
    const next = stepRef.current + 1;
    stepRef.current = next;
    setStep(next);
    if (next >= STEPS) {
      finished.current = true;
      const remain = LIMIT - elapsed;
      done.current(remain > 6000 && misses.current < 4 ? 'success' : 'partial');
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.prompt, { fontFamily: fonts.display }]}>Find them</Text>
      <View style={styles.smoke}>
        <View style={[styles.glow, { opacity: 0.2 + step / STEPS }]} />
        <View style={[styles.ring, { borderColor: primary, transform: [{ scale: 1.5 - arm * 0.5 }] }]} />
        <Text style={[styles.near, { fontFamily: fonts.bodyBold }]}>{step >= STEPS - 1 ? 'Close' : 'Smoke'}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Move through the smoke" onPress={move} style={[styles.move, { backgroundColor: primary }]}>
        <Text style={[styles.moveText, { fontFamily: fonts.display }]}>Move</Text>
      </Pressable>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(1 - left / LIMIT) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#1C1218', borderRadius: 28, alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 300, padding: 12 },
  prompt: { color: '#FFFDF8', fontSize: 28 },
  smoke: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFC43D' },
  ring: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 8 },
  near: { color: '#FFFDF8', fontSize: 16 },
  move: { borderRadius: 18, paddingHorizontal: 28, paddingVertical: 12 },
  moveText: { color: '#FFFDF8', fontSize: 22 },
  track: { width: '80%', height: 12, borderRadius: 8, backgroundColor: '#3a2a32', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#FF8A00' },
});
