import { StyleSheet, Text, View } from 'react-native';
import type { Stats } from '@/engine/types';
import type { ChoiceIcon as IconName } from '@/engine/types';
import { ChoiceIcon } from '@/components/ChoiceIcon';
import { STAT_META, fonts } from '@/theme/game';

const ICONS: Record<(typeof STAT_META)[number]['key'], IconName> = {
  money: 'coin',
  health: 'heart',
  happiness: 'star',
  reputation: 'crown',
  relationships: 'users',
};

type Props = {
  stats: Stats;
  deltas?: Partial<Stats>;
  ink: string;
  showNumbers?: boolean;
};

export function StatPips({ stats, deltas = {}, ink, showNumbers = false }: Props) {
  return (
    <View style={styles.row} accessibilityRole="summary">
      {STAT_META.map((meta) => {
        const delta = deltas[meta.key] ?? 0;
        const filled = Math.round(stats[meta.key] / 25);
        return (
          <View key={meta.key} style={styles.item} accessibilityLabel={`${meta.label} ${filled} of 4`}>
            <ChoiceIcon name={ICONS[meta.key]} color={meta.color} size={18} />
            <View style={styles.pips}>
              {[0, 1, 2, 3].map((pip) => (
                <View
                  key={pip}
                  style={[styles.pip, { backgroundColor: pip < filled ? meta.color : '#E7E0D8', borderColor: ink }]}
                />
              ))}
            </View>
            {showNumbers ? (
              <Text style={[styles.number, { color: ink, fontFamily: fonts.bodyBold }]}>{stats[meta.key]}</Text>
            ) : delta !== 0 ? (
              <Text style={[styles.arrow, { color: delta > 0 ? '#0E8F6E' : '#C62828', fontFamily: fonts.bodyBold }]}>
                {delta > 0 ? '▲' : '▼'}
              </Text>
            ) : (
              <View style={styles.arrowGap} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  item: { alignItems: 'center', flex: 1, gap: 3 },
  pips: { flexDirection: 'row', gap: 2 },
  pip: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  arrow: { fontSize: 10, lineHeight: 12 },
  arrowGap: { height: 12 },
  number: { fontSize: 12, lineHeight: 14 },
});
