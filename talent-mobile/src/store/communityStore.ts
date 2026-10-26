import { withApplauseMoment, type ApplauseMoment, type ApplauseQuality } from '../utils/applauseMoments';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Role = 'Fan' | 'Performer';
interface CommunityState {
  backed: string[];
  applauded: string[];
  applauseMoments: Record<string, ApplauseMoment[]>;
  applaudMoment: (id: string, second: number, quality: ApplauseQuality) => void;
  removeApplauseMoment: (id: string, second: number) => void;
  toggleApplaud: (id: string) => void;
  memberships: Record<string, Role>;
  attending: Record<string, 'Online' | 'In person'>;
  applications: Record<string, string>;
  toggleBack: (id: string) => void;
  join: (id: string, role: Role) => void;
  leave: (id: string) => void;
  rsvp: (id: string, mode: 'Online' | 'In person') => void;
  cancel: (id: string) => void;
  apply: (id: string, performance: string) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      applauseMoments: {},
      applaudMoment: (id, second, quality) =>
        set((s) => ({
          applauseMoments: {
            ...s.applauseMoments,
            [id]: withApplauseMoment(s.applauseMoments?.[id] || [], second, quality),
          },
          applauded: [...new Set([...(s.applauded || []), id])],
        })),
      removeApplauseMoment: (id, second) =>
        set((s) => {
          const marks = (s.applauseMoments?.[id] || []).filter((m) => m.second !== second);
          return {
            applauseMoments: { ...s.applauseMoments, [id]: marks },
            applauded: marks.length ? s.applauded : s.applauded.filter((x) => x !== id),
          };
        }),
      backed: [],
      applauded: [],
      toggleApplaud: (id) =>
        set((s) => ({
          applauded: (s.applauded || []).includes(id)
            ? s.applauded.filter((x) => x !== id)
            : [...(s.applauded || []), id],
        })),
      memberships: {},
      attending: {},
      applications: {},
      toggleBack: (id) =>
        set((s) => ({
          backed: s.backed.includes(id) ? s.backed.filter((x) => x !== id) : [...s.backed, id],
        })),
      join: (id, role) =>
        set((s) => ({ memberships: { ...s.memberships, [id]: role } })),
      leave: (id) =>
        set((s) => ({
          memberships: Object.fromEntries(
            Object.entries(s.memberships).filter(([key]) => key !== id)
          ),
        })),
      rsvp: (id, mode) =>
        set((s) => ({ attending: { ...s.attending, [id]: mode } })),
      cancel: (id) =>
        set((s) => ({
          attending: Object.fromEntries(
            Object.entries(s.attending).filter(([key]) => key !== id)
          ),
        })),
      apply: (id, performance) =>
        set((s) => ({ applications: { ...s.applications, [id]: performance } })),
    }),
    { name: 'talent-community-lab-v1', storage: createJSONStorage(() => AsyncStorage) }
  )
);
