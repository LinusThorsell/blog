export async function readJsonResponse<T>(response: Response): Promise<T> {
	const contentType = response.headers.get('content-type') ?? '';

	if (contentType.includes('application/json')) {
		return (await response.json()) as T;
	}

	const text = await response.text().catch(() => '');
	throw new Error(
		text.trim() || `Expected JSON response but received ${response.status} ${response.statusText}`
	);
}

export async function readErrorMessage(
	response: Response,
	fallback = `Request failed with ${response.status} ${response.statusText}`
): Promise<string> {
	const contentType = response.headers.get('content-type') ?? '';

	if (contentType.includes('application/json')) {
		const body = await response.json().catch(() => null);
		return body?.message || fallback;
	}

	if (response.status === 413) {
		return 'The uploaded image is too large. Try a smaller image.';
	}

	const text = await response.text().catch(() => '');
	return text.trim() || fallback;
}
