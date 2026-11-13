import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CharacterFace } from '@/components/CharacterFace';
import { ShadowCard } from '@/components/ShadowCard';
import { StatBars } from '@/components/StatBars';
import { getCareer } from '@/content';
import { choose, createRun, currentScene, statDelta, summarize } from '@/engine/engine';
import type { Choice, Expression, GameState, Scene, Stats } from '@/engine/types';
import { saveLastRun } from '@/storage/progress';
import { setLastRun } from '@/state/lastRun';
import { STAGE_LABEL, fonts } from '@/theme/game';

export function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const career = getCareer(String(id));
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [run, setRun] = useState<GameState | null>(() => (career ? createRun(career) : null));
  const [phase, setPhase] = useState<'scene' | 'result'>('scene');
  const [result, setResult] = useState<{ text: string; expression: Expression } | null>(null);
  const [deltas, setDeltas] = useState<Partial<Stats>>({});
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);

  useEffect(() => {
    if (Object.keys(deltas).length === 0) return;
    const timer = setTimeout(() => setDeltas({}), 1600);
    return () => clearTimeout(timer);
  }, [deltas]);

  if (!career || !run) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>This life isn’t available.</Text>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button">
          <Text style={styles.link}>Back to the gallery</Text>
        </Pressable>
      </View>
    );
  }

  const life = career;
  const state = run;
  const scene = currentScene(life, state);
  const theme = career.theme;

  function animateCard() {
    slide.setValue(36);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 7, tension: 80 }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }

  function finish(nextState: GameState) {
    const summary = summarize(life, nextState);
    setLastRun(summary);
    void saveLastRun(summary);
    router.replace('/recap');
  }

  function onChoice(sceneNow: Scene, choice: Choice) {
    if (busy.current) return;
    busy.current = true;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const next = choose(life, state, choice.id);
    setDeltas(statDelta(state.stats, next.stats));
    setRun(next);
    const upcoming = currentScene(life, next);
    if (choice.result) {
      setResult({ text: choice.result, expression: choice.expression ?? sceneNow.expression });
      setPhase('result');
      animateCard();
      setTimeout(() => {
        busy.current = false;
      }, 280);
      return;
    }
    if (next.finished || !upcoming) {
      finish(next);
      return;
    }
    setPhase('scene');
    animateCard();
    setTimeout(() => {
      busy.current = false;
    }, 280);
  }

  function onContinue() {
    if (busy.current) return;
    if (state.finished || !currentScene(life, state)) {
      finish(state);
      return;
    }
    setPhase('scene');
    setResult(null);
    animateCard();
  }

  const expression: Expression = phase === 'result' && result ? result.expression : (scene?.expression ?? 'neutral');
  const progress = Math.min(1, run.sceneLog.length / 18);

  return (
    <View style={[styles.screen, { backgroundColor: theme.paper }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
            <Text style={[styles.back, { color: theme.deep }]}>‹</Text>
          </Pressable>
          <View style={styles.topCopy}>
            <Text style={[styles.career, { color: theme.deep }]}>{career.name.toUpperCase()}</Text>
            <Text style={[styles.stage, { color: theme.ink }]}>
              {scene ? `${STAGE_LABEL[scene.stage]} · age ${scene.age}` : `Age ${run.age}`}
            </Text>
          </View>
        </View>
        <View style={[styles.progressTrack, { borderColor: theme.ink }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.faceWrap}>
          <CharacterFace look={career.character} expression={expression} shirt={theme.primary} ink={theme.ink} size={132} />
        </View>
        <StatBars stats={run.stats} deltas={deltas} ink={theme.ink} />
        <Animated.View style={{ transform: [{ translateY: slide }], opacity: fade }}>
          {phase === 'result' && result ? (
            <ShadowCard ink={theme.ink} background={theme.card}>
              <View style={[styles.ribbon, { backgroundColor: theme.secondary }]}>
                <Text style={[styles.ribbonText, { color: theme.ink }]}>WHAT HAPPENED</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.resultText, { color: theme.ink }]}>{result.text}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onContinue}
                  style={({ pressed }) => [styles.choice, { borderColor: theme.ink, backgroundColor: theme.primary }, pressed && styles.pressed]}
                >
                  <Text style={styles.choiceTextLight}>{run.finished ? 'See the ending' : 'Continue'}</Text>
                </Pressable>
              </View>
            </ShadowCard>
          ) : scene ? (
            <ShadowCard ink={theme.ink} background={theme.card}>
              {scene.kind === 'fact' ? (
                <View style={[styles.ribbon, { backgroundColor: theme.secondary }]}>
                  <Text style={[styles.ribbonText, { color: theme.ink }]}>REAL FACT</Text>
                </View>
              ) : (
                <View style={[styles.ribbon, { backgroundColor: theme.primary }]}>
                  <Text style={styles.ribbonTextLight}>{STAGE_LABEL[scene.stage].toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={[styles.title, { color: theme.ink }]}>{scene.title}</Text>
                <Text style={[styles.body, { color: theme.ink }]}>{scene.body}</Text>
                {scene.kind === 'fact' && scene.source ? (
                  <Text style={[styles.source, { color: theme.deep }]}>{scene.source}</Text>
                ) : null}
                <View style={styles.choices}>
                  {scene.choices.map((choice) => (
                    <Pressable
                      key={choice.id}
                      accessibilityRole="button"
                      onPress={() => onChoice(scene, choice)}
                      style={({ pressed }) => [
                        styles.choice,
                        {
                          borderColor: theme.ink,
                          backgroundColor: scene.kind === 'fact' ? theme.primary : '#FFFDF8',
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.choiceText, { color: scene.kind === 'fact' ? '#FFFDF8' : theme.ink }]}>
                        {choice.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ShadowCard>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => finish(run)} style={styles.choice}>
              <Text style={styles.choiceText}>See the ending</Text>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFF6EE' },
  missingText: { fontFamily: fonts.displaySoft, fontSize: 22, color: '#241433' },
  link: { fontFamily: fonts.bodyBold, color: '#6B1240', fontSize: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { fontFamily: fonts.display, fontSize: 34, lineHeight: 36, width: 28 },
  topCopy: { flex: 1 },
  career: { fontFamily: fonts.bodyBold, letterSpacing: 1.4, fontSize: 12 },
  stage: { fontFamily: fonts.displaySoft, fontSize: 20 },
  progressTrack: { height: 10, borderRadius: 99, borderWidth: 2, backgroundColor: '#fff', overflow: 'hidden' },
  progressFill: { height: '100%' },
  faceWrap: { alignItems: 'center' },
  ribbon: { paddingVertical: 8, paddingHorizontal: 16 },
  ribbonText: { fontFamily: fonts.bodyBold, letterSpacing: 1.2, fontSize: 12 },
  ribbonTextLight: { fontFamily: fonts.bodyBold, letterSpacing: 1.2, fontSize: 12, color: '#FFFDF8' },
  cardBody: { padding: 16, gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32 },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 24 },
  source: { fontFamily: fonts.bodyReg, fontSize: 13, lineHeight: 18 },
  resultText: { fontFamily: fonts.body, fontSize: 18, lineHeight: 26 },
  choices: { gap: 10, marginTop: 4 },
  choice: { borderWidth: 3, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14 },
  pressed: { transform: [{ translateY: 2 }] },
  choiceText: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 21 },
  choiceTextLight: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 21, color: '#FFFDF8', textAlign: 'center' },
});
