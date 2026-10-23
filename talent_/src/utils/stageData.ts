// Comprehensive stage performances dataset with real video streams, stage art, and selective popularity metrics

export interface PerformanceItem {
  id: string;
  topDuration: string;
  timecode: string;
  totalSeconds: number;
  initialSeconds: number;
  artistName: string;
  role: string;
  location: string;
  tags: string[];
  category: 'For You' | 'Rising' | 'Nearby' | 'Live';
  genre: string;
  // Real video source stream (reliable high quality MP4)
  videoSrc: string;
  // Fallback / poster image
  posterUrl: string;
  avatarUrl: string;
  bio: string;
  // Popularity visibility flag requested by user:
  // Some videos have popularity hidden (blind judging), some have it showing!
  isPopularityHidden: boolean;
  popularityStats?: {
    votes: string;
    views: string;
    rank?: string;
    likes: string;
    trendingTag?: string;
  };
  communityScores: {
    presence: number;
    originality: number;
    craft: number;
  };
  comments: { author: string; role: string; text: string; time: string }[];
}

// Curated high quality, high-speed CDN MP4 video clips representing distinct live performances
export const PERFORMANCES_FEED: PerformanceItem[] = [
  {
    id: 'kiara-nair',
    topDuration: '0:58',
    timecode: '00:58 / 01:00',
    totalSeconds: 60,
    initialSeconds: 58,
    artistName: 'Kiara Nair',
    role: 'Contemporary Dancer',
    location: 'Kochi, India',
    tags: ['#dance', '#contemporary', '#kerala'],
    category: 'For You',
    genre: 'Contemporary Dance',
    // Contemporary solo movement video
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Trained in Kalakshetra movement and contemporary floorwork. Exploring rhythm, breath, and cinematic amber stage lighting.',
    isPopularityHidden: true, // POPULARITY HIDDEN (as in original design)
    communityScores: { presence: 9.4, originality: 9.1, craft: 9.3 },
    comments: [
      {
        author: 'Rohan Dev',
        role: 'Choreographer',
        text: 'The suspension in the upper-body arch right before the final phrase is breathtaking.',
        time: '14m ago',
      },
      {
        author: 'Meera S.',
        role: 'Stage Director',
        text: 'Incredible control of silhouette and pacing across the full 58-second take.',
        time: '1h ago',
      },
    ],
  },
  {
    id: 'aarav-nair',
    topDuration: '1:00',
    timecode: '01:00 / 01:00',
    totalSeconds: 60,
    initialSeconds: 60,
    artistName: 'Aarav Nair',
    role: 'Singer • Songwriter',
    location: 'Bengaluru, India',
    tags: ['#Original', '#Acoustic', '#Indie', '#Singer'],
    category: 'For You',
    genre: 'Singer-Songwriter',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: '“Building a life on stage, one performance at a time.”',
    isPopularityHidden: false, // POPULARITY SHOWING (requested by user)
    popularityStats: {
      votes: '142.8K',
      views: '3.2M',
      rank: '#3 Trending',
      likes: '89.4K',
      trendingTag: 'Top Acoustic Original',
    },
    communityScores: { presence: 9.2, originality: 9.5, craft: 9.0 },
    comments: [
      {
        author: 'Ananya Rao',
        role: 'Sound Engineer',
        text: 'Raw vocal warmth and dynamics without any compression tricks. Pure acoustic storytelling.',
        time: '22m ago',
      },
      {
        author: 'Kunal Sen',
        role: 'Indie Producer',
        text: 'The modulation at 0:42 gave me goosebumps. Authentic studio warmth.',
        time: '45m ago',
      },
    ],
  },
  {
    id: 'maya-sharma',
    topDuration: '0:45',
    timecode: '00:45 / 01:00',
    totalSeconds: 60,
    initialSeconds: 45,
    artistName: 'Maya Sharma',
    role: 'Spoken Word Artist',
    location: 'Mumbai, India',
    tags: ['#spokenword', '#poetry', '#theatre'],
    category: 'Rising',
    genre: 'Spoken Word',
    // Atmospheric stage speaker / theater video
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-woman-talking-on-stage-with-lights-42534-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    bio: 'Bilingual stage poet blending classical Hindustani cadence with modern urban theatre poetry.',
    isPopularityHidden: true, // POPULARITY HIDDEN
    communityScores: { presence: 9.3, originality: 9.4, craft: 8.9 },
    comments: [
      {
        author: 'Kabir Verma',
        role: 'Playwright',
        text: 'Every breath and silence carries intentional theatrical weight.',
        time: '40m ago',
      },
    ],
  },
  {
    id: 'zoya-rehman',
    topDuration: '0:56',
    timecode: '00:56 / 01:00',
    totalSeconds: 60,
    initialSeconds: 56,
    artistName: 'Zoya Rehman',
    role: 'Sitar & Neo-Sufi Composer',
    location: 'Jaipur, India',
    tags: ['#sufi', '#sitar', '#classicalfusion'],
    category: 'Rising',
    genre: 'Classical Fusion',
    // Live instrumental string performance
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-musician-playing-an-acoustic-instrument-42617-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bio: 'Bridging 16th century Yaman ragas with ambient analog synth pads in 60-second improvisations.',
    isPopularityHidden: false, // POPULARITY SHOWING (requested by user)
    popularityStats: {
      votes: '96.4K',
      views: '840K',
      rank: '#1 Classical',
      likes: '64.1K',
      trendingTag: 'Viral Raga',
    },
    communityScores: { presence: 9.6, originality: 9.7, craft: 9.5 },
    comments: [
      {
        author: 'Tushar Joshi',
        role: 'Classical Ustad',
        text: 'The meend gliding across three octaves in 8 seconds was sheer mastery.',
        time: '5m ago',
      },
    ],
  },
  {
    id: 'marcus-vance',
    topDuration: '0:52',
    timecode: '00:52 / 01:00',
    totalSeconds: 60,
    initialSeconds: 52,
    artistName: 'Marcus Vance',
    role: 'Acrobatic Urban Flow',
    location: 'London, UK',
    tags: ['#acro', '#movement', '#urbanflow'],
    category: 'Nearby',
    genre: 'Urban Movement',
    // Street flow acrobatic movement
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-breakdance-in-a-studio-41484-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Continuous momentum and zero-cut break movement captured under London warehouse lighting.',
    isPopularityHidden: true, // POPULARITY HIDDEN (Blind Judged)
    communityScores: { presence: 9.1, originality: 9.0, craft: 9.4 },
    comments: [
      {
        author: 'Darnell King',
        role: 'BBoy World Champ',
        text: 'The freeze transitions into windmill without touching palms is elite core power.',
        time: '32m ago',
      },
    ],
  },
  {
    id: 'elena-rostova',
    topDuration: '0:59',
    timecode: '00:59 / 01:00',
    totalSeconds: 60,
    initialSeconds: 59,
    artistName: 'Elena Rostova',
    role: 'Neo-Classical Violinist',
    location: 'Berlin, Germany',
    tags: ['#violin', '#strings', '#cinematic'],
    category: 'Live',
    genre: 'Cinematic Strings',
    // Violinist live performance video
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-woman-playing-the-violin-42571-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'Orchestral concertmaster performing dark romantic solo loops with real-time pitch pedals.',
    isPopularityHidden: false, // POPULARITY SHOWING (requested by user)
    popularityStats: {
      votes: '210.5K',
      views: '2.4M',
      rank: '#1 Global Live',
      likes: '178K',
      trendingTag: 'Top Live Showcase',
    },
    communityScores: { presence: 9.7, originality: 9.3, craft: 9.8 },
    comments: [
      {
        author: 'Hans Richter',
        role: 'Philharmonic Conductor',
        text: 'Vibrato speed and bow pressure are impeccably controlled. World-class tone.',
        time: '8m ago',
      },
    ],
  },
  {
    id: 'devansh-kulkarni',
    topDuration: '0:48',
    timecode: '00:48 / 01:00',
    totalSeconds: 60,
    initialSeconds: 48,
    artistName: 'Devansh Kulkarni',
    role: 'Beatbox & Vocal Percussion',
    location: 'Pune, India',
    tags: ['#beatbox', '#vocalpercussion', '#groove'],
    category: 'Nearby',
    genre: 'Vocal Percussion',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-singer-singing-into-a-microphone-in-a-studio-42588-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    bio: 'Multi-polyphonic throat bass and complex Indian tabla bols translated into live mic percussion.',
    isPopularityHidden: true, // POPULARITY HIDDEN (Blind Judged)
    popularityStats: {
      votes: '78.2K',
      views: '540K',
      rank: '#4 Vocal',
      likes: '49.8K',
      trendingTag: 'Throat Bass Showcase',
    },
    communityScores: { presence: 9.3, originality: 9.6, craft: 9.2 },
    comments: [
      {
        author: 'DJ Saheli',
        role: 'Electronic Producer',
        text: 'The polyphonic sub-bass line while keeping a 7/8 hi-hat tempo is mindblowing.',
        time: '52m ago',
      },
    ],
  },
  {
    id: 'samira-khan',
    topDuration: '0:57',
    timecode: '00:57 / 01:00',
    totalSeconds: 60,
    initialSeconds: 57,
    artistName: 'Samira Khan',
    role: 'Kathak & Flamenco Dancer',
    location: 'Granada & New Delhi',
    tags: ['#kathak', '#flamenco', '#fusiondance'],
    category: 'Rising',
    genre: 'Contemporary Dance',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-dancer-spinning-in-a-stage-light-42408-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Merging complex Lucknow Kathak tatkar footwork with Spanish zapateado rhythms in high-speed turns.',
    isPopularityHidden: false, // POPULARITY SHOWING (Requested by user)
    popularityStats: {
      votes: '185.3K',
      views: '1.9M',
      rank: '#2 Rising Dance',
      likes: '142K',
      trendingTag: 'Viral Ghungroo Zapateado',
    },
    communityScores: { presence: 9.8, originality: 9.6, craft: 9.7 },
    comments: [
      {
        author: 'Carlos Mendez',
        role: 'Flamenco Guitarist',
        text: 'The compas timing on the heel taps matched the 16-beat cycle without missing a fraction.',
        time: '18m ago',
      },
    ],
  },
  {
    id: 'leopold-chen',
    topDuration: '0:55',
    timecode: '00:55 / 01:00',
    totalSeconds: 60,
    initialSeconds: 55,
    artistName: 'Leopold Chen',
    role: 'Jazz Saxophone Soloist',
    location: 'Tokyo, Japan',
    tags: ['#jazz', '#saxophone', '#tokyosessions'],
    category: 'Nearby',
    genre: 'Jazz & Instrumental',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-man-playing-the-saxophone-in-a-studio-42594-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1525994886773-080587e161c2?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    bio: 'Midnight Blue note modal improvisation recorded in an underground Shinjuku jazz bar.',
    isPopularityHidden: true, // POPULARITY HIDDEN (Blind Judged)
    popularityStats: {
      votes: '63.9K',
      views: '410K',
      rank: '#5 Jazz',
      likes: '38.2K',
      trendingTag: 'Midnight Sax Improv',
    },
    communityScores: { presence: 9.4, originality: 9.2, craft: 9.5 },
    comments: [
      {
        author: 'Kenji Sato',
        role: 'Jazz Club Owner',
        text: 'Sub-tone breath control in the lower register is sublime. Coltrane energy.',
        time: '34m ago',
      },
    ],
  },
  {
    id: 'aarav-singhania',
    topDuration: '0:54',
    timecode: '00:54 / 01:00',
    totalSeconds: 60,
    initialSeconds: 54,
    artistName: 'Aarav Singhania',
    role: 'Handpan & Sound Sculptor',
    location: 'Goa, India',
    tags: ['#handpan', '#percussion', '#meditative'],
    category: 'For You',
    genre: 'Classical Fusion',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-musician-playing-an-acoustic-instrument-42617-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    bio: 'D Kurd scale metallic harmonic frequencies performed live at cliffside twilight.',
    isPopularityHidden: false, // POPULARITY SHOWING (Requested by user)
    popularityStats: {
      votes: '119.4K',
      views: '980K',
      rank: '#1 Ambient Sound',
      likes: '91.2K',
      trendingTag: 'Meditative Flow',
    },
    communityScores: { presence: 9.5, originality: 9.4, craft: 9.6 },
    comments: [
      {
        author: 'Pooja Iyer',
        role: 'Sound Healer',
        text: 'The resonance envelops you immediately. Pure acoustic bliss.',
        time: '1h ago',
      },
    ],
  },
  {
    id: 'chloe-dubois',
    topDuration: '0:50',
    timecode: '00:50 / 01:00',
    totalSeconds: 60,
    initialSeconds: 50,
    artistName: 'Chloé Dubois',
    role: 'Aerial Silk Acrobat',
    location: 'Montreal, Canada',
    tags: ['#aerial', '#silk', '#movement'],
    category: 'Live',
    genre: 'Urban Movement',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'Cirque-level suspension and 8-meter freefall drops filmed with single static wide lens.',
    isPopularityHidden: true, // POPULARITY HIDDEN (Blind Judged)
    popularityStats: {
      votes: '88.7K',
      views: '710K',
      rank: '#2 Aerial Movement',
      likes: '66.4K',
      trendingTag: 'Zero-Gravity Drop',
    },
    communityScores: { presence: 9.7, originality: 9.1, craft: 9.8 },
    comments: [
      {
        author: 'Luc Tremblay',
        role: 'Circus Director',
        text: 'Flawless ankle lock release and rotation speed control.',
        time: '2h ago',
      },
    ],
  },
  {
    id: 'reyansh-malik',
    topDuration: '0:53',
    timecode: '00:53 / 01:00',
    totalSeconds: 60,
    initialSeconds: 53,
    artistName: 'Reyansh Malik',
    role: 'Underground Hip-Hop MC',
    location: 'Delhi, India',
    tags: ['#rap', '#hiphop', '#freestyle'],
    category: 'For You',
    genre: 'Spoken Word',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-singer-singing-into-a-microphone-in-a-studio-42588-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    bio: 'Polysyllabic rhyming in Hindi & Urdu over raw 90 BPM boom-bap recorded in one continuous breath.',
    isPopularityHidden: false, // POPULARITY SHOWING (Requested by user)
    popularityStats: {
      votes: '264.1K',
      views: '3.1M',
      rank: '#1 Trending HipHop',
      likes: '228K',
      trendingTag: 'Top Hindi Freestyle',
    },
    communityScores: { presence: 9.6, originality: 9.7, craft: 9.4 },
    comments: [
      {
        author: 'Seedhe Maut Fan',
        role: 'Verified Listener',
        text: 'The multi-rhyme schemes and delivery cadence are unmatched in the scene right now.',
        time: '12m ago',
      },
    ],
  },
  {
    id: 'sofia-almansoor',
    topDuration: '0:58',
    timecode: '00:58 / 01:00',
    totalSeconds: 60,
    initialSeconds: 58,
    artistName: 'Sofia Al-Mansoor',
    role: 'Arabic Oud Virtuoso',
    location: 'Dubai, UAE',
    tags: ['#oud', '#arabicmusic', '#ambient'],
    category: 'Live',
    genre: 'Classical Fusion',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-musician-playing-an-acoustic-instrument-42617-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    bio: 'Modern 11-string fretless Oud performance weaving classical Maqam Hijaz with cinematic delays.',
    isPopularityHidden: true, // POPULARITY HIDDEN (Blind Judged)
    popularityStats: {
      votes: '104.2K',
      views: '890K',
      rank: '#3 World Music',
      likes: '79.1K',
      trendingTag: 'Desert Maqam',
    },
    communityScores: { presence: 9.5, originality: 9.5, craft: 9.7 },
    comments: [
      {
        author: 'Tariq Al-Saleh',
        role: 'Composer',
        text: 'Fretless microtonal intonation was razor sharp. Sublime touch.',
        time: '1h ago',
      },
    ],
  },
];
