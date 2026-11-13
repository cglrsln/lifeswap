import type { ImageSourcePropType } from 'react-native';
import type { Moods } from '@/realday/day';

const alarm = require('../../../assets/realday/maya-alarm.jpg') as ImageSourcePropType;
const mirror = require('../../../assets/realday/maya-mirror.jpg') as ImageSourcePropType;
const kitchen = require('../../../assets/realday/maya-kitchen.jpg') as ImageSourcePropType;
const pastry = require('../../../assets/realday/maya-pastry.jpg') as ImageSourcePropType;
const bus = require('../../../assets/realday/maya-bus.jpg') as ImageSourcePropType;
const barre = require('../../../assets/realday/maya-barre.jpg') as ImageSourcePropType;
const feet = require('../../../assets/realday/maya-feet.jpg') as ImageSourcePropType;
const teacher = require('../../../assets/realday/maya-teacher.jpg') as ImageSourcePropType;
const lunch = require('../../../assets/realday/maya-lunch.jpg') as ImageSourcePropType;
const rehearsal = require('../../../assets/realday/maya-rehearsal.jpg') as ImageSourcePropType;
const pain = require('../../../assets/realday/maya-pain.jpg') as ImageSourcePropType;
const friend = require('../../../assets/realday/maya-friend.jpg') as ImageSourcePropType;
const ice = require('../../../assets/realday/maya-ice.jpg') as ImageSourcePropType;
const homework = require('../../../assets/realday/maya-homework.jpg') as ImageSourcePropType;
const mom = require('../../../assets/realday/maya-mom.jpg') as ImageSourcePropType;
const scroll = require('../../../assets/realday/maya-scroll.jpg') as ImageSourcePropType;
const dark = require('../../../assets/realday/maya-dark.jpg') as ImageSourcePropType;

export type Ambient = 'alarm' | 'room' | 'kitchen' | 'bus' | 'studio' | 'street' | 'night';

export const AMBIENT: Record<Ambient, number> = {
  alarm: require('../../../assets/realday/audio/alarm.wav') as number,
  room: require('../../../assets/realday/audio/room.wav') as number,
  kitchen: require('../../../assets/realday/audio/kitchen.wav') as number,
  bus: require('../../../assets/realday/audio/bus.wav') as number,
  studio: require('../../../assets/realday/audio/studio.wav') as number,
  street: require('../../../assets/realday/audio/street.wav') as number,
  night: require('../../../assets/realday/audio/night.wav') as number,
};

export type RealChoice = {
  id: string;
  label: string;
  image?: ImageSourcePropType;
  effects?: Partial<Moods>;
  flags?: string[];
};

export type RealScene = {
  id: string;
  time: string;
  place: string;
  thought: string;
  image: ImageSourcePropType;
  audio: Ambient;
  alts?: { flag: string; thought: string }[];
  interaction:
    | { type: 'swipe'; hint: string; effects?: Partial<Moods>; flags?: string[] }
    | { type: 'hold'; hint: string; effects?: Partial<Moods>; flags?: string[] }
    | { type: 'tap'; hint: string; effects?: Partial<Moods>; flags?: string[] }
    | { type: 'photos'; choices: RealChoice[] }
    | { type: 'words'; choices: RealChoice[] };
};

export const mayaDay = {
  name: 'Maya',
  age: 16,
  role: 'ballet student',
  scenes: [
    {
      id: 'alarm',
      time: '5:40',
      place: 'Shared bedroom',
      thought: 'Five forty. The other bed is still.',
      image: alarm,
      audio: 'alarm',
      interaction: { type: 'swipe', hint: 'Swipe the alarm away' },
    },
    {
      id: 'mirror',
      time: '5:48',
      place: 'Bathroom',
      thought: 'I look like I already danced.',
      image: mirror,
      audio: 'room',
      interaction: { type: 'hold', hint: 'Hold to stretch', effects: { pain: 6, energy: 4 }, flags: ['stretched'] },
    },
    {
      id: 'breakfast',
      time: '5:57',
      place: 'Kitchen',
      thought: 'Small, on purpose.',
      image: kitchen,
      audio: 'kitchen',
      interaction: {
        type: 'photos',
        choices: [
          { id: 'yogurt', label: 'The yogurt', image: kitchen, effects: { energy: -6, mood: -4 }, flags: ['ate_light'] },
          { id: 'pastry', label: 'The pastry', image: pastry, effects: { energy: 8, mood: 8 }, flags: ['ate_pastry'] },
        ],
      },
    },
    {
      id: 'bus',
      time: '6:20',
      place: 'The bus',
      thought: 'Everyone is going somewhere else.',
      image: bus,
      audio: 'bus',
      interaction: { type: 'tap', hint: 'Hold the rail' },
    },
    {
      id: 'barre',
      time: '6:45',
      place: 'Studio',
      thought: 'The barre is cold.',
      image: barre,
      audio: 'studio',
      interaction: { type: 'tap', hint: 'Take the barre' },
    },
    {
      id: 'feet',
      time: '7:10',
      place: 'Studio floor',
      thought: 'They already hurt.',
      image: feet,
      audio: 'studio',
      interaction: { type: 'hold', hint: 'Hold through the ache', effects: { pain: 14 }, flags: ['feet_raw'] },
    },
    {
      id: 'correction',
      time: '7:40',
      place: 'At the barre',
      thought: 'She moves my shoulder half an inch.',
      image: teacher,
      audio: 'studio',
      interaction: { type: 'tap', hint: 'Stay still', effects: { teacher: 6 } },
    },
    {
      id: 'lunch',
      time: '12:15',
      place: 'Hallway bench',
      thought: 'Rice again.',
      image: lunch,
      audio: 'studio',
      alts: [{ flag: 'ate_pastry', thought: 'Still sitting there.' }],
      interaction: { type: 'tap', hint: 'Eat what you packed', effects: { energy: 4 } },
    },
    {
      id: 'rehearsal',
      time: '1:05',
      place: 'Center',
      thought: 'The room smells like effort.',
      image: rehearsal,
      audio: 'studio',
      interaction: { type: 'tap', hint: 'Find your spot' },
    },
    {
      id: 'twinge',
      time: '2:20',
      place: 'The variation',
      thought: 'Something in the ankle says no.',
      image: pain,
      audio: 'studio',
      interaction: {
        type: 'photos',
        choices: [
          { id: 'push', label: 'Push through', image: pain, effects: { pain: 28, mood: -8, energy: -10 }, flags: ['pushed_through'] },
          { id: 'tell', label: 'Tell her', image: teacher, effects: { pain: 6, teacher: 22, mood: 6 }, flags: ['told_teacher'] },
        ],
      },
    },
    {
      id: 'friend',
      time: '3:10',
      place: 'The corner',
      thought: 'She saw the turn land.',
      image: friend,
      audio: 'studio',
      alts: [{ flag: 'pushed_through', thought: 'The turn landed. The ankle did not.' }],
      interaction: { type: 'tap', hint: 'Stay with her', effects: { mood: 10 } },
    },
    {
      id: 'ice',
      time: '6:40',
      place: 'Bedroom floor',
      thought: 'The ice finds the exact spot.',
      image: ice,
      audio: 'room',
      alts: [{ flag: 'pushed_through', thought: 'It hurts more now.' }],
      interaction: { type: 'hold', hint: 'Hold the ice there', effects: { pain: -8 } },
    },
    {
      id: 'homework',
      time: '8:05',
      place: 'The desk',
      thought: 'The worksheet does not care.',
      image: homework,
      audio: 'room',
      interaction: { type: 'tap', hint: 'Write one answer', effects: { energy: -6 } },
    },
    {
      id: 'mom',
      time: '9:30',
      place: 'Kitchen doorway',
      thought: 'She worked a double.',
      image: mom,
      audio: 'kitchen',
      interaction: {
        type: 'words',
        choices: [
          { id: 'sit', label: 'Sit with her', effects: { mom: 18, mood: 8 }, flags: ['sat_with_mom'] },
          { id: 'leave', label: 'Let her be', effects: { mom: -8, mood: -4 }, flags: ['left_mom'] },
        ],
      },
    },
    {
      id: 'scroll',
      time: '10:50',
      place: 'In bed',
      thought: 'Other people’s days.',
      image: scroll,
      audio: 'night',
      interaction: { type: 'swipe', hint: 'Put the phone down', effects: { energy: -4 } },
    },
    {
      id: 'lights',
      time: '11:15',
      place: 'The ceiling',
      thought: 'That’s the day.',
      image: dark,
      audio: 'night',
      interaction: { type: 'tap', hint: 'Lights out' },
    },
  ] satisfies RealScene[],
};

export type { RealScene as MayaScene };
