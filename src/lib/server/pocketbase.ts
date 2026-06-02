import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

export const pb = new PocketBase(env.POCKETBASE_URL ?? 'http://localhost:8090');

// Disable auto cancellation for better control
pb.autoCancellation(false);

