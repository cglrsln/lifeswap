import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ChoiceIcon as IconName } from '@/engine/types';
import { ChoiceIcon } from '@/components/ChoiceIcon';
import type { GameProps } from '@/minigames/types';
import { fonts } from '@/theme/game';

const ROUNDS: { icon: IconName; label: string }[] = [
  { icon: 'heart', label: 'Kneel' },
  { icon: 'book', label: 'Task' },
  { icon: 'hands', label: 'Breath' },
  { icon: 'book', label: 'Task' },
  { icon: 'hands', label: 'Breath' },
  { icon: 'heart', label: 'Kneel' },
  { icon: 'hands', label: 'Breath' },
  { icon: 'heart', label: 'Kneel' },
];
const WINDOW = 2600;

export function MeltdownGame({ ink, primary, onDone }: GameProps) {
  const [round, setRound] = useState(0);
  const [arm, setArm] = useState(1);
  const hits = useRef(0);
  const finished = useRef(false);
  const roundRef = useRef(0);
  const started = useRef(Date.now());
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - started.current;
      const index = Math.min(ROUNDS.length - 1, Math.floor(elapsed / WINDOW));
      const local = 1 - (elapsed % WINDOW) / WINDOW;
      roundRef.current = index;
      setRound(index);
      setArm(local);
      if (elapsed >= ROUNDS.length * WINDOW && !finished.current) {
        finished.current = true;
        clearInterval(timer);
        const score = hits.current;
        done.current(score >= 6 ? 'success' : score >= 4 ? 'partial' : 'fail');
      }
    }, 40);
    return () => clearInterval(timer);
  }, []);

  function pick(label: string) {
    if (finished.current) return;
    if (ROUNDS[roundRef.current].label === label && arm > 0.15) hits.current += 1;
  }

  const need = ROUNDS[round];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.prompt, { color: ink, fontFamily: fonts.display }]}>Calm them down</Text>
      <View style={styles.need}>
        <ChoiceIcon name={need.icon} color={primary} size={54} />
        <View style={[styles.meter, { borderColor: ink }]}>
          <View style={[styles.meterFill, { width: `${arm * 100}%`, backgroundColor: primary }]} />
        </View>
      </View>
      <View style={styles.actions}>
        {(['Kneel', 'Task', 'Breath'] as const).map((label) => (
          <Pressable key={label} accessibilityRole="button" onPress={() => pick(label)} style={[styles.action, { borderColor: ink }]}>
            <Text style={[styles.actionText, { color: ink, fontFamily: fonts.bodyBold }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 280 },
  prompt: { fontSize: 28 },
  need: { alignItems: 'center', gap: 8 },
  meter: { width: 160, height: 14, borderWidth: 3, borderRadius: 8, overflow: 'hidden' },
  meterFill: { height: '100%' },
  actions: { flexDirection: 'row', gap: 8 },
  action: { borderWidth: 3, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 14, backgroundColor: '#FFFDF8' },
  actionText: { fontSize: 16 },
});
