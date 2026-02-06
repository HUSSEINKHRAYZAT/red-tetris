// filepath: /sgoinfre/afayad/red-tetris/client/src/lib/api.ts
// Small helper to centralize backend / socket URLs for the frontend.
// Usage: import { BACKEND_HTTP_URL, SOCKET_URL } from '../lib/api'

const env = import.meta.env as Record<string, any>;

// Prefer explicit overrides from Vite env variables:
// VITE_BACKEND_URL (full http(s) URL) and VITE_SOCKET_URL (full socket URL)
// Optionally VITE_BACKEND_PORT to construct a localhost URL when no full URL is provided.

const defaultPort = env.VITE_BACKEND_PORT ?? '3000';
const envBackend = env.VITE_BACKEND_URL ?? null;
const envSocket = env.VITE_SOCKET_URL ?? null;

// Default to a runtime-derived backend URL when possible so clients on the LAN
// connect to the machine they loaded the page from. Falls back to localhost for
// non-browser contexts.
const runtimeHost = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:${defaultPort}` : `http://localhost:${defaultPort}`;
const defaultBackend = envBackend ?? runtimeHost;

export const BACKEND_HTTP_URL: string = envBackend ?? defaultBackend;
export const SOCKET_URL: string = envSocket ?? BACKEND_HTTP_URL;

// Optional helper that returns an object compatible with socket.io-client connect
export function getSocketConnectConfig() {
  return {
    url: SOCKET_URL,
    // additional options can be added here if needed
  };
}

export default {
  BACKEND_HTTP_URL,
  SOCKET_URL,
  getSocketConnectConfig,
};
