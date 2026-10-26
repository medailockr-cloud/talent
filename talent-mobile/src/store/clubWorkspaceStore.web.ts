import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  requestMembership,
  reviewMembership,
  clubRequestId,
  validActivity,
  safePerformanceLink,
  type WorkspaceClub,
  type ClubRequest,
  type ClubActivity,
} from '../utils/clubWorkspace';

interface State {
  edits: Record<string, Partial<WorkspaceClub>>;
  requests: Record<string, ClubRequest>;
  activities: ClubActivity[];
  participation: Record<string, 'Watch' | 'Participate'>;
  submissions: Record<string, { url: string; note: string }>;
  hidden: string[];
  editClub: (id: string, values: Partial<WorkspaceClub>) => void;
  request: (club: WorkspaceClub, role: 'Fan' | 'Performer', note: string, name: string) => ClubRequest;
  review: (club: WorkspaceClub, actor: number, id: string, status: 'accepted' | 'declined') => ClubRequest;
  withdraw: (id: string) => void;
  sampleApplicant: (club: WorkspaceClub, actor: number) => void;
  removeMember: (club: WorkspaceClub, actor: number, userId: number) => void;
  addActivity: (a: ClubActivity) => void;
  acceptExchange: (id: string, club: WorkspaceClub, actor: number) => void;
  participate: (id: string, role: 'Watch' | 'Participate') => void;
  cancelParticipation: (id: string) => void;
  submit: (id: string, url: string, note: string) => void;
  toggleVisibility: (id: string) => void;
}

export const useClubWorkspaceStore = create<State>()(
  persist(
    (set, get) => ({
      edits: {},
      requests: {},
      activities: [],
      participation: {},
      submissions: {},
      hidden: [],
      editClub: (id, values) =>
        set((s) => ({ edits: { ...s.edits, [id]: { ...s.edits[id], ...values } } })),
      request: (club, role, note, name) => {
        const id = clubRequestId(club.id, 999),
          old = get().requests[id];
        if (old && old.status !== 'declined') return old;
        const r = requestMembership(club, 999, name, role, note);
        set((s) => ({ requests: { ...s.requests, [id]: r } }));
        return r;
      },
      review: (club, actor, id, status) => {
        const old = get().requests[id];
        if (!old) throw new Error('Request not found.');
        const r = reviewMembership(actor, club, old, status);
        set((s) => ({ requests: { ...s.requests, [id]: r } }));
        return r;
      },
      withdraw: (id) =>
        set((s) => ({
          requests: Object.fromEntries(
            Object.entries(s.requests).filter(([, r]) => r.clubId !== id || r.userId !== 999)
          ),
        })),
      sampleApplicant: (club, actor) => {
        if (actor !== club.ownerId) throw new Error('Owner required.');
        const r = requestMembership(
          club,
          2000,
          'Demo applicant',
          'Performer',
          'A sample introduction for testing host review.'
        );
        set((s) => ({ requests: { ...s.requests, [r.id]: { ...r, status: 'pending' } } }));
      },
      removeMember: (club, actor, userId) => {
        const id = clubRequestId(club.id, userId),
          r = get().requests[id];
        if (actor !== club.ownerId || userId === actor || r?.status !== 'accepted')
          throw new Error('Only the owner can remove another accepted member.');
        set((s) => ({ requests: { ...s.requests, [id]: { ...r, status: 'declined' } } }));
      },
      addActivity: (a) => {
        if (!validActivity(a))
          throw new Error('Add a future date, title, location, brief and a partner for exchanges.');
        set((s) => ({ activities: [a, ...s.activities] }));
      },
      acceptExchange: (id, club, actor) => {
        const a = get().activities.find((a) => a.id === id);
        if (!a || a.kind !== 'Club exchange' || a.partnerId !== club.id || actor !== club.ownerId)
          throw new Error('Only the invited partner owner can accept.');
        set((s) => ({
          activities: s.activities.map((a) => (a.id === id ? { ...a, exchangeStatus: 'confirmed' } : a)),
        }));
      },
      participate: (id, role) =>
        set((s) => ({ participation: { ...s.participation, [id]: role } })),
      cancelParticipation: (id) =>
        set((s) => ({
          participation: Object.fromEntries(Object.entries(s.participation).filter(([key]) => key !== id)),
        })),
      submit: (id, url, note) => {
        if (!safePerformanceLink(url) || note.trim().length < 3 || note.length > 500)
          throw new Error('Add a valid HTTPS link and a short note.');
        set((s) => ({ submissions: { ...s.submissions, [id]: { url, note } } }));
      },
      toggleVisibility: (id) =>
        set((s) => ({
          hidden: s.hidden.includes(id) ? s.hidden.filter((x) => x !== id) : [...s.hidden, id],
        })),
    }),
    { name: 'talent-club-workspace-v1', storage: createJSONStorage(() => localStorage) }
  )
);
