import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChoiceDeck } from '@/components/ChoiceDeck';
import { LifeSet } from '@/components/LifeSet';
import { Montage } from '@/components/Montage';
import { StatPips } from '@/components/StatPips';
import { getCareer } from '@/content';
import { choose, createRun, currentScene, statDelta, summarize } from '@/engine/engine';
import type { Choice, Expression, GameState, LifeStage, Scene, Stats } from '@/engine/types';
import { MiniGameHost } from '@/minigames/MiniGameHost';
import type { GameBand } from '@/minigames/types';
import { saveLastRun } from '@/storage/progress';
import { setLastRun } from '@/state/lastRun';
import { fonts } from '@/theme/game';

type Phase = 'scene' | 'fact' | 'game' | 'montage' | 'stamp';

export function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const career = getCareer(String(id));
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [run, setRun] = useState<GameState | null>(() => (career ? createRun(career) : null));
  const [phase, setPhase] = useState<Phase>('scene');
  const [stamp, setStamp] = useState<{ text: string; expression: Expression } | null>(null);
  const [deltas, setDeltas] = useState<Partial<Stats>>({});
  const [montage, setMontage] = useState<{ fromAge: number; toAge: number; stage: LifeStage } | null>(null);
  const busy = useRef(false);
  const lastStage = useRef<LifeStage | null>(null);
  const booted = useRef(false);

  const scene = career && run ? currentScene(career, run) : null;

  useEffect(() => {
    if (!scene || booted.current) return;
    booted.current = true;
    lastStage.current = scene.stage;
    setPhase(scene.miniGame ? 'game' : scene.kind === 'fact' ? 'fact' : 'scene');
  }, [scene]);

  useEffect(() => {
    if (Object.keys(deltas).length === 0) return;
    const timer = setTimeout(() => setDeltas({}), 1400);
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
  const theme = career.theme;

  function finish(nextState: GameState) {
    const summary = summarize(life, nextState);
    setLastRun(summary);
    void saveLastRun(summary);
    router.replace('/recap');
  }

  function showScene(nextScene: Scene, fromAge: number) {
    const stageChanged = lastStage.current !== null && lastStage.current !== nextScene.stage;
    lastStage.current = nextScene.stage;
    if (stageChanged) {
      setMontage({ fromAge, toAge: nextScene.age, stage: nextScene.stage });
      setPhase('montage');
      return;
    }
    setPhase(nextScene.miniGame ? 'game' : nextScene.kind === 'fact' ? 'fact' : 'scene');
  }

  function afterStamp(next: GameState) {
    const upcoming = currentScene(life, next);
    busy.current = false;
    if (next.finished || !upcoming) {
      finish(next);
      return;
    }
    showScene(upcoming, next.age);
  }

  function applyChoice(sceneNow: Scene, choice: Choice) {
    if (busy.current) return;
    busy.current = true;
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = choose(life, state, choice.id);
    setDeltas(statDelta(state.stats, next.stats));
    setRun(next);
    if (choice.result) {
      setStamp({ text: choice.result, expression: choice.expression ?? sceneNow.expression });
      setPhase('stamp');
      setTimeout(() => afterStamp(next), 900);
      return;
    }
    const upcoming = currentScene(life, next);
    busy.current = false;
    if (next.finished || !upcoming) {
      finish(next);
      return;
    }
    showScene(upcoming, next.age);
  }

  function onGame(sceneNow: Scene, band: GameBand) {
    const spec = sceneNow.miniGame;
    if (!spec) return;
    const choiceId = spec[band];
    const choice = sceneNow.choices.find((item) => item.id === choiceId) ?? sceneNow.choices[0];
    applyChoice(sceneNow, choice);
  }

  const expression: Expression = phase === 'stamp' && stamp ? stamp.expression : (scene?.expression ?? 'neutral');

  return (
    <View style={[styles.screen, { backgroundColor: theme.paper, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.back, { color: theme.deep }]}>‹</Text>
        </Pressable>
        <Text style={[styles.career, { color: theme.deep, fontFamily: fonts.bodyBold }]}>{career.name.toUpperCase()}</Text>
        <Text style={[styles.age, { color: theme.ink, fontFamily: fonts.display }]}>{scene?.age ?? run.age}</Text>
      </View>
      <StatPips stats={run.stats} deltas={deltas} ink={theme.ink} />
      {phase === 'game' && scene ? (
        <Text style={[styles.caption, { color: theme.ink, fontFamily: fonts.display }]}>{scene.body}</Text>
      ) : null}
      <View style={styles.stage}>
        {phase === 'montage' && montage ? (
          <Montage
            fromAge={montage.fromAge}
            toAge={montage.toAge}
            toStage={montage.stage}
            theme={theme}
            onDone={() => {
              if (!scene) return;
              setPhase(scene.miniGame ? 'game' : scene.kind === 'fact' ? 'fact' : 'scene');
            }}
          />
        ) : phase === 'game' && scene?.miniGame ? (
          <MiniGameHost
            key={scene.id}
            kind={scene.miniGame.kind}
            ink={theme.ink}
            primary={theme.primary}
            secondary={theme.secondary}
            onDone={(band) => onGame(scene, band)}
          />
        ) : (
          <LifeSet
            look={career.character}
            expression={expression}
            theme={theme}
            setting={scene?.setting}
            stats={run.stats}
            flags={run.flags}
          />
        )}
      </View>
      {phase === 'stamp' && stamp ? (
        <View style={[styles.stamp, { backgroundColor: theme.secondary, borderColor: theme.ink }]}>
          <Text style={[styles.stampText, { color: theme.ink, fontFamily: fonts.display }]}>{stamp.text}</Text>
        </View>
      ) : null}
      {phase === 'fact' && scene ? (
        <View style={styles.captionBlock}>
          <Text style={[styles.factKicker, { color: theme.deep, fontFamily: fonts.bodyBold }]}>REAL FACT</Text>
          <Text style={[styles.caption, { color: theme.ink, fontFamily: fonts.display }]}>{scene.body}</Text>
          <ChoiceDeck choices={scene.choices} ink={theme.ink} primary={theme.primary} onPick={(choice) => applyChoice(scene, choice)} />
        </View>
      ) : null}
      {phase === 'scene' && scene ? (
        <View style={styles.captionBlock}>
          <Text style={[styles.caption, { color: theme.ink, fontFamily: fonts.display }]}>{scene.body}</Text>
          <ChoiceDeck choices={scene.choices} ink={theme.ink} primary={theme.primary} onPick={(choice) => applyChoice(scene, choice)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 14, gap: 8 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFF6EE' },
  missingText: { fontFamily: fonts.display, fontSize: 22, color: '#241433' },
  link: { fontFamily: fonts.bodyBold, color: '#6B1240', fontSize: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { fontFamily: fonts.display, fontSize: 32, width: 28 },
  career: { flex: 1, letterSpacing: 1.3, fontSize: 13 },
  age: { fontSize: 28 },
  stage: { flex: 1 },
  captionBlock: { gap: 8 },
  caption: { fontSize: 26, lineHeight: 30, textAlign: 'center' },
  factKicker: { textAlign: 'center', letterSpacing: 1.4, fontSize: 12 },
  stamp: { borderWidth: 3, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 12 },
  stampText: { textAlign: 'center', fontSize: 26 },
});
