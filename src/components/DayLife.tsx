import { StyleSheet, Text, View } from 'react-native';
import { CharacterFace } from '@/components/CharacterFace';
import type { CareerTheme, CharacterLook, DayBeat, Expression, FoodId, HomeId } from '@/engine/types';
import { mealLabel } from '@/theme/life';
import { fonts } from '@/theme/game';
import type { Presence } from '@/theme/presence';

const BEATS: DayBeat[] = ['wake', 'meal', 'commute', 'work', 'evening', 'sleep'];

const BEAT_MARK: Record<DayBeat, string> = {
  wake: '☀',
  meal: '🍴',
  commute: '→',
  work: '★',
  evening: '⌂',
  sleep: '☾',
};

export function LivingAs({
  name,
  age,
  role,
  beat,
  ink,
}: {
  name: string;
  age: number;
  role?: string;
  beat?: DayBeat;
  ink: string;
}) {
  const lead =
    beat === 'wake'
      ? 'You wake up as'
      : beat === 'meal'
        ? 'You eat as'
        : beat === 'commute'
          ? 'You head out as'
          : beat === 'evening'
            ? 'You come home as'
            : beat === 'sleep'
              ? 'You lie down as'
              : 'You are';
  return (
    <View accessibilityLabel={`${lead} ${name}, ${age}. ${role ?? ''}`}>
      <Text style={[styles.lead, { color: ink, fontFamily: fonts.display }]}>
        {lead} {name}, {age}.
      </Text>
      {role ? <Text style={[styles.role, { color: ink, fontFamily: fonts.bodyBold }]}>{role}</Text> : null}
    </View>
  );
}

export function DayStrip({ beat, ink, primary }: { beat: DayBeat; ink: string; primary: string }) {
  return (
    <View style={styles.strip} accessibilityLabel={`Day beat ${beat}`}>
      {BEATS.map((item) => {
        const on = item === beat;
        return (
          <View key={item} style={[styles.pip, { borderColor: ink, backgroundColor: on ? primary : '#FFFDF8' }]}>
            <Text style={[styles.pipMark, { color: on ? '#FFFDF8' : ink }]}>{BEAT_MARK[item]}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function DayScene({
  beat,
  home,
  food,
  look,
  expression,
  theme,
  presence,
}: {
  beat: DayBeat;
  home: HomeId;
  food?: FoodId;
  look: CharacterLook;
  expression: Expression;
  theme: CareerTheme;
  presence: Presence;
}) {
  return (
    <View style={styles.scene}>
      {beat === 'meal' && food ? <Meal food={food} ink={theme.ink} primary={theme.primary} /> : null}
      {beat === 'commute' ? <Road ink={theme.ink} primary={theme.primary} /> : null}
      {beat !== 'meal' && beat !== 'commute' ? <HomeRoom home={home} ink={theme.ink} primary={theme.primary} /> : null}
      <View style={[styles.body, presence.limp && styles.limp]}>
        <CharacterFace
          look={look}
          expression={expression}
          shirt={presence.outfit === 'worn' ? '#8d6a62' : theme.primary}
          ink={theme.ink}
          size={112}
          tired={presence.tired}
          limp={presence.limp}
          outfit={presence.outfit}
        />
      </View>
    </View>
  );
}

export function HomeRoom({ home, ink, primary }: { home: HomeId; ink: string; primary: string }) {
  const wall = home === 'bunk' ? '#6A1B14' : home === 'house' ? '#E7F4EA' : home === 'family' ? '#F8E7C9' : home === 'flat' ? '#F3E4F6' : '#E7D3C4';
  return (
    <View style={[styles.room, { backgroundColor: wall, borderColor: ink }]}>
      <View style={[styles.window, { borderColor: ink, width: home === 'house' ? 70 : 36 }]} />
      {home === 'house' ? <View style={styles.lawn} /> : null}
      {home === 'shared' ? (
        <>
          <View style={[styles.bunk, { borderColor: ink, top: 36 }]} />
          <View style={[styles.bunk, { borderColor: ink, top: 70 }]} />
          <View style={[styles.box, { borderColor: ink }]} />
        </>
      ) : null}
      {home === 'family' ? (
        <>
          <View style={[styles.table, { borderColor: ink }]} />
          <View style={[styles.mug, { backgroundColor: primary, left: 70 }]} />
          <View style={[styles.mug, { backgroundColor: '#fff', left: 96, borderColor: ink, borderWidth: 2 }]} />
        </>
      ) : null}
      {home === 'flat' ? <View style={[styles.bed, { borderColor: ink, backgroundColor: primary }]} /> : null}
      {home === 'house' ? <View style={[styles.door, { backgroundColor: primary, borderColor: ink }]} /> : null}
      {home === 'bunk' ? (
        <>
          <View style={[styles.locker, { borderColor: ink }]} />
          <View style={styles.boots} />
        </>
      ) : null}
    </View>
  );
}

function Meal({ food, ink, primary }: { food: FoodId; ink: string; primary: string }) {
  return (
    <View style={styles.meal}>
      <View style={[styles.plate, { borderColor: ink }]}>
        <View style={[styles.food, foodStyle(food, primary)]} />
      </View>
      <Text style={[styles.foodName, { color: ink, fontFamily: fonts.display }]}>{mealLabel(food)}</Text>
    </View>
  );
}

function foodStyle(food: FoodId, primary: string) {
  if (food === 'salad') return { backgroundColor: '#3D9B4A', borderRadius: 20 };
  if (food === 'chili' || food === 'noodles') return { backgroundColor: '#C4512A', borderRadius: 8 };
  if (food === 'cereal' || food === 'rice' || food === 'toast') return { backgroundColor: '#E6C27A', borderRadius: 6 };
  if (food === 'coffee') return { backgroundColor: '#6B3A2A', borderRadius: 4, height: 28 };
  if (food === 'banana') return { backgroundColor: '#F2D04B', borderRadius: 12, width: 46 };
  if (food === 'eggs') return { backgroundColor: '#F4E38A', borderRadius: 16 };
  if (food === 'packed') return { backgroundColor: primary, borderRadius: 4, width: 54, height: 28 };
  if (food === 'bar') return { backgroundColor: '#C47A52', borderRadius: 4, width: 50, height: 16 };
  return { backgroundColor: '#E0A15A', borderRadius: 10 };
}

function Road({ ink, primary }: { ink: string; primary: string }) {
  return (
    <View style={[styles.roadWrap, { backgroundColor: '#C9E7FF' }]}>
      <View style={[styles.road, { backgroundColor: '#4A5560' }]}>
        <View style={styles.dash} />
      </View>
      <View style={[styles.bus, { backgroundColor: primary, borderColor: ink }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 22, lineHeight: 26, textAlign: 'center' },
  role: { fontSize: 14, textAlign: 'center', marginTop: 2 },
  strip: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 6 },
  pip: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pipMark: { fontSize: 13 },
  scene: { flex: 1, borderRadius: 28, overflow: 'hidden', minHeight: 220, justifyContent: 'flex-end' },
  room: { flex: 1, borderBottomWidth: 0, minHeight: 180 },
  window: { position: 'absolute', top: 16, right: 16, height: 48, backgroundColor: '#B9E2FF', borderWidth: 3, borderRadius: 4 },
  lawn: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 28, backgroundColor: '#7DBF6A' },
  bunk: { position: 'absolute', left: 16, width: 92, height: 22, borderWidth: 3, backgroundColor: '#fff', borderRadius: 4 },
  box: { position: 'absolute', left: 120, bottom: 24, width: 28, height: 22, borderWidth: 3, backgroundColor: '#C47A52' },
  table: { position: 'absolute', left: 48, bottom: 36, width: 90, height: 14, borderWidth: 3, backgroundColor: '#fff', borderRadius: 3 },
  mug: { position: 'absolute', bottom: 50, width: 14, height: 16, borderRadius: 3 },
  bed: { position: 'absolute', left: 24, bottom: 28, width: 84, height: 36, borderWidth: 3, borderRadius: 8 },
  door: { position: 'absolute', left: 28, bottom: 28, width: 36, height: 64, borderWidth: 3, borderRadius: 4 },
  locker: { position: 'absolute', left: 16, top: 28, width: 36, height: 72, borderWidth: 3, backgroundColor: '#888' },
  boots: { position: 'absolute', left: 64, bottom: 20, width: 28, height: 16, borderRadius: 4, backgroundColor: '#1C100E' },
  meal: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  plate: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, backgroundColor: '#FFFDF8', alignItems: 'center', justifyContent: 'center' },
  food: { width: 70, height: 36 },
  foodName: { fontSize: 22 },
  roadWrap: { flex: 1, justifyContent: 'flex-end' },
  road: { height: 70, justifyContent: 'center' },
  dash: { alignSelf: 'center', width: '70%', height: 4, backgroundColor: '#F4E38A' },
  bus: { position: 'absolute', left: 40, bottom: 48, width: 70, height: 36, borderWidth: 3, borderRadius: 6 },
  body: { alignItems: 'center', marginTop: -28 },
  limp: { transform: [{ rotate: '-6deg' }] },
});
