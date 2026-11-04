// ======================================================
// File Name : defaultApiKey.js
// Purpose   : The API key that is pre-filled on Integrations -> API so the
//             built-in Postman-style page works without pasting a key.
//             Override with VITE_DEFAULT_SERVICE_API_KEY in client/.env.
//             NOTE: anything in the client is visible to every browser that
//             loads the app. Fine for dev/demo; for production, set the env
//             var to empty and paste a key on the page instead.
// ======================================================

export const DEFAULT_API_KEY = import.meta.env.VITE_DEFAULT_SERVICE_API_KEY ?? 'alk_Y63CvA3x9rJoJK3IeK_k7ktZOpuRetKXAEL_qwVgt4M';
