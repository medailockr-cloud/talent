export interface ShowItineraryItem {
  time: string;
  desc: string;
}

export interface ShowAttendee {
  name: string;
  avatar: string;
  role: string;
}

export interface ShowReview {
  id: string;
  author: string;
  avatar: string;
  role: string;
  stars: number;
  comment: string;
  time: string;
  verified: boolean;
}

export interface UpcomingShowItem {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  artistRole: string;
  tagline: string;
  genre: string;
  city: 'Bengaluru' | 'Mumbai' | 'Delhi NCR' | 'Goa' | 'Kochi';
  venue: string;
  venueAddress: string;
  transit: string;
  parking: string;
  landmarks: string;
  date: string;
  time: string;
  day: string;
  month: string;
  price: string;
  ticketPriceNum: number;
  status: 'Confirmed Live' | 'Selling Fast' | '12 Passes Left' | 'VIP Only' | 'Intimate';
  attendeesCount: number;
  attendees: ShowAttendee[];
  thumb: string;
  teaserVideo: string;
  stagePhotos: string[];
  seating: string;
  itinerary: ShowItineraryItem[];
  setlist: string[];
  ageLimit: string;
  dressCode: string;
  isLive?: boolean;
}

export interface PreviousShowItem {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  artistRole: string;
  subtitle: string;
  date: string;
  city: 'Bengaluru' | 'Mumbai' | 'Delhi NCR' | 'Goa' | 'Kochi' | 'Pune';
  venue: string;
  venueAddress: string;
  capacity: string;
  visitorsCount: number;
  rating: number;
  ratingCount: number;
  dimensionRatings: {
    sound: number;
    atmosphere: number;
    craft: number;
    comfort: number;
    value: number;
  };
  thumb: string;
  videoHighlight: string;
  photos: string[];
  setlistPlayed: string[];
  alumniAttendees: ShowAttendee[];
  visitorReviews: ShowReview[];
}

export const UPCOMING_SHOWS_CATALOG: UpcomingShowItem[] = [
  {
    id: 'show-aarav-indiranagar',
    title: 'Aarav Nair: Live at The Next Stage',
    artistId: 'aarav-nair',
    artistName: 'Aarav Nair',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    artistRole: 'Singer • Songwriter',
    tagline: 'Intimate Candlelight Acoustic & Raw Vocals',
    genre: 'Acoustic Indie',
    city: 'Bengaluru',
    venue: 'The Next Stage, Indiranagar',
    venueAddress: '142/B, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    transit: 'Indiranagar Metro Station (Purple Line) Gate 2 — 350 meters walk (5 mins)',
    parking: 'Valet parking available at Venue Entrance Gate B. Street parking on 12th Main after 7 PM.',
    landmarks: 'Right opposite 100 Feet Road junction, adjacent to Toit Brewpub',
    date: 'Friday, 24 Oct 2026',
    time: '8:00 PM IST (Doors open 7:15 PM)',
    day: '24',
    month: 'OCT',
    price: '₹799',
    ticketPriceNum: 799,
    status: 'Selling Fast',
    attendeesCount: 438,
    attendees: [
      { name: 'Dr. Ananya K.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', role: 'Calibrated Ear Judge' },
      { name: 'Rohan Dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', role: 'Audio Engineer' },
      { name: 'Meera Sen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', role: 'Stage Producer' },
      { name: 'Vikram Joshi', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', role: 'Verified Backer' },
      { name: 'Shreya Patel', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', role: 'Music Journalist' },
    ],
    thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    teaserVideo: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
    stagePhotos: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=80',
    ],
    seating: 'Tiered amphitheatre floor seating on plush linen floor cushions, plus reserved front-row Judge tables with dedicated in-ear monitor tap feeds.',
    itinerary: [
      { time: '07:15 PM', desc: 'Doors open & Acoustic warm-up cocktail mixer' },
      { time: '07:45 PM', desc: 'Unplugged opening take: Maya Sen (Violin intro)' },
      { time: '08:15 PM', desc: 'Main Acoustic Stage Set: Aarav Nair (12-song journey)' },
      { time: '09:30 PM', desc: 'Judge blind critique session & Fan Q&A' },
      { time: '10:00 PM', desc: 'Curator wrap & Vinyl signing booth' },
    ],
    setlist: [
      '1. Kasoor (Acoustic Fingerstyle)',
      '2. Baarishein (Slow Vocal Swells)',
      '3. Amber Glow (Unreleased Single)',
      '4. Riha (Solo Fingerpicked Open-D)',
      '5. Kho Gaye Hum Kahan (Acoustic Duet)',
      '6. Midnight Rail (Encore Crowd Choir)',
    ],
    ageLimit: '16+ (Minors accompanied by guardian)',
    dressCode: 'Smart Casual / Indie Bohemian',
    isLive: false,
  },
  {
    id: 'show-kiara-kochi',
    title: 'Kiara Nair: Rhythm & Roots Live Showcase',
    artistId: 'kiara-nair',
    artistName: 'Kiara Nair',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    artistRole: 'Contemporary Dancer',
    tagline: 'Kalakshetra Floorwork meets Amber Silhouette Lighting',
    genre: 'Contemporary Dance',
    city: 'Kochi',
    venue: 'Pepper House Amphitheatre, Fort Kochi',
    venueAddress: 'Kalvathi Rd, Fort Kochi, Kochi, Kerala 682001',
    transit: 'Fort Kochi Ro-Ro Ferry Jetty — 400m walk. Water Metro Station 6 mins away.',
    parking: 'Free dockside parking along Kalvathi Road and Fort Kochi Parade Ground.',
    landmarks: 'Next to Cochin Spice Mart, facing the Vembanad harbour waters',
    date: 'Sunday, 02 Nov 2026',
    time: '6:30 PM IST (Sunset Showcase)',
    day: '02',
    month: 'NOV',
    price: '₹649',
    ticketPriceNum: 649,
    status: '12 Passes Left',
    attendeesCount: 320,
    attendees: [
      { name: 'Kavita Menon', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', role: 'Classical Choreographer' },
      { name: 'Arjun Menon', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', role: 'Live Accompanist' },
      { name: 'Devika Pillai', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', role: 'Movement Critic' },
    ],
    thumb: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
    teaserVideo: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4',
    stagePhotos: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=80',
    ],
    seating: 'Open-air heritage stone steps overlooking Fort Kochi backwaters with 360-degree acoustic stage surround.',
    itinerary: [
      { time: '06:00 PM', desc: 'Sunset harbour seating & Traditional tea ceremony' },
      { time: '06:30 PM', desc: 'Opening invocation: Tanpura & Live Percussion' },
      { time: '07:00 PM', desc: 'Rhythm & Roots: Solo Movement Piece by Kiara Nair' },
      { time: '08:00 PM', desc: 'Open stage discussion on modern classical fusion' },
    ],
    setlist: [
      '1. Prana (Breath Invocations)',
      '2. Mudra Transitions in Amber',
      '3. Floorwork Surge (60-Second Viral Take extended)',
      '4. Monsoon Drift (Live Percussion Dialogue)',
    ],
    ageLimit: 'All ages welcome',
    dressCode: 'Breathable Cotton / Kerala Traditional / Casual',
    isLive: false,
  },
  {
    id: 'show-sofar-bengaluru',
    title: 'Sofar Sounds Secret Living Room Sessions',
    artistId: 'aarav-nair',
    artistName: 'Aarav Nair & Secret Guests',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    artistRole: 'Multi-Artist Intimate Show',
    tagline: 'Location Disclosed 24h Prior to Ticket Holders',
    genre: 'Secret Acoustic Live',
    city: 'Bengaluru',
    venue: 'Secret Rooftop Loft, Koramangala',
    venueAddress: 'Koramangala 4th Block, Bengaluru, Karnataka 560034 (Exact GPS pin sent via SMS)',
    transit: 'Sony World Junction Koramangala (7 mins walk)',
    parking: 'Street parking available along 80ft Road.',
    landmarks: 'Near Bethany High School, Koramangala 4th Block',
    date: 'Sunday, 16 Nov 2026',
    time: '7:30 PM IST',
    day: '16',
    month: 'NOV',
    price: '₹899',
    ticketPriceNum: 899,
    status: 'Confirmed Live',
    attendeesCount: 540,
    attendees: [
      { name: 'Karthik Rao', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', role: 'Sofar City Lead' },
      { name: 'Tanya Roy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', role: 'Music Curator' },
    ],
    thumb: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=80',
    teaserVideo: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-acoustic-guitar-41584-large.mp4',
    stagePhotos: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    ],
    seating: 'BYO Cushion / Bohemian rugs and fairy-lit bean bags. Strictly non-amplified natural acoustics.',
    itinerary: [
      { time: '07:00 PM', desc: 'Secret doors open' },
      { time: '07:30 PM', desc: 'Act 1: Indie Singer-Songwriter spotlight' },
      { time: '08:15 PM', desc: 'Act 2: Aarav Nair Unplugged Take' },
      { time: '09:00 PM', desc: 'Act 3: Secret Duo Jam' },
    ],
    setlist: ['Unplugged 3-song raw takes', 'Fan-chosen requests only'],
    ageLimit: '18+',
    dressCode: 'Cosy / Bring warm layers',
    isLive: true,
  },
  {
    id: 'show-mumbai-warehouse',
    title: 'G5A Warehouse Acoustic Sessions',
    artistId: 'aarav-nair',
    artistName: 'Aarav Nair',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    artistRole: 'Singer • Songwriter',
    tagline: 'Industrial Blackbox Acoustics & Spatial Audio',
    genre: 'Acoustic / Spatial Sound',
    city: 'Mumbai',
    venue: 'G5A Warehouse, Mahalaxmi',
    venueAddress: 'G-5/A, Laxmi Mills Estate, Shakti Mills Ln, Mahalakshmi, Mumbai, Maharashtra 400011',
    transit: 'Mahalaxmi Station (Western Line) 700m / Lower Parel Monorail 900m',
    parking: 'Dedicated parking on Shakti Mills lane with security guidance.',
    landmarks: 'Behind Famous Studios, off Dr. E Moses Road',
    date: 'Saturday, 05 Dec 2026',
    time: '8:00 PM IST',
    day: '05',
    month: 'DEC',
    price: '₹999',
    ticketPriceNum: 999,
    status: 'VIP Only',
    attendeesCount: 680,
    attendees: [
      { name: 'Aditya Chopra', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', role: 'Sound Designer' },
      { name: 'Simran Bakshi', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', role: 'Curator' },
    ],
    thumb: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    teaserVideo: 'https://assets.mixkit.co/videos/preview/mixkit-singer-singing-into-a-microphone-in-a-studio-41484-large.mp4',
    stagePhotos: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    ],
    seating: 'Raw blackbox theatre tier seating with L-Acoustics 360-degree spatial loudspeaker array.',
    itinerary: [
      { time: '07:30 PM', desc: 'Pre-show binaural listening experience' },
      { time: '08:00 PM', desc: 'Aarav Nair Live Spatial Acoustic Set' },
      { time: '09:30 PM', desc: 'Curator roundtable & Producer networking' },
    ],
    setlist: ['Acoustic orchestral re-arrangements of all 5 viral takes'],
    ageLimit: '18+',
    dressCode: 'Monochrome Minimal / Black attire encouraged',
    isLive: false,
  },
];

export const PREVIOUS_SHOWS_ARCHIVE: PreviousShowItem[] = [
  {
    id: 'past-nh7-weekender',
    title: 'Bacardi NH7 Weekender (The Acoustic Forest)',
    artistId: 'aarav-nair',
    artistName: 'Aarav Nair',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    artistRole: 'Singer • Songwriter',
    subtitle: 'Festival Stage • 1,420 Verified Attendees',
    date: '14 Dec 2025',
    city: 'Pune',
    venue: 'Mahalakshmi Lawns, Pune',
    venueAddress: 'Nagar Road, Kharadi, Pune, Maharashtra 411014',
    capacity: 'Sold Out • 1,420 Capacity',
    visitorsCount: 1420,
    rating: 4.9,
    ratingCount: 342,
    dimensionRatings: {
      sound: 4.9,
      atmosphere: 5.0,
      craft: 4.9,
      comfort: 4.7,
      value: 4.9,
    },
    thumb: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80',
    videoHighlight: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
    photos: [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
    ],
    setlistPlayed: [
      '1. Kasoor (Acoustic Festival Edit)',
      '2. Baarishein (Full Crowd Singalong)',
      '3. Raabta (Fingerstyle Jam)',
      '4. Cold Coffee & Cigarettes',
      '5. Riha (Open-D Acoustic with Stompbox)',
      '6. Kho Gaye Hum Kahan (Encore with 1,400 phone flashlights)',
    ],
    alumniAttendees: [
      { name: 'Sahil K.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', role: 'Verified Festival Judge' },
      { name: 'Dr. Priya V.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', role: 'NH7 Weekender VIP' },
      { name: 'Rahul Sen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', role: 'Sound Engineer' },
    ],
    visitorReviews: [
      {
        id: 'rev-nh7-1',
        author: 'Nikhil Kashyap',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        role: 'Verified Festival Judge',
        stars: 5,
        comment: 'When Aarav started Kho Gaye Hum Kahan and paused his guitar, all 1,400 of us sang the chorus in unison in the dark. Absolute chills from start to finish.',
        time: '3 weeks ago',
        verified: true,
      },
      {
        id: 'rev-nh7-2',
        author: 'Ananya S.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        role: 'Ear Calibration Critic',
        stars: 5,
        comment: 'The vocal dynamics on an open-air stage were studio grade. No backing tracks, just one Taylor guitar and pure resonant pitch control.',
        time: '1 month ago',
        verified: true,
      },
      {
        id: 'rev-nh7-3',
        author: 'Sameer Sen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        role: 'Pune Music Guild',
        stars: 5,
        comment: 'The best unplugged set of NH7 2025 by far. Worth standing in the front row for 3 hours straight.',
        time: '1 month ago',
        verified: true,
      },
    ],
  },
  {
    id: 'past-prithvi-theatre',
    title: 'Prithvi Theatre Candlelight Sessions',
    artistId: 'aarav-nair',
    artistName: 'Aarav Nair',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    artistRole: 'Singer • Songwriter',
    subtitle: 'Zero Microphones • Natural Acoustic Dome',
    date: '18 Nov 2025',
    city: 'Mumbai',
    venue: 'Prithvi Theatre, Juhu',
    venueAddress: '20, Janki Kutir, Juhu Church Rd, Juhu, Mumbai, Maharashtra 400049',
    capacity: 'Strict 220 Seat Capacity (Sold out in 4 mins)',
    visitorsCount: 220,
    rating: 5.0,
    ratingCount: 198,
    dimensionRatings: {
      sound: 5.0,
      atmosphere: 5.0,
      craft: 5.0,
      comfort: 4.8,
      value: 5.0,
    },
    thumb: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    videoHighlight: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-acoustic-guitar-41584-large.mp4',
    photos: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    ],
    setlistPlayed: [
      '1. Midnight Whisper (Zero amplification acoustic take)',
      '2. Kasoor (Candlelight arrangement)',
      '3. Baarishein (Solo guitar and natural dome reverb)',
      '4. Dil Mere (Acoustic encore)',
    ],
    alumniAttendees: [
      { name: 'Zoya Merchant', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', role: 'Theatre Director' },
      { name: 'Kabeer S.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', role: 'Verified Critic' },
    ],
    visitorReviews: [
      {
        id: 'rev-prithvi-1',
        author: 'Divya Ranganathan',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        role: 'Verified Stage Critic',
        stars: 5,
        comment: 'No speakers, no pickups, no cables. Just a singer, a Taylor guitar, and 200 people holding their breath in the candlelight. One of the greatest musical evenings of my life.',
        time: '2 months ago',
        verified: true,
      },
      {
        id: 'rev-prithvi-2',
        author: 'Arjun Das',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        role: 'Acoustic Judge',
        stars: 5,
        comment: 'The silence between notes was as powerful as the music itself. Prithvi acoustics are holy, and Aarav honored them completely.',
        time: '2 months ago',
        verified: true,
      },
    ],
  },
  {
    id: 'past-the-humming-tree',
    title: 'The Humming Tree Unplugged Sessions',
    artistId: 'aarav-nair',
    artistName: 'Aarav Nair & Friends',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    artistRole: 'Singer • Songwriter',
    subtitle: 'Rooftop Stage • 380 Verified Attendees',
    date: '04 Oct 2025',
    city: 'Bengaluru',
    venue: 'The Humming Tree, Indiranagar',
    venueAddress: '949, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    capacity: 'Sold Out • 380 Capacity',
    visitorsCount: 380,
    rating: 4.8,
    ratingCount: 165,
    dimensionRatings: {
      sound: 4.8,
      atmosphere: 4.9,
      craft: 4.8,
      comfort: 4.6,
      value: 4.8,
    },
    thumb: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    videoHighlight: 'https://assets.mixkit.co/videos/preview/mixkit-singer-singing-into-a-microphone-in-a-studio-41484-large.mp4',
    photos: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    ],
    setlistPlayed: [
      '1. Baarishein (Bengaluru Rain Acoustic version)',
      '2. Kasoor (Duet with Meera Sen)',
      '3. Cold Coffee (Live loop pedal acoustic)',
      '4. Riha',
    ],
    alumniAttendees: [
      { name: 'Karan Mehra', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', role: 'Live Sound Curator' },
    ],
    visitorReviews: [
      {
        id: 'rev-humming-1',
        author: 'Rhea Chakraborty',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        role: 'Verified Attendee',
        stars: 5,
        comment: 'It started drizzling right as he began Baarishein, and nobody moved an inch. Everyone was singing with him under the rooftop umbrellas.',
        time: '4 months ago',
        verified: true,
      },
    ],
  },
];
