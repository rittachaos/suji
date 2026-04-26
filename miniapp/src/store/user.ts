import { create } from 'zustand';
import { fetchCurrentUser, loginWithWechat } from '@/services/modules/auth';
import { SessionUser } from '@/types/api';
import { storage } from '@/utils/storage';

interface UserState {
  user: SessionUser | null;
  loading: boolean;
  bootstrap: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  async bootstrap() {
    const token = storage.getToken();
    if (!token) {
      return;
    }

    set({ loading: true });
    try {
      const user = await fetchCurrentUser();
      set({ user, loading: false });
    } catch {
      storage.clearToken();
      set({ user: null, loading: false });
    }
  },
  async login() {
    set({ loading: true });
    try {
      const result = await loginWithWechat();
      storage.setToken(result.token);
      set({ user: result.user, loading: false });
    } catch {
      set({ loading: false });
      throw new Error('Login failed');
    }
  },
  logout() {
    storage.clearToken();
    set({ user: null });
  },
}));
