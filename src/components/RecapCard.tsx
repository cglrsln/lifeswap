import { StyleSheet, Text, View } from 'react-native';
import { CharacterFace } from '@/components/CharacterFace';
import { StatPips } from '@/components/StatPips';
import { fonts } from '@/theme/game';
import { presence } from '@/theme/presence';
import type { RunSummary } from '@/engine/types';

export function RecapCard({ summary }: { summary: RunSummary }) {
  const theme = summary.theme;
  const state = presence(summary.stats, []);
  return (
    <View style={[styles.card, { backgroundColor: theme.paper, borderColor: theme.ink }]}>
      <View style={[styles.banner, { backgroundColor: theme.primary }]}>
        <Text style={styles.brand}>LIFESWAP</Text>
        <Text style={styles.bannerCareer}>{summary.careerName.toUpperCase()}</Text>
      </View>
      <View style={styles.hero}>
        <CharacterFace
          look={summary.look}
          expression={state.tired ? 'tired' : 'proud'}
          shirt={theme.primary}
          ink={theme.ink}
          size={108}
          tired={state.tired}
          limp={state.limp}
          outfit={state.outfit}
        />
        <View style={styles.heroCopy}>
          <Text style={[styles.name, { color: theme.ink }]}>{summary.characterName}</Text>
          <Text style={[styles.meta, { color: theme.deep }]}>
            {summary.pronouns} · age {summary.age}
          </Text>
          <Text style={[styles.scoreLabel, { color: theme.deep }]}>Happiness</Text>
          <Text style={[styles.score, { color: theme.ink }]}>{summary.happiness}</Text>
        </View>
      </View>
      <Text style={[styles.ending, { color: theme.deep }]}>{summary.endingTitle}</Text>
      <Text style={[styles.summary, { color: theme.ink }]}>{summary.endingSummary}</Text>
      <View style={styles.stats}>
        <StatPips stats={summary.stats} ink={theme.ink} showNumbers />
      </View>
      {summary.moments.length > 0 ? (
        <View style={styles.moments}>
          <Text style={[styles.momentsTitle, { color: theme.deep }]}>KEY MOMENTS</Text>
          {summary.moments.map((moment) => (
            <Text key={moment} style={[styles.moment, { color: theme.ink }]}>
              · {moment}
            </Text>
          ))}
        </View>
      ) : null}
      <Text style={[styles.tagline, { color: theme.deep }]}>Live a thousand lives you'd never get to try.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 3, borderRadius: 28, overflow: 'hidden' },
  banner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  brand: { color: '#FFFDF8', fontFamily: fonts.display, fontSize: 18, letterSpacing: 0.5 },
  bannerCareer: { color: '#FFFDF8', fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.2 },
  hero: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8 },
  heroCopy: { flex: 1, paddingRight: 12 },
  name: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  meta: { fontFamily: fonts.bodyBold, fontSize: 13 },
  scoreLabel: { fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 6, letterSpacing: 0.6 },
  score: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44 },
  ending: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, paddingHorizontal: 16, marginTop: 4 },
  summary: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, paddingHorizontal: 16, marginTop: 6 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 14 },
  stat: { width: '30%', minWidth: 90 },
  statValue: { fontFamily: fonts.display, fontSize: 22 },
  statLabel: { fontFamily: fonts.body, fontSize: 12 },
  moments: { paddingHorizontal: 16, marginTop: 14, gap: 4 },
  momentsTitle: { fontFamily: fonts.bodyBold, letterSpacing: 1.1, fontSize: 12 },
  moment: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19 },
  tagline: { fontFamily: fonts.bodyBold, fontSize: 13, padding: 16, paddingTop: 12 },
});
