import { BalanceGame } from '@/minigames/BalanceGame';
import { HoseGame } from '@/minigames/HoseGame';
import { MeltdownGame } from '@/minigames/MeltdownGame';
import { RescueGame } from '@/minigames/RescueGame';
import { RhythmGame } from '@/minigames/RhythmGame';
import { SeatingGame } from '@/minigames/SeatingGame';
import type { GameBand, GameProps } from '@/minigames/types';
import type { MiniGameKind } from '@/engine/types';

export function MiniGameHost({ kind, ...props }: GameProps & { kind: MiniGameKind }) {
  const onDone = (band: GameBand) => props.onDone(band);
  const game = { ...props, onDone };
  switch (kind) {
    case 'rhythm':
      return <RhythmGame {...game} />;
    case 'balance':
      return <BalanceGame {...game} />;
    case 'hose':
      return <HoseGame {...game} />;
    case 'rescue':
      return <RescueGame {...game} />;
    case 'seating':
      return <SeatingGame {...game} />;
    case 'meltdown':
      return <MeltdownGame {...game} />;
    default:
      return null;
  }
}
