import { pb } from '$lib/server/pocketbase';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect to admin
	if (locals.user) {
		throw redirect(303, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		try {
			const authData = await pb.collection('users').authWithPassword(email, password);

			// Set the auth cookie
			cookies.set('pb_auth', pb.authStore.exportToCookie(), {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: false // Set to true in production with HTTPS
			});

			throw redirect(303, '/admin');
		} catch (err: any) {
			console.error('Login error:', err);
			if (err.status === 303) throw err; // Re-throw redirects
			return fail(400, { error: 'Invalid email or password' });
		}
	}
};

