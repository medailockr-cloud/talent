import { clubs, type Club } from './communityCatalogue';

export type WorkspaceClub = Club & {
  ownerId: number;
  logoUrl?: string;
  coverUrl?: string;
  joinPolicy: 'open' | 'approval';
};

export type ClubRequest = {
  id: string;
  clubId: string;
  userId: number;
  name: string;
  role: 'Fan' | 'Performer';
  note: string;
  status: 'pending' | 'accepted' | 'declined';
};

export type ClubActivity = {
  id: string;
  clubId: string;
  title: string;
  kind: 'Practice' | 'Challenge' | 'Club exchange';
  format: 'Online' | 'In person';
  date: string;
  location: string;
  brief: string;
  partnerId?: string;
  exchangeStatus?: 'proposed' | 'confirmed';
};

const covers = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520523839898-50712825e3a7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
];

export const workspaceClubs: WorkspaceClub[] = clubs.map((c, i) => ({
  ...c,
  ownerId: 101 + i,
  joinPolicy: i % 2 === 0 ? 'approval' : 'open',
  coverUrl: covers[i % covers.length],
}));

export const clubRequestId = (clubId: string, userId: number) => `${clubId}:${userId}`;

export function requestMembership(
  club: WorkspaceClub,
  userId: number,
  name: string,
  role: 'Fan' | 'Performer',
  note: string
): ClubRequest {
  if (!name.trim() || !['Fan', 'Performer'].includes(role) || note.length > 500) {
    throw new Error('Choose a role and keep your introduction under 500 characters.');
  }
  return {
    id: clubRequestId(club.id, userId),
    clubId: club.id,
    userId,
    name,
    role,
    note: note.trim(),
    status: club.joinPolicy === 'open' ? 'accepted' : 'pending',
  };
}

export function reviewMembership(
  actor: number,
  club: WorkspaceClub,
  r: ClubRequest,
  status: 'accepted' | 'declined'
) {
  if (actor !== club.ownerId || r.clubId !== club.id || r.status !== 'pending' || !['accepted', 'declined'].includes(status)) {
    throw new Error('Only the owner can review a pending request.');
  }
  return { ...r, status };
}

export function safePerformanceLink(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password;
  } catch {
    return false;
  }
}

export function validActivity(a: ClubActivity, now = Date.now()) {
  return (
    ['Practice', 'Challenge', 'Club exchange'].includes(a.kind) &&
    ['Online', 'In person'].includes(a.format) &&
    a.title.trim().length >= 3 &&
    a.title.length <= 100 &&
    a.brief.trim().length >= 10 &&
    a.brief.length <= 1000 &&
    a.location.trim().length >= 3 &&
    Number.isFinite(Date.parse(a.date)) &&
    Date.parse(a.date) > now &&
    (a.kind !== 'Club exchange' || Boolean(a.partnerId && a.partnerId !== a.clubId))
  );
}

export function clubAffiliations(
  all: WorkspaceClub[],
  memberships: Record<string, string>,
  userId: number,
  hidden: string[] = []
) {
  return {
    owned: all.filter((c) => c.ownerId === userId && !hidden.includes(c.id)),
    joined: all.filter((c) => c.ownerId !== userId && memberships[c.id] && !hidden.includes(c.id)),
  };
}

export const sampleActivities: ClubActivity[] = [
  {
    id: 'voices-practice',
    clubId: 'voices',
    title: 'Unplugged practice circle',
    kind: 'Practice',
    format: 'Online',
    date: '2026-11-03T19:00:00+05:30',
    location: 'Club online room · preview',
    brief: 'Bring one verse, listen to another member and exchange constructive feedback.',
  },
  {
    id: 'voices-challenge',
    clubId: 'voices',
    title: 'One verse. Your original voice.',
    kind: 'Challenge',
    format: 'Online',
    date: '2026-11-10T20:00:00+05:30',
    location: 'Club challenge board',
    brief: 'Share an original 60-second performance link and explain one creative choice.',
  },
  {
    id: 'voices-exchange',
    clubId: 'voices',
    partnerId: 'rhythm',
    title: 'Listening Room × Rhythm Collective',
    kind: 'Club exchange',
    format: 'Online',
    date: '2026-11-21T18:00:00+05:30',
    location: 'Sample joint showcase',
    brief: 'Two clubs interpret one creative brief. Each host chooses their performers. No paid votes or guaranteed wins.',
    exchangeStatus: 'confirmed',
  },
  {
    id: 'movement-practice',
    clubId: 'movement',
    title: 'The eight-count workshop',
    kind: 'Practice',
    format: 'In person',
    date: '2026-11-06T18:30:00+05:30',
    location: 'Sample studio · Mumbai',
    brief: 'Practise a short sequence, watch another member and bring your own variation.',
  },
];
