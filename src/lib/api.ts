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

// Default to localhost:3000 for backend in development
// In production, use env variables or same origin
const defaultBackend = `http://localhost:${defaultPort}`;

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
