import {ArrayElement} from "./types/ArrayElement";

const ENVS = [
    "VERSION",
    "PORT",
    "SSL_CERT_PATH",
    "SSL_KEY_PATH",
    "API_BASE_URL"
] as const;

export const env = process.env as Record<ArrayElement<typeof ENVS>, string>;