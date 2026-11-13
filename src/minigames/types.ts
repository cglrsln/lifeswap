export type GameBand = 'success' | 'partial' | 'fail';

export type GameProps = {
  ink: string;
  primary: string;
  secondary: string;
  onDone: (band: GameBand) => void;
};
