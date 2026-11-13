import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AMBIENT, mayaDay, type RealChoice, type RealScene } from '@/content/realday/maya';
import { applyMoment, atmosphere, createDay, endLine, thoughtFor, type DayState } from '@/realday/day';

type Phase = 'live' | 'end' | 'tomorrow';

export function RealDayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [day, setDay] = useState<DayState>(() => createDay());
  const [phase, setPhase] = useState<Phase>('live');
  const [holding, setHolding] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const busy = useRef(false);
  const scene = mayaDay.scenes[index];
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const look = atmosphere(day);
  const thought = thoughtFor(scene.thought, scene.alts, day.flags);
  const fade = useRef(new Animated.Value(1)).current;
  const zoom = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const underlay = useRef(scene.image);
  const player = useAudioPlayer(AMBIENT[scene.audio]);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  }, []);

  useEffect(() => {
    player.loop = true;
    player.replace(AMBIENT[scene.audio]);
    player.play();
  }, [player, scene.audio]);

  useEffect(() => {
    fade.setValue(0);
    zoom.setValue(1);
    drift.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    Animated.parallel([
      Animated.timing(zoom, { toValue: 1.08, duration: 16000, useNativeDriver: true }),
      Animated.timing(drift, { toValue: -16, duration: 16000, useNativeDriver: true }),
    ]).start();
    if (scene.id === 'twinge' && Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [scene.id, drift, fade, zoom]);

  useEffect(() => {
    if (!look.shake) {
      shake.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, { toValue: 3, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -3, duration: 70, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [look.shake, shake]);

  function goNext(effects?: RealChoice['effects'], flags?: string[]) {
    if (busy.current) return;
    busy.current = true;
    underlay.current = scene.image;
    const next = applyMoment(day, scene.id, effects, flags);
    setDay(next);
    if (index >= mayaDay.scenes.length - 1) {
      setPhase('end');
      busy.current = false;
      return;
    }
    setIndex(index + 1);
    setHolding(0);
    setTimeout(() => {
      busy.current = false;
    }, 400);
  }

  function startHold() {
    if (scene.interaction.type !== 'hold' || holdTimer.current) return;
    const started = Date.now();
    holdTimer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / 2200);
      setHolding(p);
      if (p >= 1 && holdTimer.current) {
        clearInterval(holdTimer.current);
        holdTimer.current = null;
        if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const action = scene.interaction;
        if (action.type === 'hold') goNext(action.effects, action.flags);
      }
    }, 40);
  }

  function cancelHold() {
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
    setHolding(0);
  }

  const goRef = useRef(goNext);
  goRef.current = goNext;
  const origin = useRef<{ x: number; y: number } | null>(null);

  function finishSwipe(dx: number) {
    const current = sceneRef.current;
    if (current.interaction.type !== 'swipe' || Math.abs(dx) < 28) return;
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
    goRef.current(current.interaction.effects, current.interaction.flags);
  }

  if (phase === 'tomorrow') {
    return (
      <View style={[styles.end, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.endKicker}>TOMORROW</Text>
        <Text style={styles.endTitle}>Not filmed yet.</Text>
        <Pressable onPress={() => router.replace('/')} style={styles.wake}>
          <Text style={styles.wakeText}>Back home</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'end') {
    const shots = mayaDay.scenes.filter((item) => day.seen.includes(item.id));
    return (
      <View style={[styles.end, { paddingTop: insets.top + 28 }]}>
        <Text style={styles.endKicker}>DAY 1</Text>
        <Text style={styles.endTitle}>Day 1 of Maya’s life</Text>
        <Text style={styles.endLine}>{endLine(day)}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.snaps}>
          {shots.map((item) => (
            <Image key={item.id} source={item.image} style={styles.snap} />
          ))}
        </ScrollView>
        <Pressable onPress={() => setPhase('tomorrow')} style={styles.wake}>
          <Text style={styles.wakeText}>Wake up tomorrow</Text>
        </Pressable>
      </View>
    );
  }

  const photos = scene.interaction.type === 'photos' ? scene.interaction.choices : null;

  return (
    <View
      style={styles.screen}
      onPointerDown={(event) => {
        origin.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
      }}
      onPointerUp={(event) => {
        if (!origin.current) return;
        const dx = event.nativeEvent.pageX - origin.current.x;
        origin.current = null;
        finishSwipe(dx);
      }}
    >
      <Animated.Image source={underlay.current} style={[styles.photo, { transform: [{ scale: 1.04 }] }]} />
      <Animated.Image
        source={scene.image}
        style={[
          styles.photo,
          { opacity: fade, transform: [{ scale: zoom }, { translateX: Animated.add(drift, shake) }] },
        ]}
      />
      <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent']} style={styles.topShade} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.72)']} style={styles.bottomShade} />
      <View pointerEvents="none" style={[styles.vignette, { opacity: look.vignette }]} />
      {look.warm > 0 ? <View pointerEvents="none" style={[styles.warm, { opacity: look.warm }]} /> : null}
      <View style={[styles.meta, { top: insets.top + 12 }]}>
        <Text style={styles.time}>{scene.time}</Text>
        <Text style={styles.place}>{scene.place}</Text>
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 18 }]}>
        <Text style={styles.thought}>{thought}</Text>
        {scene.interaction.type === 'swipe' ? (
          <Pressable onPress={() => finishSwipe(80)}>
            <Text style={styles.hint}>{scene.interaction.hint}</Text>
          </Pressable>
        ) : null}
        {scene.interaction.type === 'hold' ? (
          <Pressable onPressIn={startHold} onPressOut={cancelHold} style={styles.hold}>
            <View style={[styles.holdFill, { width: `${holding * 100}%` }]} />
            <Text style={styles.holdText}>{scene.interaction.hint}</Text>
          </Pressable>
        ) : null}
        {scene.interaction.type === 'tap' ? (
          <Pressable onPress={() => goNext(scene.interaction.type === 'tap' ? scene.interaction.effects : undefined, scene.interaction.type === 'tap' ? scene.interaction.flags : undefined)} style={styles.tap}>
            <Text style={styles.hint}>{scene.interaction.hint}</Text>
          </Pressable>
        ) : null}
        {photos ? (
          <View style={styles.choices}>
            {photos.map((choice) => (
              <Pressable key={choice.id} onPress={() => goNext(choice.effects, choice.flags)} style={styles.choice}>
                {choice.image ? <Image source={choice.image} style={styles.choicePhoto} /> : null}
                <Text style={styles.choiceLabel}>{choice.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {scene.interaction.type === 'words' ? (
          <View style={styles.words}>
            {scene.interaction.choices.map((choice) => (
              <Pressable key={choice.id} onPress={() => goNext(choice.effects, choice.flags)} style={styles.word}>
                <Text style={styles.wordText}>{choice.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 140 },
  bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 280 },
  vignette: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  warm: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#E8A15A' },
  meta: { position: 'absolute', left: 20, right: 20 },
  time: { color: '#fff', fontSize: 13, letterSpacing: 1.4 },
  place: { color: '#fff', fontSize: 16, marginTop: 2 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, gap: 14 },
  thought: { color: '#fff', fontSize: 28, lineHeight: 34 },
  hint: { color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center' },
  hold: { height: 54, borderRadius: 27, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', overflow: 'hidden', justifyContent: 'center' },
  holdFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.28)' },
  holdText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  tap: { paddingVertical: 8 },
  choices: { flexDirection: 'row', gap: 10 },
  choice: { flex: 1, height: 150, borderRadius: 14, overflow: 'hidden', justifyContent: 'flex-end' },
  choicePhoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  choiceLabel: { color: '#fff', fontSize: 16, padding: 10, backgroundColor: 'rgba(0,0,0,0.35)' },
  words: { flexDirection: 'row', gap: 10 },
  word: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.75)', borderRadius: 16, paddingVertical: 14 },
  wordText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  end: { flex: 1, backgroundColor: '#0C0A09', paddingHorizontal: 22 },
  endKicker: { color: '#A8A29E', letterSpacing: 2, fontSize: 12 },
  endTitle: { color: '#FAFAF9', fontSize: 36, lineHeight: 42, marginTop: 8 },
  endLine: { color: '#E7E5E4', fontSize: 20, marginTop: 16, marginBottom: 22 },
  snaps: { gap: 8, paddingRight: 20 },
  snap: { width: 92, height: 148, borderRadius: 8 },
  wake: { marginTop: 28, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#FAFAF9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  wakeText: { color: '#FAFAF9', fontSize: 16 },
});
