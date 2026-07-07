import { create } from "zustand";
import { toast } from "sonner";

export interface MockUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  getIdToken: (force?: boolean) => Promise<string>;
}

interface AuthState {
  user: MockUser | null;
  loading: boolean;
  setUser: (user: MockUser | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithGithub: () => Promise<any>;
  sendEmailLink: (email: string) => Promise<void>;
  completeEmailLinkSignIn: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initializeAuth: () => () => void;
}

const setMockUserCookie = (user: MockUser) => {
  if (typeof window !== "undefined") {
    document.cookie = `mock-user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=360000`;
  }
};

const removeMockUserCookie = () => {
  if (typeof window !== "undefined") {
    document.cookie = "mock-user=; path=/; max-age=0";
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    try {
      const usersStr = localStorage.getItem("gofarm-users") || "[]";
      const users = JSON.parse(usersStr);
      const existingUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!existingUser) {
        throw new Error("Invalid email or password");
      }

      const mockUser: MockUser = {
        uid: existingUser.uid,
        email: existingUser.email,
        displayName: existingUser.displayName || "Farmer User",
        photoURL: null,
        getIdToken: async () => "mock_token",
      };

      localStorage.setItem("gofarm-current-user", JSON.stringify(mockUser));
      setMockUserCookie(mockUser);
      set({ user: mockUser });
      toast.success("Successfully signed in!");
      return { user: mockUser };
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  },

  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const usersStr = localStorage.getItem("gofarm-users") || "[]";
      const users = JSON.parse(usersStr);

      if (users.find((u: any) => u.email === email)) {
        throw new Error("User already exists!");
      }

      const newUser = {
        uid: `uid-${Math.random().toString(36).substr(2, 9)}`,
        email,
        password,
        displayName: displayName || email.split("@")[0],
      };

      users.push(newUser);
      localStorage.setItem("gofarm-users", JSON.stringify(users));

      const mockUser: MockUser = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: null,
        getIdToken: async () => "mock_token",
      };

      localStorage.setItem("gofarm-current-user", JSON.stringify(mockUser));
      setMockUserCookie(mockUser);
      set({ user: mockUser });
      toast.success("Account created successfully!");
      return { user: mockUser };
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      const mockUser: MockUser = {
        uid: "google-uid-123",
        email: "google-user@gofarm.com",
        displayName: "Google Farmer",
        photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        getIdToken: async () => "mock_token",
      };

      localStorage.setItem("gofarm-current-user", JSON.stringify(mockUser));
      setMockUserCookie(mockUser);
      set({ user: mockUser });
      toast.success("Successfully signed in with Google!");
      return { user: mockUser };
    } catch (error: any) {
      toast.error("Failed to sign in with Google");
      throw error;
    }
  },

  signInWithGithub: async () => {
    try {
      const mockUser: MockUser = {
        uid: "github-uid-123",
        email: "github-user@gofarm.com",
        displayName: "Github Farmer",
        photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        getIdToken: async () => "mock_token",
      };

      localStorage.setItem("gofarm-current-user", JSON.stringify(mockUser));
      setMockUserCookie(mockUser);
      set({ user: mockUser });
      toast.success("Successfully signed in with Github!");
      return { user: mockUser };
    } catch (error: any) {
      toast.error("Failed to sign in with Github");
      throw error;
    }
  },

  sendEmailLink: async (email: string) => {
    toast.success("Sign-in link sent to your email!");
  },

  completeEmailLinkSignIn: async (email: string) => {
    const mockUser: MockUser = {
      uid: "email-link-uid-123",
      email,
      displayName: email.split("@")[0],
      photoURL: null,
      getIdToken: async () => "mock_token",
    };
    localStorage.setItem("gofarm-current-user", JSON.stringify(mockUser));
    setMockUserCookie(mockUser);
    set({ user: mockUser });
    toast.success("Successfully signed in!");
    return { user: mockUser };
  },

  logout: async () => {
    try {
      localStorage.removeItem("gofarm-current-user");
      removeMockUserCookie();
      set({ user: null });
      toast.success("Successfully signed out!");

      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error: any) {
      toast.error("Failed to sign out");
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    toast.success("Password reset email sent!");
  },

  initializeAuth: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("gofarm-current-user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          parsedUser.getIdToken = async () => "mock_token";
          setMockUserCookie(parsedUser);
          set({ user: parsedUser, loading: false });
        } catch (e) {
          localStorage.removeItem("gofarm-current-user");
          removeMockUserCookie();
          set({ user: null, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    } else {
      set({ user: null, loading: false });
    }
    return () => {};
  },
}));
