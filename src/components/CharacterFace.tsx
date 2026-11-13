import { Circle, Ellipse, Path, Svg } from 'react-native-svg';
import type { CharacterLook, Expression } from '@/engine/types';

type Props = {
  look: CharacterLook;
  expression: Expression;
  shirt: string;
  ink?: string;
  size?: number;
};

export function CharacterFace({ look, expression, shirt, ink = '#241433', size = 150 }: Props) {
  return (
    <Svg width={size} height={size * 1.08} viewBox="0 0 200 216" accessibilityRole="image" accessibilityLabel={`${look.name} looking ${expression}`}>
      <Ellipse cx="100" cy="196" rx="78" ry="28" fill={shirt} stroke={ink} strokeWidth="4" />
      <Path d="M78 150 L78 176 Q100 188 122 176 L122 150" fill={look.skin} stroke={ink} strokeWidth="4" />
      {look.style === 'bob' ? (
        <Path
          d="M42 118 Q36 52 100 40 Q164 52 158 118 L158 156 Q158 176 138 176 L124 132 Q100 142 76 132 L62 176 Q42 176 42 156 Z"
          fill={look.hair}
          stroke={ink}
          strokeWidth="4"
        />
      ) : null}
      {look.style === 'bun' ? (
        <Path d="M48 108 Q46 48 100 42 Q154 48 152 108 Q134 82 100 78 Q66 82 48 108" fill={look.hair} stroke={ink} strokeWidth="4" />
      ) : null}
      {look.style === 'crop' ? (
        <Path d="M52 104 Q50 50 100 46 Q150 50 148 104 Q132 80 100 78 Q68 80 52 104" fill={look.hair} stroke={ink} strokeWidth="4" />
      ) : null}
      <Circle cx="48" cy="116" r="12" fill={look.skin} stroke={ink} strokeWidth="4" />
      <Circle cx="152" cy="116" r="12" fill={look.skin} stroke={ink} strokeWidth="4" />
      <Circle cx="100" cy="112" r="58" fill={look.skin} stroke={ink} strokeWidth="4" />
      <Bangs look={look} ink={ink} />
      {look.style === 'bun' ? <Circle cx="100" cy="40" r="20" fill={look.hair} stroke={ink} strokeWidth="4" /> : null}
      <Brows expression={expression} ink={ink} />
      <Eyes expression={expression} ink={ink} />
      <Mouth expression={expression} lip={look.lip} ink={ink} />
      {(expression === 'happy' || expression === 'proud' || expression === 'hopeful') && (
        <>
          <Ellipse cx="62" cy="132" rx="10" ry="6" fill={look.blush} opacity="0.85" />
          <Ellipse cx="138" cy="132" rx="10" ry="6" fill={look.blush} opacity="0.85" />
        </>
      )}
      {(expression === 'stressed' || expression === 'tired') && (
        <Path d="M146 78 Q154 96 140 100" stroke="#7EC8E3" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {(expression === 'sad' || expression === 'hurt') && (
        <Path d="M128 124 Q132 140 124 148" stroke="#7EB6E6" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {expression === 'hurt' && (
        <Path d="M52 128 H78 M60 120 V136 M70 120 V136" stroke="#F4F7FB" strokeWidth="5" strokeLinecap="round" />
      )}
      {(expression === 'proud' || expression === 'hopeful') && (
        <Path d="M156 64 L160 74 L170 78 L160 82 L156 92 L152 82 L142 78 L152 74 Z" fill="#FFC43D" stroke={ink} strokeWidth="2" />
      )}
      {look.style === 'crop' && (expression === 'stressed' || expression === 'hurt' || expression === 'tired') ? (
        <>
          <Circle cx="70" cy="140" r="3" fill="#3A2A24" opacity="0.45" />
          <Circle cx="132" cy="146" r="2.5" fill="#3A2A24" opacity="0.4" />
        </>
      ) : null}
      {look.glasses ? (
        <>
          <Circle cx="76" cy="112" r="18" fill="none" stroke={ink} strokeWidth="4" />
          <Circle cx="124" cy="112" r="18" fill="none" stroke={ink} strokeWidth="4" />
          <Path d="M94 112 H106" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : null}
    </Svg>
  );
}

function Bangs({ look, ink }: { look: CharacterLook; ink: string }) {
  if (look.style === 'crop') {
    return <Path d="M58 96 Q78 78 100 86 Q122 78 142 96 Q124 90 100 94 Q76 90 58 96" fill={look.hair} />;
  }
  if (look.style === 'bob') {
    return <Path d="M52 100 Q70 72 100 80 Q130 72 148 100 Q126 88 100 94 Q74 88 52 100" fill={look.hair} />;
  }
  return <Path d="M56 98 Q78 74 100 84 Q122 74 144 98 Q122 90 100 96 Q78 90 56 98" fill={look.hair} />;
}

function Brows({ expression, ink }: { expression: Expression; ink: string }) {
  const raised = expression === 'happy' || expression === 'hopeful' || expression === 'proud';
  const sad = expression === 'sad' || expression === 'hurt';
  const angry = expression === 'angry' || expression === 'stressed' || expression === 'determined';
  const left = raised
    ? 'M58 90 Q74 80 90 88'
    : sad
      ? 'M58 84 Q74 96 90 90'
      : angry
        ? 'M58 94 L90 84'
        : 'M58 90 Q74 86 90 90';
  const right = raised
    ? 'M110 88 Q126 80 142 90'
    : sad
      ? 'M110 90 Q126 96 142 84'
      : angry
        ? 'M110 84 L142 94'
        : 'M110 90 Q126 86 142 90';
  return (
    <>
      <Path d={left} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
      <Path d={right} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  );
}

function Eyes({ expression, ink }: { expression: Expression; ink: string }) {
  if (expression === 'happy' || expression === 'proud') {
    return (
      <>
        <Path d="M62 112 Q76 100 90 112" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M110 112 Q124 100 138 112" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    );
  }
  const wide = expression === 'stressed' || expression === 'angry' || expression === 'hopeful';
  const radius = wide ? 11 : 9;
  const pupil = expression === 'tired' ? 3 : 4.5;
  const y = expression === 'tired' ? 116 : 112;
  return (
    <>
      <Circle cx="76" cy={y} r={radius} fill="#fff" stroke={ink} strokeWidth="3.5" />
      <Circle cx="124" cy={y} r={radius} fill="#fff" stroke={ink} strokeWidth="3.5" />
      <Circle cx="78" cy={y + 1} r={pupil} fill={ink} />
      <Circle cx="126" cy={y + 1} r={pupil} fill={ink} />
      <Circle cx="74" cy={y - 2} r="1.6" fill="#fff" />
      <Circle cx="122" cy={y - 2} r="1.6" fill="#fff" />
      {expression === 'tired' ? (
        <Path d="M64 108 H90 M110 108 H136" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      ) : null}
    </>
  );
}

function Mouth({ expression, lip, ink }: { expression: Expression; lip: string; ink: string }) {
  const smile = 'M72 142 Q100 166 128 142';
  const soft = 'M78 146 Q100 158 122 146';
  const frown = 'M74 156 Q100 140 126 156';
  const flat = 'M80 148 H120';
  const smirk = 'M78 148 Q104 162 130 140';
  const open = 'M74 140 Q100 168 126 140 Q100 156 74 140';
  if (expression === 'happy' || expression === 'hopeful') {
    return <Path d={expression === 'hopeful' ? open : smile} fill={expression === 'hopeful' ? lip : 'none'} stroke={ink} strokeWidth="4" strokeLinecap="round" />;
  }
  if (expression === 'proud') return <Path d={smirk} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (expression === 'sad' || expression === 'hurt') return <Path d={frown} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (expression === 'angry') return <Path d="M76 150 Q100 142 124 150" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (expression === 'stressed' || expression === 'tired') return <Path d={flat} stroke={ink} strokeWidth="4" strokeLinecap="round" />;
  if (expression === 'determined') return <Path d={soft} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />;
  return <Path d={soft} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />;
}
