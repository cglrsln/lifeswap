import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CareerTheme, LifeStage } from '@/engine/types';
import { STAGE_LABEL, fonts } from '@/theme/game';

type Props = {
  fromAge: number;
  toAge: number;
  toStage: LifeStage;
  theme: CareerTheme;
  onDone: () => void;
};

export function Montage({ fromAge, toAge, toStage, theme, onDone }: Props) {
  const [age, setAge] = useState(fromAge);
  const [flash, setFlash] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const started = Date.now();
    let fired = false;
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / 3000);
      setAge(Math.round(fromAge + (toAge - fromAge) * t));
      setFlash(Math.floor(t * 3));
      if (t >= 1 && !fired) {
        fired = true;
        clearInterval(timer);
        done.current();
      }
    }, 80);
    return () => clearInterval(timer);
  }, [fromAge, toAge]);

  const colors = [theme.primary, theme.secondary, theme.deep];

  return (
    <View style={[styles.wrap, { backgroundColor: colors[flash % colors.length] }]}>
      <Text style={[styles.kicker, { fontFamily: fonts.bodyBold }]}>YEARS LATER</Text>
      <Text style={[styles.age, { fontFamily: fonts.display }]}>{age}</Text>
      <Text style={[styles.stage, { fontFamily: fonts.display }]}>{STAGE_LABEL[toStage]}</Text>
      <View style={styles.walk}>
        <View style={[styles.dot, { marginLeft: flash * 28 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 280 },
  kicker: { color: '#FFFDF8', letterSpacing: 2, fontSize: 13 },
  age: { color: '#FFFDF8', fontSize: 84, lineHeight: 90 },
  stage: { color: '#FFFDF8', fontSize: 28 },
  walk: { marginTop: 12, width: 120, height: 16 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFFDF8' },
});
