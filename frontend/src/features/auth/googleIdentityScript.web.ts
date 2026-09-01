const SCRIPT_ID = "google-identity-services";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let loadPromise: Promise<void> | null = null;

/** Injects the GIS script once and resolves when `window.google.accounts.id` is ready. */
export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

      const onLoad = () => resolve();
      const onError = () => reject(new Error("Failed to load Google Identity Services"));

      if (existing) {
        existing.addEventListener("load", onLoad);
        existing.addEventListener("error", onError);
        return;
      }

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
