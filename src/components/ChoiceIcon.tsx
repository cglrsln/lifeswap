import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';
import type { ChoiceIcon as IconName } from '@/engine/types';

export function ChoiceIcon({ name, color, size = 28 }: { name: IconName; color: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 32 32' };
  switch (name) {
    case 'check':
      return (
        <Svg {...common}>
          <Path d="M6 17 L13 24 L26 8" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        </Svg>
      );
    case 'x':
      return (
        <Svg {...common}>
          <Path d="M8 8 L24 24 M24 8 L8 24" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </Svg>
      );
    case 'heart':
      return (
        <Svg {...common}>
          <Path d="M16 27 C4 18 4 8 11 8 C14 8 16 11 16 11 C16 11 18 8 21 8 C28 8 28 18 16 27 Z" fill={color} />
        </Svg>
      );
    case 'star':
      return (
        <Svg {...common}>
          <Path d="M16 4 L19 12 L28 12 L21 18 L23 27 L16 22 L9 27 L11 18 L4 12 L13 12 Z" fill={color} />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...common}>
          <Path d="M16 3 L27 8 V16 C27 23 16 29 16 29 C16 29 5 23 5 16 V8 Z" fill={color} />
        </Svg>
      );
    case 'flame':
      return (
        <Svg {...common}>
          <Path d="M16 3 C18 10 26 12 26 20 C26 26 21 29 16 29 C11 29 6 26 6 20 C6 14 12 13 13 8 C14 12 16 12 16 3 Z" fill={color} />
        </Svg>
      );
    case 'book':
      return (
        <Svg {...common}>
          <Path d="M6 6 H16 V26 H6 Z M16 6 H26 V26 H16 Z" fill={color} />
        </Svg>
      );
    case 'users':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="11" r="4" fill={color} />
          <Circle cx="21" cy="12" r="3" fill={color} />
          <Path d="M4 26 C4 20 8 17 12 17 C16 17 20 20 20 26" fill={color} />
        </Svg>
      );
    case 'home':
      return (
        <Svg {...common}>
          <Path d="M4 15 L16 5 L28 15 V27 H4 Z" fill={color} />
        </Svg>
      );
    case 'coin':
      return (
        <Svg {...common}>
          <Circle cx="16" cy="16" r="11" fill={color} />
          <Path d="M16 9 V23 M12 12 H18 M12 20 H18" stroke="#fff" strokeWidth="2" />
        </Svg>
      );
    case 'bed':
      return (
        <Svg {...common}>
          <Path d="M4 20 V12 H14 C18 12 20 15 20 18 H28 V20" stroke={color} strokeWidth="3" fill="none" />
          <Circle cx="10" cy="16" r="2" fill={color} />
        </Svg>
      );
    case 'music':
      return (
        <Svg {...common}>
          <Path d="M12 26 V8 L26 5 V22" stroke={color} strokeWidth="3" fill="none" />
          <Circle cx="9" cy="26" r="3" fill={color} />
          <Circle cx="23" cy="22" r="3" fill={color} />
        </Svg>
      );
    case 'foot':
      return (
        <Svg {...common}>
          <Ellipse cx="16" cy="20" rx="7" ry="8" fill={color} />
          <Circle cx="10" cy="10" r="2" fill={color} />
          <Circle cx="16" cy="8" r="2" fill={color} />
          <Circle cx="22" cy="11" r="2" fill={color} />
        </Svg>
      );
    case 'megaphone':
      return (
        <Svg {...common}>
          <Path d="M6 13 H12 L24 6 V26 L12 19 H6 Z" fill={color} />
        </Svg>
      );
    case 'door':
      return (
        <Svg {...common}>
          <Rect x="8" y="4" width="16" height="24" rx="2" fill={color} />
          <Circle cx="20" cy="16" r="1.5" fill="#fff" />
        </Svg>
      );
    case 'apple':
      return (
        <Svg {...common}>
          <Circle cx="16" cy="18" r="8" fill={color} />
          <Path d="M16 10 C16 6 20 5 20 5" stroke={color} strokeWidth="2" fill="none" />
        </Svg>
      );
    case 'clock':
      return (
        <Svg {...common}>
          <Circle cx="16" cy="16" r="11" stroke={color} strokeWidth="3" fill="none" />
          <Path d="M16 9 V16 L21 19" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </Svg>
      );
    case 'hands':
      return (
        <Svg {...common}>
          <Path d="M8 18 L14 10 V20 L18 8 V22 L22 12 V24 H8 Z" fill={color} />
        </Svg>
      );
    case 'walk':
      return (
        <Svg {...common}>
          <Circle cx="18" cy="6" r="3" fill={color} />
          <Path d="M18 10 L14 18 L8 26 M14 18 L22 18 L26 26 M18 12 L24 16" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </Svg>
      );
    case 'crown':
      return (
        <Svg {...common}>
          <Path d="M4 24 L7 12 L16 18 L25 8 L28 24 Z" fill={color} />
        </Svg>
      );
    case 'teach':
      return (
        <Svg {...common}>
          <Rect x="4" y="6" width="24" height="16" rx="2" fill={color} />
          <Path d="M12 26 H20" stroke={color} strokeWidth="3" />
        </Svg>
      );
    case 'water':
      return (
        <Svg {...common}>
          <Path d="M16 4 C16 4 6 16 6 21 C6 26 10 29 16 29 C22 29 26 26 26 21 C26 16 16 4 16 4 Z" fill={color} />
        </Svg>
      );
    case 'alert':
      return (
        <Svg {...common}>
          <Path d="M16 4 L30 28 H2 Z" fill={color} />
          <Path d="M16 12 V20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </Svg>
      );
    default:
      return (
        <Svg {...common}>
          <Circle cx="16" cy="16" r="8" fill={color} />
        </Svg>
      );
  }
}
