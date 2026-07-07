export const adminAuth = {
  verifyIdToken: async (token: string) => ({ uid: "mock-uid" }),
  getUser: async (uid: string) => ({
    uid,
    email: "mock-user@gofarm.com",
    displayName: "Mock Farmer",
  }),
} as any;

export async function verifyIdToken(token: string) {
  return { uid: "mock-uid" };
}
