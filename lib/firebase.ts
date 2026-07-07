export const app = {} as any;

export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    return () => {};
  },
  signOut: async () => {},
} as any;

export const analytics = null;
