import { StyleSheet, View } from 'react-native';
import { CharacterFace } from '@/components/CharacterFace';
import type { CareerTheme, CharacterLook, Expression, SettingId, Stats } from '@/engine/types';
import { resolveHome } from '@/theme/life';
import { presence } from '@/theme/presence';

type Props = {
  look: CharacterLook;
  expression: Expression;
  theme: CareerTheme;
  setting?: SettingId;
  stats: Stats;
  flags: string[];
  careerId: string;
};

export function LifeSet({ look, expression, theme, setting = 'street', stats, flags, careerId }: Props) {
  const state = presence(stats, flags);
  const home = resolveHome(careerId, stats, flags);
  const friendOpacity = (slot: number) => Math.max(0, Math.min(1, state.friendStrength - slot));

  return (
    <View style={[styles.stage, backdrop(setting, theme)]}>
      <Decor setting={setting} theme={theme} />
      <View style={styles.home} accessibilityLabel={state.outfit === 'sharp' ? 'A nicer home' : state.outfit === 'worn' ? 'A worn home' : 'Home'}>
        <HomeMark tier={state.outfit} home={home} ink={theme.ink} />
      </View>
      <View style={[styles.hero, state.limp && styles.limp]}>
        <View style={[styles.friendBeside, { opacity: friendOpacity(0) }]}>
          <MiniFriend skin="#F3C1A5" shirt={theme.secondary} ink={theme.ink} />
        </View>
        <CharacterFace
          look={look}
          expression={expression}
          shirt={state.outfit === 'worn' ? '#8d6a62' : theme.primary}
          ink={theme.ink}
          size={168}
          tired={state.tired}
          limp={state.limp}
          outfit={state.outfit}
        />
        <View style={[styles.friendBeside, { opacity: friendOpacity(1) }]}>
          <MiniFriend skin="#C68642" shirt={theme.primary} ink={theme.ink} />
        </View>
      </View>
    </View>
  );
}

function backdrop(setting: SettingId, theme: CareerTheme) {
  switch (setting) {
    case 'stage':
      return { backgroundColor: '#2A1038' };
    case 'fire':
      return { backgroundColor: '#4A1A12' };
    case 'station':
      return { backgroundColor: '#3A2A28' };
    case 'classroom':
      return { backgroundColor: '#E7F6EE' };
    case 'studio':
      return { backgroundColor: '#FFE4F1' };
    case 'apartment':
      return { backgroundColor: '#F6E7D8' };
    case 'hallway':
      return { backgroundColor: '#E7EEF8' };
    default:
      return { backgroundColor: theme.paper };
  }
}

function Decor({ setting, theme }: { setting: SettingId; theme: CareerTheme }) {
  if (setting === 'studio' || setting === 'stage') {
    return (
      <>
        <View style={[styles.floor, { backgroundColor: setting === 'stage' ? '#6B1240' : '#E7B7CF' }]} />
        <View style={[styles.barre, { backgroundColor: theme.ink }]} />
        {setting === 'stage' ? <View style={styles.spot} /> : null}
      </>
    );
  }
  if (setting === 'classroom' || setting === 'hallway') {
    return (
      <>
        <View style={[styles.board, { backgroundColor: '#14785C', borderColor: theme.ink }]} />
        <View style={styles.desks}>
          <View style={[styles.desk, { borderColor: theme.ink }]} />
          <View style={[styles.desk, { borderColor: theme.ink }]} />
          <View style={[styles.desk, { borderColor: theme.ink }]} />
        </View>
      </>
    );
  }
  if (setting === 'fire') {
    return (
      <>
        <View style={[styles.flame, { left: 24, backgroundColor: '#FF8A00' }]} />
        <View style={[styles.flame, { right: 36, backgroundColor: '#E23B2F', height: 70 }]} />
        <View style={[styles.flame, { left: 120, bottom: 20, backgroundColor: '#FFC43D', height: 40 }]} />
      </>
    );
  }
  if (setting === 'station') {
    return <View style={[styles.truck, { backgroundColor: '#E23B2F', borderColor: theme.ink }]} />;
  }
  return <View style={[styles.window, { borderColor: theme.ink, backgroundColor: '#C9E7FF' }]} />;
}

function HomeMark({ tier, home, ink }: { tier: 'worn' | 'plain' | 'sharp'; home: string; ink: string }) {
  const roof = home === 'house' ? '#7DBF6A' : home === 'bunk' ? '#E23B2F' : home === 'shared' ? '#8d6a62' : tier === 'sharp' ? '#FFC43D' : ink;
  return (
    <View style={styles.houseWrap}>
      <View style={[styles.roof, { borderBottomColor: roof }]} />
      <View style={[styles.house, { backgroundColor: home === 'house' ? '#fff' : '#F3E6D8', borderColor: ink, width: home === 'house' ? 34 : 26 }]}>
        <View style={[styles.houseDoor, { backgroundColor: home === 'shared' || tier === 'worn' ? '#5c4038' : '#E23B2F' }]} />
      </View>
      {home === 'house' ? <View style={styles.flower} /> : null}
    </View>
  );
}

function MiniFriend({ skin, shirt, ink }: { skin: string; shirt: string; ink: string }) {
  return (
    <View style={styles.mini}>
      <View style={[styles.miniHead, { backgroundColor: skin, borderColor: ink }]} />
      <View style={[styles.miniBody, { backgroundColor: shirt, borderColor: ink }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, borderRadius: 28, overflow: 'hidden', minHeight: 230, justifyContent: 'center' },
  floor: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 54 },
  barre: { position: 'absolute', left: 16, right: 16, bottom: 78, height: 6, borderRadius: 3 },
  spot: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFC43D55',
  },
  board: { position: 'absolute', top: 16, left: 18, width: 90, height: 58, borderWidth: 3, borderRadius: 6 },
  desks: { position: 'absolute', bottom: 18, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  desk: { width: 54, height: 16, borderWidth: 3, borderRadius: 4, backgroundColor: '#fff' },
  flame: { position: 'absolute', bottom: 30, width: 28, height: 56, borderRadius: 20 },
  truck: { position: 'absolute', left: 16, bottom: 24, width: 120, height: 48, borderWidth: 3, borderRadius: 8 },
  window: { position: 'absolute', top: 18, right: 18, width: 54, height: 64, borderWidth: 3, borderRadius: 6 },
  home: { position: 'absolute', top: 12, left: 12 },
  houseWrap: { width: 36, alignItems: 'center' },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  house: { width: 26, height: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'flex-end' },
  houseDoor: { width: 8, height: 10 },
  flower: { position: 'absolute', right: -2, bottom: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF2D78' },
  hero: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 24 },
  friendBeside: { marginTop: 48 },
  mini: { alignItems: 'center' },
  miniHead: { width: 28, height: 28, borderRadius: 14, borderWidth: 2 },
  miniBody: { width: 34, height: 16, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 2, marginTop: -4 },
  limp: { transform: [{ translateX: 8 }, { rotate: '-6deg' }] },
});
