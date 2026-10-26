import type { ClubEvent } from './communityCatalogue';

export const eventDetails: Record<
  string,
  { price: number; duration: string; slots: number; deadline: string; subtitle: string }
> = {
  'roots-night': { price: 349, duration: '90 minutes', slots: 2, deadline: '30 Oct', subtitle: 'Stories, strings and original voices.' },
  'indie-faceoff': { price: 0, duration: '60 minutes', slots: 4, deadline: '24 Nov', subtitle: 'Different sounds. One shared stage.' },
  'magic-closeup': { price: 249, duration: '60 minutes', slots: 3, deadline: '25 Nov', subtitle: 'A closer look at the impossible.' },
  'open-room': { price: 299, duration: '90 minutes', slots: 4, deadline: '3 Nov', subtitle: 'Original voices. An intimate stage.' },
  'dance-exchange': { price: 0, duration: '60 minutes', slots: 6, deadline: '5 Nov', subtitle: 'Your movement, in good company.' },
  'comedy-room': { price: 199, duration: '75 minutes', slots: 3, deadline: '10 Nov', subtitle: 'New material. A room that listens.' },
  'frame-room': { price: 0, duration: '60 minutes', slots: 5, deadline: '12 Nov', subtitle: 'One scene. A world of possibility.' },
  'club-exchange': { price: 0, duration: '90 minutes', slots: 8, deadline: '17 Nov', subtitle: 'Two clubs. One shared stage.' },
  'poetry-room': { price: 0, duration: '60 minutes', slots: 4, deadline: '18 Nov', subtitle: 'Words that stay with you.' },
};

export const clubKinds: Record<string, string> = {
  voices: 'Artist-led',
  movement: 'Artist-led',
  comedy: 'Local community',
  frames: 'Creator collective',
  rhythm: 'Learning studio',
  words: 'Local community',
};

export type Opportunity = {
  id: string;
  title: string;
  kind: 'Open lineup' | 'Collaboration' | 'Sponsor brief';
  category: string;
  city: string;
  clubId: string;
  deadline: string;
  reward: string;
  brief: string;
  requirements: string[];
  eventId?: string;
};

export const opportunities: Opportunity[] = [
  {
    id: 'first-stage',
    title: 'Your first original set',
    kind: 'Open lineup',
    category: 'Music',
    city: 'Bengaluru',
    clubId: 'voices',
    deadline: '3 Nov',
    reward: '4 sample stage slots',
    eventId: 'open-room',
    brief: 'A five-minute original acoustic performance. The host reviews your chosen recording and suitability for the evening, not your follower count.',
    requirements: ['One original performance', 'Available on 7 November', 'Solo or acoustic duo'],
  },
  {
    id: 'score-scene',
    title: 'A voice for a short film',
    kind: 'Collaboration',
    category: 'Film',
    city: 'Online',
    clubId: 'frames',
    deadline: '12 Nov',
    reward: 'Creative collaboration · unpaid',
    brief: 'A sample filmmaker brief seeking a singer and composer for an independent short. Agree ownership, credits, scope and payment before starting real work.',
    requirements: ['One relevant music performance', 'Short note on your style', 'Availability for a remote rehearsal'],
  },
  {
    id: 'movement-duo',
    title: 'Make a duet, across cities',
    kind: 'Collaboration',
    category: 'Dance',
    city: 'Online',
    clubId: 'movement',
    deadline: '5 Nov',
    reward: 'Creative collaboration · unpaid',
    brief: 'Two dancers interpret one original rhythm. Bring a short movement performance and an idea for a shared piece.',
    requirements: ['One dance performance', 'An original duet idea', 'Remote collaboration availability'],
  },
  {
    id: 'local-sponsor',
    title: 'Soundtrack a neighbourhood story',
    kind: 'Sponsor brief',
    category: 'Music',
    city: 'Bengaluru',
    clubId: 'rhythm',
    deadline: '17 Nov',
    reward: 'Sample paid brief · ₹5,000 budget',
    brief: 'Example sponsor brief for an original 30-second composition. No brand is actually commissioning this work. In the real product, payment, licensing and deliverables must be agreed before selection.',
    requirements: ['Original composition sample', 'Proposed direction and availability', 'Rights and licensing agreed before work'],
  },
];

export function matchShow(event: ClubEvent, query: string, format: string, city: string) {
  const q = query.trim().toLowerCase();
  return (
    (format === 'All' || event.format === format || (format === 'Online' && event.format === 'Club vs club')) &&
    (city === 'Everywhere' || event.location.toLowerCase().includes(city.toLowerCase()) || (city === 'Online' && event.format !== 'In person')) &&
    `${event.title} ${event.category} ${event.location}`.toLowerCase().includes(q)
  );
}

export function validFutureDate(value: string, now = new Date()) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > now.getTime();
}

/** Demo catalogue times are displayed in IST. Invalid dates sort last. */
export function showStartTime(event: ClubEvent) {
  const [day, month] = event.date.split(' ');
  const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month) + 1;
  const time = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (!monthIndex || !time) return Infinity;
  const hour = (Number(time[1]) % 12) + (time[3] === 'PM' ? 12 : 0);
  const iso = `2026-${String(monthIndex).padStart(2, '0')}-${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${time[2]}:00+05:30`;
  const value = new Date(iso).getTime();
  return Number.isFinite(value) ? value : Infinity;
}

export type ShowBrowseOptions = {
  query: string;
  format: string;
  city: string;
  window: 'any' | '7' | '30';
  freeOnly: boolean;
  sort: 'soonest' | 'price';
};

export function discoverShows(events: ClubEvent[], options: ShowBrowseOptions, now = Date.now()) {
  return events
    .filter((event) => {
      if (!matchShow(event, options.query, options.format, options.city)) return false;
      if (options.freeOnly && (eventDetails[event.id]?.price ?? Infinity) !== 0) return false;
      const start = showStartTime(event);
      return options.window === 'any' || (Number.isFinite(start) && start >= now && start <= now + Number(options.window) * 86400000);
    })
    .sort((a, b) =>
      options.sort === 'price'
        ? (eventDetails[a.id]?.price ?? Infinity) - (eventDetails[b.id]?.price ?? Infinity) || showStartTime(a) - showStartTime(b)
        : showStartTime(a) - showStartTime(b) || a.title.localeCompare(b.title)
    );
}
