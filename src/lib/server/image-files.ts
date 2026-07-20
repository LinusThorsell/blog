/**
 * Finds the byte immediately after the actual JPEG end marker.
 *
 * JPEG metadata can contain embedded thumbnails (and therefore its own FF D9
 * bytes), so this walks the JPEG segments instead of searching for the first
 * end-marker-looking byte sequence.
 */
function findJpegEnd(bytes: Uint8Array): number | null {
	if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
		return null;
	}

	let offset = 2;

	while (offset < bytes.length) {
		if (bytes[offset] !== 0xff) return null;

		// JPEG permits any number of FF fill bytes before a marker.
		while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
		if (offset >= bytes.length) return null;

		const marker = bytes[offset];
		offset += 1;

		if (marker === 0xd9) return offset;

		// SOI, TEM, and restart markers do not have a length field.
		if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
			continue;
		}

		if (marker === 0x00 || offset + 1 >= bytes.length) return null;

		const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
		if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
		offset += segmentLength;

		if (marker !== 0xda) continue;

		// Scan data runs until the next unescaped marker. Progressive JPEGs can
		// contain multiple scans, so hand that marker back to the outer loop.
		while (offset < bytes.length) {
			if (bytes[offset] !== 0xff) {
				offset += 1;
				continue;
			}

			if (offset + 1 >= bytes.length) return null;

			const next = bytes[offset + 1];
			if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
				offset += 2;
				continue;
			}

			if (next === 0xff) {
				offset += 1;
				continue;
			}

			break;
		}
	}

	return null;
}

/**
 * Pixel Motion Photos store an ordinary JPEG followed by an MP4 video. Return
 * just the JPEG portion so PocketBase receives a regular still image.
 */
export async function flattenMotionPhoto(file: File): Promise<File> {
	const header = new Uint8Array(await file.slice(0, 2).arrayBuffer());
	if (header[0] !== 0xff || header[1] !== 0xd8) return file;

	const bytes = new Uint8Array(await file.arrayBuffer());
	const jpegEnd = findJpegEnd(bytes);
	if (jpegEnd === null || jpegEnd === bytes.length) return file;

	return new File([bytes.subarray(0, jpegEnd)], file.name, {
		type: 'image/jpeg',
		lastModified: file.lastModified
	});
}
