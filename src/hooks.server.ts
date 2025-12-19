import { pb } from '$lib/server/pocketbase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Load auth from cookie
	const cookie = event.cookies.get('pb_auth');
	
	if (cookie) {
		try {
			pb.authStore.loadFromCookie(cookie);
			
			// Verify the auth is still valid
			if (pb.authStore.isValid) {
				try {
					await pb.collection('users').authRefresh();
					event.locals.user = pb.authStore.record;
				} catch {
					// Auth refresh failed, clear the cookie
					pb.authStore.clear();
					event.cookies.delete('pb_auth', { path: '/' });
				}
			}
		} catch {
			pb.authStore.clear();
		}
	}

	const response = await resolve(event);
	return response;
};

