import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  ink: string;
  background?: string;
  style?: StyleProp<ViewStyle>;
};

export function ShadowCard({ children, ink, background = '#FFFFFF', style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.shadow, { backgroundColor: ink }]} />
      <View style={[styles.face, { backgroundColor: background, borderColor: ink }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginRight: 6, marginBottom: 6 },
  shadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  face: {
    borderWidth: 3,
    borderRadius: 28,
    overflow: 'hidden',
  },
});
