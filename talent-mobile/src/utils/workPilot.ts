/** Discovery Lab only. These records are never evidence of a real booking. */
export type Brief = {
  id: string;
  title: string;
  organizer: string;
  city: string;
  category: string;
  format: 'In person' | 'Online';
  date: string;
  deadline: string;
  fee: number;
  minutes: number;
  requirements: string;
  equipment: string;
  rights: string;
  cancellation: string;
  owner: boolean;
};

export type Application = {
  id: string;
  briefId: string;
  name: string;
  performanceId: string;
  performanceTitle: string;
  note: string;
  fee: number;
  status: 'Applied' | 'Shortlisted' | 'Offered' | 'Accepted' | 'Declined' | 'Withdrawn' | 'Completed';
  artistConfirmed: boolean;
  organizerConfirmed: boolean;
  messages: { role: 'Artist' | 'Organizer'; text: string; at: string }[];
  sample: boolean;
};

export type Passport = {
  skills: string;
  city: string;
  availability: string;
  fee: string;
  equipment: string;
  languages: string;
};

export const blankPassport: Passport = {
  skills: '',
  city: 'Bengaluru',
  availability: 'Not set',
  fee: '',
  equipment: '',
  languages: '',
};

export const pilotBriefs: Brief[] = [
  {
    id: 'acoustic-room',
    title: 'An acoustic evening, up close.',
    organizer: 'The Listening Room · fictional venue',
    city: 'Bengaluru',
    category: 'Singing',
    format: 'In person',
    date: '2026-11-21T19:00+05:30',
    deadline: '2026-11-14',
    fee: 6000,
    minutes: 45,
    requirements:
      'Solo singer or acoustic duo. Share a live vocal performance and a proposed set list. Kannada, Hindi or English repertoire welcome.',
    equipment: 'Venue PA and two microphones. Bring your instrument; soundcheck at 18:00 IST.',
    rights: 'Live performance only. Any recording or promotional reuse requires a separate agreement.',
    cancellation:
      'Illustrative terms: cancellation more than 7 days before the show has no fee; later cancellations require agreement. No payment is collected here.',
    owner: false,
  },
  {
    id: 'guitar-session',
    title: 'A guitar set for a small room.',
    organizer: 'Courtyard Sessions · fictional organizer',
    city: 'Bengaluru',
    category: 'Guitar',
    format: 'In person',
    date: '2026-11-28T18:30+05:30',
    deadline: '2026-11-18',
    fee: 4500,
    minutes: 30,
    requirements:
      'Fingerstyle or classical guitar. One uninterrupted recording; originals and clearly credited arrangements welcome.',
    equipment: 'Seated set, PA and DI supplied. Bring guitar and cables.',
    rights: 'No recording rights included. Artist retains ownership of submitted work.',
    cancellation: 'Proposed cancellation terms are agreed before either party confirms.',
    owner: false,
  },
  {
    id: 'online-showcase',
    title: 'Your original song. A listening audience.',
    organizer: 'First Listen · fictional showcase',
    city: 'Online',
    category: 'Music',
    format: 'Online',
    date: '2026-12-05T19:00+05:30',
    deadline: '2026-11-22',
    fee: 3000,
    minutes: 20,
    requirements:
      'Original music with a short introduction. Stable connection and a live audio test required.',
    equipment: 'Artist supplies microphone, headphones and reliable internet.',
    rights: 'Live online stream only; no replay or reuse permission included.',
    cancellation: 'Technical rehearsal required. Cancellation and rescheduling terms must be accepted in the offer.',
    owner: false,
  },
];

export function validateBrief(b: Brief, now = Date.now()) {
  if (
    ![b.title, b.organizer, b.city, b.category, b.requirements, b.equipment, b.rights, b.cancellation].every(
      (s) => typeof s === 'string' && s.trim()
    )
  )
    throw Error('Complete every brief field, including equipment, rights and cancellation terms.');
  if (!Number.isFinite(b.fee) || b.fee <= 0 || b.fee > 10000000)
    throw Error('Enter a positive total artist fee up to ₹1 crore.');
  if (!Number.isInteger(b.minutes) || b.minutes < 5 || b.minutes > 480)
    throw Error('Set length must be 5–480 minutes.');
  const event = Date.parse(b.date),
    close = Date.parse(b.deadline + 'T23:59:59+05:30');
  if (!Number.isFinite(event) || !Number.isFinite(close) || event <= now || close <= now || close >= event)
    throw Error('Choose a future deadline before the performance date.');
  if (!['Online', 'In person'].includes(b.format)) throw Error('Choose Online or In person.');
  return b;
}

export function transitionApplication(
  a: Application,
  action: 'shortlist' | 'offer' | 'accept' | 'decline' | 'withdraw' | 'confirm',
  role: 'Artist' | 'Organizer'
): Application {
  const next = { ...a };
  if (action === 'shortlist' && role === 'Organizer' && a.status === 'Applied') next.status = 'Shortlisted';
  else if (action === 'offer' && role === 'Organizer' && a.status === 'Shortlisted') next.status = 'Offered';
  else if (action === 'accept' && role === 'Artist' && a.status === 'Offered') next.status = 'Accepted';
  else if (action === 'decline' && role === 'Artist' && a.status === 'Offered') next.status = 'Declined';
  else if (action === 'withdraw' && role === 'Artist' && ['Applied', 'Shortlisted'].includes(a.status))
    next.status = 'Withdrawn';
  else if (action === 'confirm' && a.status === 'Accepted') {
    if (role === 'Artist') next.artistConfirmed = true;
    else next.organizerConfirmed = true;
    if (next.artistConfirmed && next.organizerConfirmed) next.status = 'Completed';
  } else throw Error('That action is not available at this stage.');
  return next;
}

export function applyToBrief(apps: Application[], brief: Brief, input: Application, now = Date.now()) {
  if (Date.parse(brief.deadline + 'T23:59:59+05:30') <= now)
    throw Error('Applications for this brief have closed.');
  if (
    !input.performanceId ||
    !input.performanceTitle ||
    !input.name.trim() ||
    !input.note.trim() ||
    !Number.isFinite(input.fee) ||
    input.fee <= 0
  )
    throw Error('Choose a performance, confirm your fee, and explain your availability.');
  if (apps.some((a) => a.briefId === brief.id && !a.sample && !['Withdrawn', 'Declined'].includes(a.status)))
    throw Error('You already have an active application for this brief.');
  return [...apps, input];
}

export const rupees = (n: number) => '₹' + n.toLocaleString('en-IN');
