import {ArrayElement} from "./types/ArrayElement";

const ENVS = [
    "VERSION",
    "PORT",
    "API_BASE_URL"
] as const;

export const env = process.env as Record<ArrayElement<typeof ENVS>, string>;