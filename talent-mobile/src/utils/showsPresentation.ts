export type ShowArtwork = {
  image?: string;
  video?: string;
  sample: string;
  credit: string;
  accent: string;
  category: string;
};

export const showArtwork: Record<string, ShowArtwork> = {
  'open-room': {
    sample: 'Guitar performance',
    credit: 'Live acoustic showcase',
    accent: '#d98a42',
    category: 'Music',
  },
  'roots-night': {
    sample: 'Cello and vocals',
    credit: 'Acoustic evening spotlight',
    accent: '#e7a76e',
    category: 'Music',
  },
  'indie-faceoff': {
    sample: 'Live guitar',
    credit: 'Indie solo spotlight',
    accent: '#a28af7',
    category: 'Music',
  },
  'magic-closeup': {
    sample: 'Traditional magic demonstration',
    credit: 'Sleight masters stage',
    accent: '#bd8eea',
    category: 'Magic',
  },
  'dance-exchange': {
    sample: 'Freestyle exchange',
    credit: 'Contemporary dance cypher',
    accent: '#fa9d7b',
    category: 'Dance',
  },
  'comedy-room': {
    sample: 'Stand-up showcase',
    credit: 'Breakthrough comedy stage',
    accent: '#ddb674',
    category: 'Comedy',
  },
  'frame-room': {
    sample: 'Dramatic scene work',
    credit: 'Scene interpretation stage',
    accent: '#a8cabc',
    category: 'Film',
  },
  'club-exchange': {
    sample: 'Rhythm and percussion session',
    credit: 'Percussion collective',
    accent: '#d69fae',
    category: 'Music',
  },
  'poetry-room': {
    sample: 'Spoken word prose',
    credit: 'Raw verse stage',
    accent: '#a4b9dd',
    category: 'Poetry',
  },
};
