import PocketBase from 'pocketbase';
import { POCKETBASE_URL } from '$env/static/private';

// Server-side PocketBase client uses internal Docker network URL
export const pb = new PocketBase(POCKETBASE_URL);

// Disable auto cancellation for better control
pb.autoCancellation(false);

