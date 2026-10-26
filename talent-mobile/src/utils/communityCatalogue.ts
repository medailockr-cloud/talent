export type Club = {
  id: string;
  name: string;
  category: string;
  city: string;
  initials: string;
  color: string;
  description: string;
  prompt: string;
};

export const clubs: Club[] = [
  {
    id: 'voices',
    name: 'The Listening Room',
    category: 'Music',
    city: 'Bengaluru',
    initials: 'LR',
    color: '#805243',
    description: 'Original songs, close listening and a first stage for new voices.',
    prompt: 'Bring one verse you have never performed before.',
  },
  {
    id: 'movement',
    name: 'After Hours Movement',
    category: 'Dance',
    city: 'Mumbai',
    initials: 'AM',
    color: '#525D79',
    description: 'Freestyle sessions, choreography exchanges and collaborative performances.',
    prompt: 'One rhythm. Your own movement.',
  },
  {
    id: 'comedy',
    name: 'The First Laugh',
    category: 'Comedy',
    city: 'Bengaluru',
    initials: 'FL',
    color: '#947339',
    description: 'A welcoming room to try a new set and offer useful feedback.',
    prompt: 'Try a clean two-minute original set.',
  },
  {
    id: 'frames',
    name: 'Frames & Stories',
    category: 'Film',
    city: 'Online',
    initials: 'FS',
    color: '#536D60',
    description: 'Actors, writers and filmmakers making small stories together.',
    prompt: 'Tell a story in a single uninterrupted shot.',
  },
  {
    id: 'rhythm',
    name: 'Rhythm Collective',
    category: 'Music',
    city: 'Delhi',
    initials: 'RC',
    color: '#73577D',
    description: 'Percussion, production and the sounds that connect them.',
    prompt: 'Build a groove using something unexpected.',
  },
  {
    id: 'words',
    name: 'Words After Dark',
    category: 'Writing',
    city: 'Online',
    initials: 'WD',
    color: '#586872',
    description: 'Spoken word and poetry with room to listen, respond and grow.',
    prompt: 'Write about a place that changed you.',
  },
];

export type ClubEvent = {
  id: string;
  clubId: string;
  title: string;
  date: string;
  time: string;
  format: 'In person' | 'Online' | 'Club vs club';
  location: string;
  category: string;
  brief: string;
};

export const clubEvents: ClubEvent[] = [
  {
    id: 'open-room',
    clubId: 'voices',
    title: 'Live at The Next Stage',
    date: '7 Nov',
    time: '6:30 PM IST',
    format: 'In person',
    location: 'Demo venue · Bengaluru',
    category: 'Music',
    brief: 'Five-minute original sets. Submit one portfolio performance for the host to review. Selection is separate from attendance.',
  },
  {
    id: 'dance-exchange',
    clubId: 'movement',
    title: 'The freestyle exchange',
    date: '8 Nov',
    time: '7:00 PM IST',
    format: 'Online',
    location: 'Demo online room',
    category: 'Dance',
    brief: 'Bring a 60-second freestyle and discuss the choices behind it.',
  },
  {
    id: 'comedy-room',
    clubId: 'comedy',
    title: 'Your first five minutes',
    date: '14 Nov',
    time: '7:30 PM IST',
    format: 'In person',
    location: 'Demo venue · Bengaluru',
    category: 'Comedy',
    brief: 'A small audience, original material and thoughtful feedback. Performer applications are reviewed by the host.',
  },
  {
    id: 'frame-room',
    clubId: 'frames',
    title: 'One scene, many interpretations',
    date: '15 Nov',
    time: '5:00 PM IST',
    format: 'Online',
    location: 'Demo online room',
    category: 'Film',
    brief: 'Actors and filmmakers interpret the same short scene. Apply with a performance from your portfolio.',
  },
  {
    id: 'club-exchange',
    clubId: 'rhythm',
    title: 'Rhythm Collective × Listening Room',
    date: '21 Nov',
    time: '6:00 PM IST',
    format: 'Club vs club',
    location: 'Demo online showcase',
    category: 'Music',
    brief: 'Two communities respond to one creative brief. Each club selects its own lineup. No paid votes or guaranteed winners.',
  },
  {
    id: 'poetry-room',
    clubId: 'words',
    title: 'A place that changed you',
    date: '22 Nov',
    time: '8:00 PM IST',
    format: 'Online',
    location: 'Demo online room',
    category: 'Writing',
    brief: 'Share an original poem or come just to listen. Apply to read using a recorded portfolio performance.',
  },
  {
    id: 'roots-night',
    clubId: 'voices',
    title: 'Rhythm & Roots',
    date: '2 Nov',
    time: '7:00 PM IST',
    format: 'In person',
    location: 'Demo courtyard · Bengaluru',
    category: 'Music',
    brief: 'A sample acoustic evening of original voices and cross-cultural sounds. Come as a listener or apply for an opening set with your Talent Passport.',
  },
  {
    id: 'indie-faceoff',
    clubId: 'rhythm',
    title: 'The Indie Faceoff',
    date: '28 Nov',
    time: '8:00 PM IST',
    format: 'Online',
    location: 'Demo online room',
    category: 'Music',
    brief: 'An online showcase of two original arrangements. A friendly exchange with thoughtful feedback, not paid voting. Reserve a preview place or explore the sample room.',
  },
  {
    id: 'magic-closeup',
    clubId: 'voices',
    title: 'A Little Impossible',
    date: '29 Nov',
    time: '5:30 PM IST',
    format: 'In person',
    location: 'Demo studio · Mumbai',
    category: 'Magic',
    brief: 'A sample close-up magic showcase. Meet the craft behind the illusion in a small audience setting. Applications are reviewed for original performance and suitability.',
  },
];
