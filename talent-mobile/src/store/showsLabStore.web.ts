import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Club } from '../utils/communityCatalogue';

export type LocalClub = Club & {
  kind: 'Artist-led' | 'Local community' | 'Learning studio';
  ownerId: number;
};

export type ClubPost = {
  authorName?: string;
  id: string;
  clubId: string;
  kind: 'Update' | 'Performance' | 'Collaboration';
  text: string;
  performanceId?: string;
  performanceTitle?: string;
  createdAt: string;
};

export type Session = {
  id: string;
  clubId: string;
  title: string;
  date: string;
  format: 'Online' | 'In person';
  location: string;
};

export type ShowDraft = {
  id: string;
  title: string;
  format: 'Online' | 'In person';
  location: string;
  date: string;
  brief: string;
};

export type OpportunityApplication = {
  performanceId: string;
  performanceTitle: string;
  note: string;
  createdAt: string;
};

interface ShowsLabState {
  tickets: Record<string, { quantity: number; total: number; createdAt: string }>;
  reserve: (id: string, quantity: number, total: number) => void;
  cancelTicket: (id: string) => void;
  clubs: LocalClub[];
  posts: ClubPost[];
  sessions: Session[];
  drafts: ShowDraft[];
  saved: string[];
  opportunityApplications: Record<string, OpportunityApplication>;
  addClub: (club: LocalClub) => void;
  addPost: (post: ClubPost) => void;
  addSession: (session: Session) => void;
  saveDraft: (draft: ShowDraft) => void;
  toggleSaved: (id: string) => void;
  applyOpportunity: (id: string, application: OpportunityApplication) => void;
  withdrawOpportunity: (id: string) => void;
}

export const useShowsLabStore = create<ShowsLabState>()(
  persist(
    (set) => ({
      tickets: {},
      reserve: (id, quantity, total) =>
        set((s) => ({
          tickets: {
            ...s.tickets,
            [id]: { quantity, total, createdAt: new Date().toISOString() },
          },
        })),
      cancelTicket: (id) =>
        set((s) => ({
          tickets: Object.fromEntries(Object.entries(s.tickets).filter(([key]) => key !== id)),
        })),
      clubs: [],
      posts: [],
      sessions: [],
      drafts: [],
      saved: [],
      opportunityApplications: {},
      addClub: (club) => set((s) => ({ clubs: [club, ...s.clubs] })),
      addPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),
      addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
      saveDraft: (draft) =>
        set((s) => ({
          drafts: [draft, ...s.drafts.filter((d) => d.id !== draft.id)],
        })),
      toggleSaved: (id) =>
        set((s) => ({
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
        })),
      applyOpportunity: (id, application) =>
        set((s) => ({
          opportunityApplications: { ...s.opportunityApplications, [id]: application },
        })),
      withdrawOpportunity: (id) =>
        set((s) => ({
          opportunityApplications: Object.fromEntries(
            Object.entries(s.opportunityApplications).filter(([key]) => key !== id)
          ),
        })),
    }),
    { name: 'talent-shows-lab-v1', storage: createJSONStorage(() => localStorage) }
  )
);
