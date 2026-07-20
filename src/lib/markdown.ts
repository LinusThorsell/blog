import { marked, Renderer } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

// Configure marked with syntax highlighting
marked.use(
	markedHighlight({
		langPrefix: 'hljs language-',
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		}
	})
);

// Export configured marked instance
export { marked };

export function renderMarkdown(content: string, panoramaImageUrls: readonly string[]): string {
	const panoramaUrls = new Set(panoramaImageUrls);
	const renderer = new Renderer();
	const renderImage = renderer.image.bind(renderer);

	renderer.image = (token) => {
		if (!panoramaUrls.has(token.href)) {
			return renderImage(token);
		}

		return `<span class="panorama">
	<span class="panorama__viewport" role="region" aria-label="Panorama. Scroll horizontally to explore.">
	${renderImage(token)}
	</span>
	<span class="panorama__hint">Scroll sideways to explore</span>
</span>`;
	};

	return marked.parse(content, { async: false, renderer });
}
