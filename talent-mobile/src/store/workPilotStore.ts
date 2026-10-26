import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  applyToBrief,
  blankPassport,
  pilotBriefs,
  transitionApplication,
  validateBrief,
  type Application,
  type Brief,
  type Passport,
} from '../utils/workPilot';

interface WorkState {
  passport: Passport;
  briefs: Brief[];
  applications: Application[];
  savePassport: (p: Passport) => void;
  addBrief: (b: Brief) => void;
  apply: (b: Brief, a: Application) => void;
  advance: (
    id: string,
    action: Parameters<typeof transitionApplication>[1],
    role: 'Artist' | 'Organizer'
  ) => void;
  message: (id: string, role: 'Artist' | 'Organizer', text: string) => void;
  sampleApplicants: (briefId: string) => void;
}

export const useWorkPilotStore = create<WorkState>()(
  persist(
    (set) => ({
      passport: blankPassport,
      briefs: pilotBriefs,
      applications: [],
      savePassport: (passport) => set({ passport }),
      addBrief: (brief) => {
        validateBrief(brief);
        set((s) => ({ briefs: [brief, ...s.briefs] }));
      },
      apply: (brief, input) =>
        set((s) => ({ applications: applyToBrief(s.applications, brief, input) })),
      advance: (id, action, role) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? transitionApplication(a, action, role) : a
          ),
        })),
      message: (id, role, text) => {
        if (!text.trim() || text.trim().length > 1200)
          throw Error('Write a message of 1–1,200 characters.');
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  messages: [
                    ...a.messages,
                    { role, text: text.trim(), at: new Date().toISOString() },
                  ],
                }
              : a
          ),
        }));
      },
      sampleApplicants: (briefId) =>
        set((s) => {
          if (s.applications.some((a) => a.briefId === briefId && a.sample)) return {};
          const b = s.briefs.find((x) => x.id === briefId);
          if (!b) return {};
          return {
            applications: [
              ...s.applications,
              ...[
                {
                  name: 'Demo musician A',
                  performanceId: '31',
                  performanceTitle: 'Licensed guitar excerpt',
                },
                {
                  name: 'Demo musician B',
                  performanceId: '72',
                  performanceTitle: 'Licensed beatbox excerpt',
                },
              ].map((x, i) => ({
                ...x,
                id: 'sample-' + briefId + '-' + i,
                briefId,
                note: 'Fictional applicant for testing selection. Footage is licensed sample work, not owned by this persona.',
                fee: b.fee,
                status: 'Applied' as const,
                artistConfirmed: false,
                organizerConfirmed: false,
                messages: [],
                sample: true,
              })),
            ],
          };
        }),
    }),
    { name: 'talent-work-pilot-v1', storage: createJSONStorage(() => AsyncStorage) }
  )
);
