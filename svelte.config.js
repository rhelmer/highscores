import adapter from 'sveltekit-adapter-chrome-extension'
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],

	kit: {
		adapter: adapter(),
		browser: {
			hydrate: true
		},
		prerender: {
			default: true
		},
		appDir: "app",
		paths: {
			base: ""
		}
	}

}

export default config;
