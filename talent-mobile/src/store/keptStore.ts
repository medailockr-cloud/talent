import { create } from 'zustand';
import { api } from '../utils/api';

interface KeptState {
  keptRecord: Record<string, boolean>;
  keptIds: Set<string>;
  keptVideos: any[];
  isLoading: boolean;
  hasLoaded: boolean;
  isKept: (id: string | number) => boolean;
  toggleKeep: (video: any) => Promise<boolean>;
  fetchKept: () => Promise<void>;
  initializeFromFeed: (feedVideos: any[]) => void;
}

const getInitialKept = (): { record: Record<string, boolean>; idSet: Set<string>; videos: any[] } => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('talent_kept_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const record: Record<string, boolean> = {};
          const idSet = new Set<string>();
          parsed.forEach((v: any) => {
            const vid = String(v.id);
            record[vid] = true;
            idSet.add(vid);
          });
          return { record, idSet, videos: parsed };
        }
      }
    }
  } catch (e) {}
  return { record: {}, idSet: new Set<string>(), videos: [] };
};

const saveToLocalStorage = (videos: any[]) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('talent_kept_videos', JSON.stringify(videos));
    }
  } catch (e) {}
};

const initial = getInitialKept();

export const useKeptStore = create<KeptState>((set, get) => ({
  keptRecord: initial.record,
  keptIds: initial.idSet,
  keptVideos: initial.videos,
  isLoading: false,
  hasLoaded: false,

  isKept: (id: string | number) => {
    return Boolean(get().keptRecord[String(id)]);
  },

  initializeFromFeed: (feedVideos: any[]) => {
    if (!feedVideos || !Array.isArray(feedVideos)) return;
    const currentRecord = { ...get().keptRecord };
    const currentIds = new Set(get().keptIds);
    const newVideos = [...get().keptVideos];
    let changed = false;

    feedVideos.forEach((v) => {
      const vid = String(v.id);
      if ((v.isSaved || v.isKept) && !currentRecord[vid]) {
        currentRecord[vid] = true;
        currentIds.add(vid);
        if (!newVideos.some(existing => String(existing.id) === vid)) {
          newVideos.push({ ...v, isSaved: true, isKept: true });
        }
        changed = true;
      }
    });

    if (changed) {
      saveToLocalStorage(newVideos);
      set({ keptRecord: currentRecord, keptIds: currentIds, keptVideos: newVideos });
    }
  },

  fetchKept: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/videos/saved');
      const list = Array.isArray(res.data?.videos) ? res.data.videos : [];
      
      const record: Record<string, boolean> = {};
      const idSet = new Set<string>();
      const combined = [...list];

      // Merge local items that may not have arrived at the server yet
      get().keptVideos.forEach((local) => {
        const lid = String(local.id);
        if (get().keptRecord[lid] && !combined.some(c => String(c.id) === lid)) {
          combined.push(local);
        }
      });

      combined.forEach((v) => {
        const vid = String(v.id);
        record[vid] = true;
        idSet.add(vid);
      });

      saveToLocalStorage(combined);
      set({ 
        keptVideos: combined, 
        keptRecord: record, 
        keptIds: idSet,
        isLoading: false, 
        hasLoaded: true 
      });
    } catch (err) {
      console.error('Error fetching kept videos:', err);
      set({ isLoading: false, hasLoaded: true });
    }
  },

  toggleKeep: async (video: any) => {
    const vid = String(video.id);
    const wasKept = Boolean(get().keptRecord[vid]);
    const willKeep = !wasKept;

    const nextRecord = { ...get().keptRecord };
    const nextIds = new Set(get().keptIds);
    let nextVideos = [...get().keptVideos];

    if (willKeep) {
      nextRecord[vid] = true;
      nextIds.add(vid);
      if (!nextVideos.some(v => String(v.id) === vid)) {
        nextVideos = [{ ...video, isSaved: true, isKept: true }, ...nextVideos];
      }
    } else {
      delete nextRecord[vid];
      nextIds.delete(vid);
      nextVideos = nextVideos.filter(v => String(v.id) !== vid);
    }

    // Optimistically update everywhere
    saveToLocalStorage(nextVideos);
    set({ keptRecord: nextRecord, keptIds: nextIds, keptVideos: nextVideos });

    try {
      const res = await api.post(`/videos/${video.id}/save`);
      // If server returned status and it differed, reconcile
      if (res.data?.saved !== undefined && Boolean(res.data.saved) !== willKeep) {
        const serverSaved = Boolean(res.data.saved);
        if (serverSaved) {
          nextRecord[vid] = true;
          nextIds.add(vid);
          if (!nextVideos.some(v => String(v.id) === vid)) {
            nextVideos = [{ ...video, isSaved: true, isKept: true }, ...nextVideos];
          }
        } else {
          delete nextRecord[vid];
          nextIds.delete(vid);
          nextVideos = nextVideos.filter(v => String(v.id) !== vid);
        }
        saveToLocalStorage(nextVideos);
        set({ keptRecord: nextRecord, keptIds: nextIds, keptVideos: nextVideos });
      }
      return willKeep;
    } catch (err) {
      console.error('Failed to toggle save on server:', err);
      // Revert if network error
      const revertRecord = { ...get().keptRecord };
      const revertIds = new Set(get().keptIds);
      let revertVideos = [...get().keptVideos];
      if (willKeep) {
        delete revertRecord[vid];
        revertIds.delete(vid);
        revertVideos = revertVideos.filter(v => String(v.id) !== vid);
      } else {
        revertRecord[vid] = true;
        revertIds.add(vid);
        if (!revertVideos.some(v => String(v.id) === vid)) {
          revertVideos = [{ ...video, isSaved: true, isKept: true }, ...revertVideos];
        }
      }
      saveToLocalStorage(revertVideos);
      set({ keptRecord: revertRecord, keptIds: revertIds, keptVideos: revertVideos });
      return wasKept;
    }
  },
}));

// Eager auto-fetch on mount
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useKeptStore.getState().fetchKept();
  }, 50);
}
