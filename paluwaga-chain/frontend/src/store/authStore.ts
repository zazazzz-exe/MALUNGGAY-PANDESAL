import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface AuthState {
  users: AuthUser[];
  currentUserId: string | null;
  isAuthenticated: boolean;
  activeUser: AuthUser | null;
  signUp: (input: { name: string; email: string; password: string }) => string;
  signIn: (input: { email: string; password: string }) => string;
  signOut: () => void;
}

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      isAuthenticated: false,
      activeUser: null,
      signUp: ({ name, email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        const trimmedName = name.trim();
        const trimmedPassword = password.trim();

        if (!trimmedName) {
          throw new Error("Name is required.");
        }

        if (!normalizedEmail) {
          throw new Error("Email is required.");
        }

        if (trimmedPassword.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const existing = get().users.find((user) => user.email === normalizedEmail);
        if (existing) {
          throw new Error("An account with this email already exists.");
        }

        const created: AuthUser = {
          id: crypto.randomUUID(),
          name: trimmedName,
          email: normalizedEmail,
          password: trimmedPassword
        };

        set((state) => ({
          users: [...state.users, created],
          currentUserId: created.id,
          isAuthenticated: true,
          activeUser: created
        }));

        return created.id;
      },
      signIn: ({ email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        const trimmedPassword = password.trim();
        const user = get().users.find((entry) => entry.email === normalizedEmail);

        if (!user || user.password !== trimmedPassword) {
          throw new Error("Invalid email or password.");
        }

        set({
          currentUserId: user.id,
          isAuthenticated: true,
          activeUser: user
        });

        return user.id;
      },
      signOut: () =>
        set({
          currentUserId: null,
          isAuthenticated: false,
          activeUser: null
        })
    }),
    {
      name: "paluwaga-auth-state",
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        const activeUser = state.users.find((user) => user.id === state.currentUserId) || null;
        state.activeUser = activeUser;
        state.isAuthenticated = Boolean(activeUser);
      }
    }
  )
);