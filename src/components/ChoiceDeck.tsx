import { useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChoiceIcon } from '@/components/ChoiceIcon';
import type { Choice, ChoiceIcon as IconName } from '@/engine/types';
import { fonts } from '@/theme/game';

const FALLBACK: IconName[] = ['check', 'x', 'star', 'heart'];

type Props = {
  choices: Choice[];
  ink: string;
  primary: string;
  onPick: (choice: Choice) => void;
};

export function ChoiceDeck({ choices, ink, primary, onPick }: Props) {
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const choicesRef = useRef(choices);
  choicesRef.current = choices;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        const list = choicesRef.current;
        if (gesture.dx <= -70 && list[0]) pickRef.current(list[0]);
        if (gesture.dx >= 70 && list.length > 1) pickRef.current(list[list.length - 1]);
      },
    }),
  ).current;

  return (
    <View {...pan.panHandlers}>
      <Text style={[styles.hint, { color: ink, fontFamily: fonts.body }]}>Swipe, or tap</Text>
      <View style={styles.row}>
        {choices.map((choice, index) => (
          <Pressable
            key={choice.id}
            accessibilityRole="button"
            accessibilityLabel={choice.label}
            onPress={() => onPick(choice)}
            style={({ pressed }) => [styles.button, { borderColor: ink, backgroundColor: index === 1 && choices.length === 3 ? primary : '#FFFDF8' }, pressed && styles.pressed]}
          >
            <ChoiceIcon name={choice.icon ?? FALLBACK[index] ?? 'check'} color={index === 1 && choices.length === 3 ? '#FFFDF8' : primary} size={32} />
            <Text style={[styles.label, { color: index === 1 && choices.length === 3 ? '#FFFDF8' : ink, fontFamily: fonts.bodyBold }]}>
              {choice.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { textAlign: 'center', fontSize: 12, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  button: {
    flex: 1,
    maxWidth: 124,
    minHeight: 108,
    borderWidth: 3,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 10,
    gap: 6,
  },
  pressed: { transform: [{ translateY: 2 }] },
  label: { textAlign: 'center', fontSize: 14, lineHeight: 17 },
});
