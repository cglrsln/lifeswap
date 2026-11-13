import { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { GameProps } from '@/minigames/types';
import { fonts } from '@/theme/game';

const COLORS = ['#E23B2F', '#FFC43D', '#2F6BFF', '#0E8F6E'];
const DURATION = 30000;

type Kid = { id: number; x: number; y: number; seated: boolean };

export function SeatingGame({ ink, onDone }: GameProps) {
  const [kids, setKids] = useState<Kid[]>(
    COLORS.map((_, id) => ({ id, x: 24 + id * 70, y: 20 + (id % 2) * 30, seated: false })),
  );
  const [unlocked, setUnlocked] = useState(2);
  const [progress, setProgress] = useState(0);
  const kidsRef = useRef(kids);
  kidsRef.current = kids;
  const drag = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const finished = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      setProgress(Math.min(1, elapsed / DURATION));
      if (elapsed > 10000) setUnlocked(4);
      setKids((current) =>
        current.map((kid) => {
          if (kid.seated || drag.current === kid.id) return kid;
          return {
            ...kid,
            x: Math.max(8, Math.min(260, kid.x + Math.sin(elapsed / 280 + kid.id) * 1.4)),
            y: Math.max(8, Math.min(90, kid.y + Math.cos(elapsed / 340 + kid.id) * 0.8)),
          };
        }),
      );
      if (elapsed >= DURATION && !finished.current) finish(kidsRef.current);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  function finish(current: Kid[]) {
    if (finished.current) return;
    finished.current = true;
    const seated = current.filter((kid) => kid.seated).length;
    done.current(seated === 4 ? 'success' : seated >= 3 ? 'partial' : 'fail');
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const localX = event.nativeEvent.locationX;
        const localY = event.nativeEvent.locationY;
        const hit = kidsRef.current.find((kid) => !kid.seated && Math.hypot(kid.x + 18 - localX, kid.y + 18 - localY) < 40);
        drag.current = hit ? hit.id : null;
        if (hit) origin.current = { x: hit.x, y: hit.y };
      },
      onPanResponderMove: (_, gesture) => {
        const id = drag.current;
        if (id === null) return;
        setKids((current) =>
          current.map((kid) =>
            kid.id === id ? { ...kid, x: origin.current.x + gesture.dx, y: origin.current.y + gesture.dy } : kid,
          ),
        );
      },
      onPanResponderRelease: () => {
        const id = drag.current;
        drag.current = null;
        if (id === null || id >= unlocked) return;
        setKids((current) => {
          const next = current.map((kid) => {
            if (kid.id !== id) return kid;
            const deskX = 20 + id * 74;
            const near = Math.hypot(kid.x - deskX, kid.y - 150) < 48;
            return near ? { ...kid, x: deskX, y: 146, seated: true } : kid;
          });
          if (next.every((kid) => kid.seated)) finish(next);
          return next;
        });
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.prompt, { color: ink, fontFamily: fonts.display }]}>Seat the class</Text>
      <View style={styles.field} {...pan.panHandlers}>
        {COLORS.map((color, index) => (
          <View
            key={color}
            style={[styles.desk, { left: 16 + index * 74, borderColor: ink, opacity: index < unlocked ? 1 : 0.35, backgroundColor: color }]}
          />
        ))}
        {kids.map((kid) => (
          <View key={kid.id} style={[styles.kid, { left: kid.x, top: kid.y, backgroundColor: COLORS[kid.id], borderColor: ink }]} />
        ))}
      </View>
      <View style={[styles.track, { borderColor: ink }]}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: ink }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 300, gap: 8 },
  prompt: { fontSize: 28, textAlign: 'center' },
  field: { flex: 1, minHeight: 210, backgroundColor: '#F4FBF7', borderRadius: 20 },
  desk: { position: 'absolute', top: 150, width: 48, height: 22, borderWidth: 3, borderRadius: 6 },
  kid: { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  track: { height: 12, borderWidth: 2, borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%' },
});
