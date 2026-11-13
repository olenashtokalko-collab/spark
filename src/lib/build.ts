// Every deploy is a new prototype (13 Nov, feedback: "when I send the client the link, he says he sees old
// versions"). The portal saves what a visit does under spark-* (and the Console concept under c2-*), so a browser
// that opened an earlier build restores it and shows the portal as it was then — the old look, the old requests,
// sometimes the onboarding portal — although the new code is running. So each build stamps itself, and a build this
// browser hasn't seen clears what the prototype saved and leaves a first visit. The built site only: in dev the
// saved demo stays, so restarting the dev server doesn't wipe what's being worked on.
const BUILD_KEY = 'spark-build';

if (import.meta.env.PROD) {
  try {
    if (localStorage.getItem(BUILD_KEY) !== __BUILD_ID__) {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith('spark-') || k.startsWith('c2-')) localStorage.removeItem(k);
      }
      localStorage.setItem(BUILD_KEY, __BUILD_ID__);
    }
  } catch {
    /* a browser that keeps nothing: this visit only */
  }
}

export {};
