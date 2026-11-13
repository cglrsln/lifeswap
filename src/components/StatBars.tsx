import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { Stats } from '@/engine/types';
import { STAT_META, fonts } from '@/theme/game';

type Props = {
  stats: Stats;
  deltas?: Partial<Stats>;
  ink: string;
};

export function StatBars({ stats, deltas = {}, ink }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      {STAT_META.map((meta) => (
        <Bar
          key={meta.key}
          label={meta.label}
          color={meta.color}
          value={stats[meta.key]}
          delta={deltas[meta.key]}
          ink={ink}
        />
      ))}
    </View>
  );
}

function Bar({
  label,
  color,
  value,
  delta,
  ink,
}: {
  label: string;
  color: string;
  value: number;
  delta?: number;
  ink: string;
}) {
  const anim = useRef(new Animated.Value(value)).current;
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const id = anim.addListener(({ value: next }) => setShown(Math.round(next)));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 520, useNativeDriver: false }).start();
  }, [anim, value]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const deltaLabel = delta ? `${delta > 0 ? '+' : ''}${delta}` : null;

  return (
    <View style={styles.row} accessibilityLabel={`${label} ${shown}${deltaLabel ? `, change ${deltaLabel}` : ''}`}>
      <Text style={[styles.label, { color: ink, fontFamily: fonts.bodyBold }]}>{label}</Text>
      <View style={[styles.track, { borderColor: ink }]}>
        <Animated.View style={[styles.fill, { backgroundColor: color, width }]} />
      </View>
      <Text style={[styles.value, { color: ink, fontFamily: fonts.displaySoft }]}>{shown}</Text>
      <View style={styles.deltaSlot}>
        {deltaLabel ? (
          <Text style={[styles.delta, { color: delta && delta > 0 ? '#0E8F6E' : '#C62828', fontFamily: fonts.bodyBold }]}>
            {deltaLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { width: 102, fontSize: 12 },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 99,
    borderWidth: 2,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 99 },
  value: { width: 28, textAlign: 'right', fontSize: 14 },
  deltaSlot: { width: 32 },
  delta: { fontSize: 13 },
});
