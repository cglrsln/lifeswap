import type { Career, Choice, ChoiceIcon, DayBeat, FoodId, HomeId, LifeStage, Scene, Stats } from '@/engine/types';

const STAGES: LifeStage[] = ['training', 'first_job', 'mid_career', 'crisis', 'late_career'];

export const STAGE_ROLE: Record<string, Record<LifeStage, string>> = {
  dancer: {
    training: 'ballet student',
    first_job: 'trainee',
    mid_career: 'company dancer',
    crisis: 'dancer in trouble',
    late_career: 'veteran dancer',
  },
  teacher: {
    training: 'student teacher',
    first_job: 'new teacher',
    mid_career: 'classroom teacher',
    crisis: 'teacher under strain',
    late_career: 'long-time teacher',
  },
  firefighter: {
    training: 'recruit',
    first_job: 'probationary firefighter',
    mid_career: 'firefighter',
    crisis: 'firefighter hurting',
    late_career: 'veteran firefighter',
  },
};

type Bits = {
  id: string;
  label: string;
  icon: ChoiceIcon;
  effects?: Partial<Stats>;
  result: string;
  setFlags?: string[];
};

function pick(bits: Bits): Choice {
  return { ...bits, expression: 'neutral' };
}

function dayScene(
  careerId: string,
  stage: LifeStage,
  age: number,
  beat: DayBeat,
  title: string,
  body: string,
  choices: Choice[],
  extra: { food?: FoodId; home?: HomeId } = {},
): Scene {
  return {
    id: `${careerId}-${stage}-${beat}`,
    stage,
    age,
    title,
    body,
    expression: beat === 'sleep' ? 'tired' : beat === 'wake' ? 'neutral' : 'hopeful',
    setting: beat === 'commute' ? 'street' : 'apartment',
    beat,
    role: STAGE_ROLE[careerId][stage],
    food: extra.food,
    home: extra.home,
    choices,
  };
}

const soft = { happiness: 1 };
const kin = { relationships: 1 };

const DAYS: Record<string, Record<LifeStage, (age: number, closeAge: number) => Scene[]>> = {
  dancer: {
    training: (age, close) => [
      dayScene('dancer', 'training', age, 'wake', 'Wake', 'Shared mattress. Class at seven.', [
        pick({ id: 'stretch', label: 'Stretch', icon: 'check', effects: soft, result: 'You meet the day.' }),
        pick({ id: 'snooze', label: 'Snooze', icon: 'bed', effects: { happiness: 1, health: -1 }, result: 'Five more minutes.' }),
      ], { home: 'shared' }),
      dayScene('dancer', 'training', age, 'meal', 'Breakfast', 'Rice and a banana. That is it.', [
        pick({ id: 'eat', label: 'Eat it', icon: 'apple', effects: soft, result: 'You eat what you have.' }),
        pick({ id: 'skip', label: 'Skip it', icon: 'x', effects: { health: -2, happiness: -1 }, setFlags: ['ate_alone'], result: 'You leave it.' }),
      ], { food: 'rice' }),
      dayScene('dancer', 'training', age, 'commute', 'The buses', 'Two buses, or a long cold walk.', [
        pick({ id: 'bus', label: 'Take the bus', icon: 'clock', effects: { money: -1 }, result: 'You make the class.' }),
        pick({ id: 'walk', label: 'Walk', icon: 'walk', effects: { health: -1 }, result: 'Your feet start early.' }),
      ]),
      dayScene('dancer', 'training', close, 'evening', 'After class', 'Ice on your ankles. The room is empty.', [
        pick({ id: 'call', label: 'Call home', icon: 'heart', effects: kin, setFlags: ['called_home'], result: 'A voice that knows you.' }),
        pick({ id: 'ice', label: 'Ice your feet', icon: 'water', effects: { health: 1 }, result: 'The ache goes quiet.' }),
        pick({ id: 'out', label: 'Go out', icon: 'star', effects: { money: -3, happiness: 2 }, result: 'A small loud night.' }),
      ]),
      dayScene('dancer', 'training', close, 'sleep', 'Lights out', 'Bottom bunk. The mirror is dark.', [
        pick({ id: 'sleep', label: 'Lights out', icon: 'bed', effects: soft, result: 'You let the day end.' }),
      ]),
    ],
    first_job: (age, close) => [
      dayScene('dancer', 'first_job', age, 'wake', 'Wake', 'Rent is due. Your feet already ache.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'The day starts anyway.' }),
        pick({ id: 'stay', label: 'Stay down', icon: 'bed', effects: { happiness: -1 }, result: 'The bill is still there.' }),
      ]),
      dayScene('dancer', 'first_job', age, 'meal', 'Breakfast', 'Eggs, or noodles from the pot.', [
        pick({ id: 'eggs', label: 'Eat eggs', icon: 'apple', effects: soft, result: 'Plain. Enough.' }),
        pick({ id: 'noodles', label: 'Eat noodles', icon: 'coin', effects: { money: -1 }, result: 'Hot, and cheap.' }),
      ], { food: 'eggs' }),
      dayScene('dancer', 'first_job', age, 'commute', 'Before sun', 'The studio opens before the sun.', [
        pick({ id: 'walk', label: 'Walk over', icon: 'walk', effects: soft, result: 'The street is yours.' }),
        pick({ id: 'ride', label: 'Pay the fare', icon: 'coin', effects: { money: -2 }, result: 'You save your feet.' }),
      ]),
      dayScene('dancer', 'first_job', close, 'evening', 'The bill', 'A bill, a blister, a quiet room.', [
        pick({ id: 'call', label: 'Call someone', icon: 'heart', effects: kin, result: 'You are not only the job.' }),
        pick({ id: 'pay', label: 'Pay the bill', icon: 'coin', effects: { money: -4, happiness: 1 }, result: 'The counter is clear.' }),
        pick({ id: 'wait', label: 'Let it wait', icon: 'x', effects: { happiness: -2 }, setFlags: ['bills_late'], result: 'It waits with you.' }),
      ]),
      dayScene('dancer', 'first_job', close, 'sleep', 'Sleep', 'You lie down still in warmups.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'Tomorrow is already close.' }),
      ]),
    ],
    mid_career: (age, close) => [
      dayScene('dancer', 'mid_career', age, 'wake', 'Wake', 'Your name is known. The kitchen is yours.', [
        pick({ id: 'up', label: 'Make coffee', icon: 'check', effects: soft, result: 'A small owned morning.' }),
        pick({ id: 'rush', label: 'Rush out', icon: 'clock', effects: { happiness: -1 }, result: 'The kitchen stays dark.' }),
      ]),
      dayScene('dancer', 'mid_career', age, 'meal', 'Breakfast', 'A real breakfast, if you buy it.', [
        pick({ id: 'cook', label: 'Cook eggs', icon: 'apple', effects: soft, result: 'You feed yourself.' }),
        pick({ id: 'cafe', label: 'Buy it', icon: 'coin', effects: { money: -3, happiness: 1 }, result: 'Someone else plates it.' }),
      ], { food: 'eggs' }),
      dayScene('dancer', 'mid_career', age, 'commute', 'The route', 'You know this route by heart.', [
        pick({ id: 'walk', label: 'Walk it', icon: 'walk', effects: soft, result: 'The city is familiar.' }),
        pick({ id: 'ride', label: 'Ride', icon: 'clock', effects: { money: -2 }, result: 'You arrive unspent.' }),
      ]),
      dayScene('dancer', 'mid_career', close, 'evening', 'After', 'Pride first. Then the quiet.', [
        pick({ id: 'rest', label: 'Stay in', icon: 'home', effects: kin, result: 'Quiet can be a joy.' }),
        pick({ id: 'out', label: 'Go celebrate', icon: 'star', effects: { money: -4, happiness: 2 }, result: 'You let it be fun.' }),
      ]),
      dayScene('dancer', 'mid_career', close, 'sleep', 'Sleep', 'One room. The good kind of quiet.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'You keep the quiet.' }),
      ]),
    ],
    crisis: (age, close) => [
      dayScene('dancer', 'crisis', age, 'wake', 'Wake', 'Something is wrong before you stand.', [
        pick({ id: 'up', label: 'Stand anyway', icon: 'check', effects: soft, result: 'You meet the day.' }),
        pick({ id: 'down', label: 'Stay down', icon: 'bed', effects: { happiness: -1, health: 1 }, result: 'The body gets a minute.' }),
      ]),
      dayScene('dancer', 'crisis', age, 'meal', 'A plate', 'Not hungry. You should still eat.', [
        pick({ id: 'eat', label: 'Eat anyway', icon: 'apple', effects: soft, result: 'A few bites count.' }),
        pick({ id: 'skip', label: 'Skip it', icon: 'x', effects: { health: -2 }, result: 'The plate stays full.' }),
      ], { food: 'noodles' }),
      dayScene('dancer', 'crisis', age, 'commute', 'Smaller', 'The building feels smaller today.', [
        pick({ id: 'go', label: 'Go in', icon: 'door', effects: soft, result: 'You walk through the door.' }),
        pick({ id: 'slow', label: 'Walk slow', icon: 'walk', effects: { health: 1 }, result: 'You do not rush the pain.' }),
      ]),
      dayScene('dancer', 'crisis', close, 'evening', 'The phone', 'A friend would help. The phone is there.', [
        pick({ id: 'call', label: 'Call them', icon: 'heart', effects: kin, result: 'You do not do this alone.' }),
        pick({ id: 'alone', label: 'Stay quiet', icon: 'x', effects: { happiness: -2 }, setFlags: ['ate_alone'], result: 'The kitchen stays empty.' }),
      ]),
      dayScene('dancer', 'crisis', close, 'sleep', 'Dark', 'Pain, or pride, then the dark.', [
        pick({ id: 'sleep', label: 'Lie down', icon: 'bed', effects: soft, result: 'The day finally stops.' }),
      ]),
    ],
    late_career: (age, close) => [
      dayScene('dancer', 'late_career', age, 'wake', 'Wake', 'Older than the students in the hall.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'The light is familiar.' }),
        pick({ id: 'slow', label: 'Move slow', icon: 'bed', effects: { health: 1 }, result: 'Your knees get a vote.' }),
      ]),
      dayScene('dancer', 'late_career', age, 'meal', 'Coffee', 'Coffee, and whatever is left.', [
        pick({ id: 'eat', label: 'Eat leftovers', icon: 'apple', effects: soft, result: 'Enough for a morning.' }),
        pick({ id: 'coffee', label: 'Just coffee', icon: 'alert', effects: { happiness: 1, health: -1 }, result: 'Bitter, and quick.' }),
      ], { food: 'coffee' }),
      dayScene('dancer', 'late_career', age, 'commute', 'Which door', 'The studio, or the school doors.', [
        pick({ id: 'studio', label: 'The studio', icon: 'music', effects: soft, result: 'The barre still knows you.' }),
        pick({ id: 'school', label: 'The school', icon: 'teach', effects: kin, result: 'Students are already there.' }),
      ]),
      dayScene('dancer', 'late_career', close, 'evening', 'Dinner', 'A small joy. Dinner you cooked.', [
        pick({ id: 'cook', label: 'Cook it', icon: 'home', effects: kin, result: 'A plate that is yours.' }),
        pick({ id: 'out', label: 'Eat out', icon: 'coin', effects: { money: -4, happiness: 2 }, result: 'You let someone else cook.' }),
      ]),
      dayScene('dancer', 'late_career', close, 'sleep', 'Quiet', 'The home is finally quiet.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'You keep the quiet.' }),
      ]),
    ],
  },
  teacher: {
    training: (age, close) => [
      dayScene('teacher', 'training', age, 'wake', 'Wake', 'Spare room. The lesson is already looping.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'The lesson can wait an hour.' }),
        pick({ id: 'plan', label: 'Plan in bed', icon: 'book', effects: { happiness: -1 }, result: 'The day starts early.' }),
      ], { home: 'family' }),
      dayScene('teacher', 'training', age, 'meal', 'Toast', 'Toast, and grading in your head.', [
        pick({ id: 'eat', label: 'Eat toast', icon: 'apple', effects: soft, result: 'Something warm.' }),
        pick({ id: 'skip', label: 'Skip it', icon: 'x', effects: { health: -1 }, result: 'You run on nerves.' }),
      ], { food: 'toast' }),
      dayScene('teacher', 'training', age, 'commute', 'Across town', 'Student teaching is across town.', [
        pick({ id: 'bus', label: 'Take the bus', icon: 'clock', effects: { money: -1 }, result: 'You rehearse the lesson.' }),
        pick({ id: 'ride', label: 'Get a ride', icon: 'heart', effects: kin, result: 'Someone else drives.' }),
      ]),
      dayScene('teacher', 'training', close, 'evening', 'The bed', 'Plans spread across the bed.', [
        pick({ id: 'stop', label: 'Stop planning', icon: 'home', effects: kin, result: 'You close the notebook.' }),
        pick({ id: 'more', label: 'Plan more', icon: 'book', effects: { happiness: -1 }, result: 'One more page.' }),
      ]),
      dayScene('teacher', 'training', close, 'sleep', 'Five a.m.', 'The alarm is set for five.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'You let it be tomorrow.' }),
      ]),
    ],
    first_job: (age, close) => [
      dayScene('teacher', 'first_job', age, 'wake', 'Wake', 'Your class today. A rented room.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'The room is waiting.' }),
        pick({ id: 'linger', label: 'Linger', icon: 'bed', effects: { happiness: 1 }, result: 'A few quiet minutes.' }),
      ]),
      dayScene('teacher', 'first_job', age, 'meal', 'Lunch', 'Lunch packed last night, or the line.', [
        pick({ id: 'pack', label: 'Pack lunch', icon: 'apple', effects: soft, result: 'A box you made.' }),
        pick({ id: 'buy', label: 'Buy lunch', icon: 'coin', effects: { money: -3 }, result: 'The cafeteria line.' }),
      ], { food: 'packed' }),
      dayScene('teacher', 'first_job', age, 'commute', 'The bell', 'The bell will not wait for you.', [
        pick({ id: 'bus', label: 'Catch the bus', icon: 'clock', effects: soft, result: 'You make the bell.' }),
        pick({ id: 'car', label: 'Drive', icon: 'coin', effects: { money: -2 }, result: 'You buy the minutes.' }),
      ]),
      dayScene('teacher', 'first_job', close, 'evening', 'The stack', 'A stack of papers, or a walk.', [
        pick({ id: 'walk', label: 'Take a walk', icon: 'walk', effects: kin, result: 'The block is enough.' }),
        pick({ id: 'grade', label: 'Keep grading', icon: 'book', effects: { happiness: -1 }, result: 'The stack shrinks.' }),
      ]),
      dayScene('teacher', 'first_job', close, 'sleep', 'Sleep', 'You sleep before the stack ends.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'The papers can wait.' }),
      ]),
    ],
    mid_career: (age, close) => [
      dayScene('teacher', 'mid_career', age, 'wake', 'Wake', 'The table fits two plates now.', [
        pick({ id: 'up', label: 'Sit down', icon: 'home', effects: kin, result: 'A morning with someone.' }),
        pick({ id: 'rush', label: 'Rush', icon: 'clock', effects: { happiness: -1 }, result: 'The second plate stays.' }),
      ]),
      dayScene('teacher', 'mid_career', age, 'meal', 'Leftovers', 'Leftovers, eaten over a quiz.', [
        pick({ id: 'eat', label: 'Eat leftovers', icon: 'apple', effects: soft, result: 'Cold, and yours.' }),
        pick({ id: 'buy', label: 'Buy lunch', icon: 'coin', effects: { money: -3, happiness: 1 }, result: 'A hot lunch for once.' }),
      ], { food: 'leftovers' }),
      dayScene('teacher', 'mid_career', age, 'commute', 'The road', 'Same road. You know every light.', [
        pick({ id: 'go', label: 'Drive it', icon: 'check', effects: soft, result: 'The route is yours.' }),
        pick({ id: 'bus', label: 'Take the bus', icon: 'clock', effects: { money: -2 }, result: 'You watch the city.' }),
      ]),
      dayScene('teacher', 'mid_career', close, 'evening', 'The email', 'A parent email, then the quiet.', [
        pick({ id: 'close', label: 'Close it', icon: 'home', effects: kin, result: 'Tonight is not school.' }),
        pick({ id: 'answer', label: 'Answer now', icon: 'book', effects: { happiness: -1 }, result: 'You give the night away.' }),
      ]),
      dayScene('teacher', 'mid_career', close, 'sleep', 'Sleep', 'The apartment holds the day.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'You put it down.' }),
      ]),
    ],
    crisis: (age, close) => [
      dayScene('teacher', 'crisis', age, 'wake', 'Wake', 'The hard day is already in you.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'You show up anyway.' }),
        pick({ id: 'slow', label: 'Move slow', icon: 'bed', effects: { health: 1 }, result: 'A slower morning.' }),
      ]),
      dayScene('teacher', 'crisis', age, 'meal', 'The box', 'You packed lunch. You may forget it.', [
        pick({ id: 'bring', label: 'Bring it', icon: 'apple', effects: soft, result: 'The box comes with you.' }),
        pick({ id: 'forget', label: 'Leave it', icon: 'x', effects: { health: -1 }, result: 'It waits in the fridge.' }),
      ], { food: 'packed' }),
      dayScene('teacher', 'crisis', age, 'commute', 'The worry', 'You carry the worry to school.', [
        pick({ id: 'go', label: 'Go in', icon: 'door', effects: soft, result: 'The door still opens.' }),
        pick({ id: 'sit', label: 'Sit in the lot', icon: 'clock', effects: { happiness: -1 }, result: 'One minute in the car.' }),
      ]),
      dayScene('teacher', 'crisis', close, 'evening', 'After', 'Call your person, or keep grading.', [
        pick({ id: 'call', label: 'Call them', icon: 'heart', effects: kin, result: 'You are more than the job.' }),
        pick({ id: 'grade', label: 'Keep grading', icon: 'book', effects: { happiness: -2 }, result: 'The stack wins tonight.' }),
      ]),
      dayScene('teacher', 'crisis', close, 'sleep', 'Sleep', 'Tomorrow is already in the room.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'You close your eyes.' }),
      ]),
    ],
    late_career: (age, close) => [
      dayScene('teacher', 'late_career', age, 'wake', 'Wake', 'You know this home by the light.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'The light is an old friend.' }),
        pick({ id: 'stay', label: 'Stay in it', icon: 'home', effects: kin, result: 'You let the light sit.' }),
      ]),
      dayScene('teacher', 'late_career', age, 'meal', 'Coffee', 'Coffee. The lunch you always pack.', [
        pick({ id: 'pack', label: 'Pack lunch', icon: 'apple', effects: soft, result: 'The same good box.' }),
        pick({ id: 'buy', label: 'Buy lunch', icon: 'coin', effects: { money: -3, happiness: 1 }, result: 'A treat, on purpose.' }),
      ], { food: 'coffee' }),
      dayScene('teacher', 'late_career', age, 'commute', 'The lot', 'The same lot. A shorter walk.', [
        pick({ id: 'walk', label: 'Walk in', icon: 'walk', effects: soft, result: 'You know every step.' }),
        pick({ id: 'ride', label: 'Get dropped', icon: 'heart', effects: kin, result: 'Someone waits tonight.' }),
      ]),
      dayScene('teacher', 'late_career', close, 'evening', 'The table', 'Dinner at a real table tonight.', [
        pick({ id: 'cook', label: 'Cook dinner', icon: 'home', effects: kin, result: 'A table, not a desk.' }),
        pick({ id: 'order', label: 'Order in', icon: 'coin', effects: { money: -4, happiness: 2 }, result: 'You skip the dishes.' }),
      ]),
      dayScene('teacher', 'late_career', close, 'sleep', 'Quiet', 'The house goes quiet with you.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'A full night.' }),
      ]),
    ],
  },
  firefighter: {
    training: (age, close) => [
      dayScene('firefighter', 'training', age, 'wake', 'Dark', 'Boots by the door. It is still dark.', [
        pick({ id: 'up', label: 'Lace up', icon: 'check', effects: soft, result: 'The day starts standing.' }),
        pick({ id: 'sit', label: 'Sit a minute', icon: 'bed', effects: { happiness: 1 }, result: 'One still minute.' }),
      ], { home: 'bunk' }),
      dayScene('firefighter', 'training', age, 'meal', 'Cereal', 'Cereal in the dark, or just coffee.', [
        pick({ id: 'eat', label: 'Eat cereal', icon: 'apple', effects: soft, result: 'Something in the bowl.' }),
        pick({ id: 'coffee', label: 'Just coffee', icon: 'alert', effects: { health: -1 }, result: 'Bitter, and empty.' }),
      ], { food: 'cereal' }),
      dayScene('firefighter', 'training', age, 'commute', 'The tower', 'The tower is across the city.', [
        pick({ id: 'bus', label: 'Take the bus', icon: 'clock', effects: soft, result: 'You watch the dark lift.' }),
        pick({ id: 'drive', label: 'Drive', icon: 'coin', effects: { money: -2 }, result: 'You buy the time.' }),
      ]),
      dayScene('firefighter', 'training', close, 'evening', 'Sore', 'Sore. A text from your brother.', [
        pick({ id: 'text', label: 'Text back', icon: 'heart', effects: kin, result: 'You answer him.' }),
        pick({ id: 'ice', label: 'Ice and sleep', icon: 'water', effects: { health: 1 }, result: 'The body comes first.' }),
      ]),
      dayScene('firefighter', 'training', close, 'sleep', 'Sleep', 'You sleep like the shift started.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'Boots stay by the door.' }),
      ]),
    ],
    first_job: (age, close) => [
      dayScene('firefighter', 'first_job', age, 'wake', 'Wake', 'Probation. The boots are already waiting.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'You meet the shift.' }),
        pick({ id: 'slow', label: 'Move slow', icon: 'bed', effects: { happiness: 1 }, result: 'A slower start.' }),
      ]),
      dayScene('firefighter', 'first_job', age, 'meal', 'Five a.m.', "Last night's chili, or cereal at five.", [
        pick({ id: 'chili', label: 'Heat chili', icon: 'flame', effects: soft, result: 'The pot still works.' }),
        pick({ id: 'cereal', label: 'Pour cereal', icon: 'apple', effects: { happiness: 1 }, result: 'Fast, and cold.' }),
      ], { food: 'chili' }),
      dayScene('firefighter', 'first_job', age, 'commute', 'Before dawn', 'The station wants you before dawn.', [
        pick({ id: 'go', label: 'Drive in', icon: 'clock', effects: soft, result: 'The bay light is on.' }),
        pick({ id: 'bus', label: 'Take the bus', icon: 'walk', effects: { money: -1 }, result: 'You doze one stop.' }),
      ]),
      dayScene('firefighter', 'first_job', close, 'evening', 'Bills', 'Bills on the counter. Or the crew.', [
        pick({ id: 'home', label: 'Stay home', icon: 'home', effects: kin, result: 'The counter can wait.' }),
        pick({ id: 'pay', label: 'Pay a bill', icon: 'coin', effects: { money: -4, happiness: 1 }, result: 'One envelope gone.' }),
        pick({ id: 'crew', label: 'Meet the crew', icon: 'users', effects: { money: -3, happiness: 2 }, result: 'You are not only tired.' }),
      ]),
      dayScene('firefighter', 'first_job', close, 'sleep', 'Sleep', 'Four hours, if the night is kind.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'You take the hours.' }),
      ]),
    ],
    mid_career: (age, close) => [
      dayScene('firefighter', 'mid_career', age, 'wake', 'Wake', 'A kid in the house. A shift ahead.', [
        pick({ id: 'up', label: 'Kiss them', icon: 'heart', effects: kin, result: 'You leave a person, not a ghost.' }),
        pick({ id: 'slip', label: 'Slip out', icon: 'door', effects: { happiness: -1 }, result: 'The house stays asleep.' }),
      ]),
      dayScene('firefighter', 'mid_career', age, 'meal', 'Standing', 'You eat standing up, if you eat.', [
        pick({ id: 'eggs', label: 'Eat eggs', icon: 'apple', effects: soft, result: 'Standing still counts.' }),
        pick({ id: 'bar', label: 'Grab a bar', icon: 'clock', effects: { happiness: -1 }, result: 'Food you can hold.' }),
      ], { food: 'eggs' }),
      dayScene('firefighter', 'mid_career', age, 'commute', 'The rig', 'The rig is the second kitchen.', [
        pick({ id: 'go', label: 'Head in', icon: 'check', effects: soft, result: 'The bay smells like coffee.' }),
        pick({ id: 'early', label: 'Go early', icon: 'clock', effects: { happiness: -1 }, result: 'You give the morning away.' }),
      ]),
      dayScene('firefighter', 'mid_career', close, 'evening', 'The fridge', 'Photos on the fridge. Overtime in mind.', [
        pick({ id: 'stay', label: 'Stay home', icon: 'home', effects: kin, result: 'You pick the photos.' }),
        pick({ id: 'back', label: 'Think of OT', icon: 'coin', effects: { happiness: -2 }, result: 'The shift follows you home.' }),
      ]),
      dayScene('firefighter', 'mid_career', close, 'sleep', 'Sleep', 'Someone else has the radio.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'The radio is not yours.' }),
      ]),
    ],
    crisis: (age, close) => [
      dayScene('firefighter', 'crisis', age, 'wake', 'Wake', 'Your body complains before the alarm.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'You stand up anyway.' }),
        pick({ id: 'sit', label: 'Sit first', icon: 'bed', effects: { health: 1 }, result: 'You listen to the ache.' }),
      ]),
      dayScene('firefighter', 'crisis', age, 'meal', 'Eat now', 'Eat now. The shift will not.', [
        pick({ id: 'eat', label: 'Eat chili', icon: 'flame', effects: soft, result: 'You fuel the day.' }),
        pick({ id: 'coffee', label: 'Just coffee', icon: 'alert', effects: { health: -2 }, result: 'Empty, and sharp.' }),
      ], { food: 'chili' }),
      dayScene('firefighter', 'crisis', age, 'commute', 'Toward it', 'You drive toward the thing that hurts.', [
        pick({ id: 'go', label: 'Drive in', icon: 'check', effects: soft, result: 'You still go.' }),
        pick({ id: 'slow', label: 'Drive slow', icon: 'clock', effects: { health: 1 }, result: 'No heroics in the car.' }),
      ]),
      dayScene('firefighter', 'crisis', close, 'evening', 'Okay', 'Someone asks if you are okay.', [
        pick({ id: 'talk', label: 'Tell them', icon: 'heart', effects: kin, result: 'You say a true thing.' }),
        pick({ id: 'shrug', label: 'Shrug', icon: 'x', effects: { happiness: -2 }, result: 'Fine is not an answer.' }),
      ]),
      dayScene('firefighter', 'crisis', close, 'sleep', 'Sleep', 'You lie down still listening.', [
        pick({ id: 'sleep', label: 'Lie down', icon: 'bed', effects: soft, result: 'The tones stay quiet.' }),
      ]),
    ],
    late_career: (age, close) => [
      dayScene('firefighter', 'late_career', age, 'wake', 'Wake', 'The bunk belongs to someone younger.', [
        pick({ id: 'up', label: 'Get up', icon: 'check', effects: soft, result: 'Your own bed, your own hour.' }),
        pick({ id: 'stay', label: 'Stay put', icon: 'home', effects: kin, result: 'You let the morning be slow.' }),
      ]),
      dayScene('firefighter', 'late_career', age, 'meal', 'Time', 'Breakfast you finally have time for.', [
        pick({ id: 'cook', label: 'Cook eggs', icon: 'apple', effects: soft, result: 'A plate, not a grab.' }),
        pick({ id: 'bar', label: 'Grab a bar', icon: 'clock', effects: { happiness: -1 }, result: 'Old habits, still fast.' }),
      ], { food: 'eggs' }),
      dayScene('firefighter', 'late_career', age, 'commute', 'Early', 'You still leave before the street wakes.', [
        pick({ id: 'go', label: 'Head in', icon: 'check', effects: soft, result: 'The street is empty and yours.' }),
        pick({ id: 'later', label: 'Leave later', icon: 'clock', effects: { happiness: 1 }, result: 'The street can wake first.' }),
      ]),
      dayScene('firefighter', 'late_career', close, 'evening', 'The porch', 'The porch. The radio stays off.', [
        pick({ id: 'sit', label: 'Sit outside', icon: 'home', effects: kin, result: 'No tones. Just night.' }),
        pick({ id: 'call', label: 'Call the crew', icon: 'users', effects: { happiness: 2 }, result: 'You miss them, and say so.' }),
      ]),
      dayScene('firefighter', 'late_career', close, 'sleep', 'A night', 'A whole night, if you allow it.', [
        pick({ id: 'sleep', label: 'Sleep', icon: 'bed', effects: soft, result: 'You allow the night.' }),
      ]),
    ],
  },
};

function groupStages(scenes: Scene[]): Scene[][] {
  const groups: Scene[][] = [];
  for (const scene of scenes) {
    const last = groups[groups.length - 1];
    if (!last || last[0].stage !== scene.stage) groups.push([scene]);
    else last.push(scene);
  }
  return groups;
}

export function weaveRoutine(career: Career): Career {
  const make = DAYS[career.id];
  if (!make) return career;
  const scenes: Scene[] = [];
  for (const group of groupStages(career.scenes)) {
    const stage = group[0].stage;
    let split = group.length;
    while (split > 0 && group[split - 1].terminal) split -= 1;
    const body = group.slice(0, split);
    const finale = group.slice(split);
    const openAge = body[0]?.age ?? group[0].age;
    const closeAge = body[body.length - 1]?.age ?? openAge;
    const [wake, meal, commute, evening, sleep] = make[stage](openAge, closeAge);
    scenes.push(wake, meal, commute, ...body, evening, sleep, ...finale);
  }
  return { ...career, scenes };
}

export const ROUTINE_BEATS: DayBeat[] = ['wake', 'meal', 'commute', 'evening', 'sleep'];
export const ROUTINE_STAGES = STAGES;
