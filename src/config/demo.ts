// Local previews use mocks; production requires an explicit opt-in.
export const PUBLIC_DEMO = import.meta.env.VITE_PUBLIC_DEMO === "true" ||
  (import.meta.env.DEV && import.meta.env.VITE_PUBLIC_DEMO !== "false");
