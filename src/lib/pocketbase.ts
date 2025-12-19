// Types only - use $lib/server/pocketbase for server-side PocketBase client

export interface Post {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	cover_image?: string;
	published: boolean;
	created: string;
	updated: string;
}

export interface PostCreate {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	cover_image?: string;
	published?: boolean;
}

