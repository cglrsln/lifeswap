import { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { GameProps } from '@/minigames/types';
import { fonts } from '@/theme/game';

const DURATION = 36000;
const FLAMES = [
  { x: 40, y: 40 },
  { x: 150, y: 30 },
  { x: 250, y: 70 },
  { x: 80, y: 130 },
  { x: 200, y: 150 },
  { x: 130, y: 90 },
];

export function HoseGame({ ink, primary, secondary, onDone }: GameProps) {
  const hp = useRef(FLAMES.map(() => 100));
  const [, setTick] = useState(0);
  const aim = useRef({ x: 140, y: 100, down: false });
  const [aimTick, setAimTick] = useState({ x: 140, y: 100 });
  const [progress, setProgress] = useState(0);
  const finished = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        aim.current = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY, down: true };
        setAimTick({ x: aim.current.x, y: aim.current.y });
      },
      onPanResponderMove: (event) => {
        aim.current.x = event.nativeEvent.locationX;
        aim.current.y = event.nativeEvent.locationY;
        setAimTick({ x: aim.current.x, y: aim.current.y });
      },
      onPanResponderRelease: () => {
        aim.current.down = false;
      },
    }),
  ).current;

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed > 8000) hp.current[5] = Math.min(100, hp.current[5]);
      if (aim.current.down) {
        hp.current = hp.current.map((life, index) => {
          if (index === 5 && elapsed < 8000) return life;
          const flame = FLAMES[index];
          const dist = Math.hypot(flame.x - aim.current.x, flame.y - aim.current.y);
          return dist < 48 ? Math.max(0, life - 4.2) : life;
        });
      }
      setTick((value) => value + 1);
      setProgress(Math.min(1, elapsed / DURATION));
      const active = hp.current.map((life, index) => (index === 5 && elapsed < 8000 ? 0 : life));
      const remaining = active.reduce((sum, life) => sum + life, 0);
      if (!finished.current && (remaining <= 0 || elapsed >= DURATION)) {
        finished.current = true;
        clearInterval(timer);
        if (remaining <= 0 && DURATION - elapsed > 5000) done.current('success');
        else if (remaining <= 0) done.current('partial');
        else done.current('fail');
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.prompt, { color: '#FFFDF8', fontFamily: fonts.display }]}>Spray the fire</Text>
      <View style={styles.field} {...pan.panHandlers}>
        {FLAMES.map((flame, index) => (
          <View
            key={flame.x}
            style={[
              styles.flame,
              {
                left: flame.x,
                top: flame.y,
                opacity: Math.max(0.15, hp.current[index] / 100),
                backgroundColor: index % 2 ? secondary : primary,
              },
            ]}
          />
        ))}
        <View style={[styles.nozzle, { left: aimTick.x - 10, top: aimTick.y - 10, borderColor: '#FFFDF8' }]} />
      </View>
      <View style={[styles.track, { borderColor: '#FFFDF8' }]}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#4A1A12', borderRadius: 28, padding: 12, gap: 10, minHeight: 300 },
  prompt: { fontSize: 28, textAlign: 'center' },
  field: { flex: 1, minHeight: 200 },
  flame: { position: 'absolute', width: 36, height: 48, borderRadius: 18 },
  nozzle: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 3, backgroundColor: '#9bd7ff' },
  track: { height: 12, borderWidth: 2, borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#9bd7ff' },
});
