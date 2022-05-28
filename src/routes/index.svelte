<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '../db';

	const joinPixelsAndJourneys = (pixels, journeys) => {
		let highScores = new Map();

		for (const pixel of pixels) {
			for (const journey of journeys) {
				const origin = new URL(journey.user_journey_url).origin;
				if (pixel.facebook_pixel_pixel_page_id === journey.user_journey_page_id) {
					console.debug(origin, pixel.facebook_pixel_pixel_page_id, journey.user_journey_page_id);

					if (highScores.has(origin)) {
						let score = highScores.get(origin);
						highScores.set(origin, ++score);
					} else {
						highScores.set(origin, 1);
					}
				}
			}
		}
		const result = Array.from(highScores);
		result.sort((a, b) => {
			if (a[1] == b[1]) {
				return a[0] < b[0] ? -1 : 1;
			}
			return a[1] < b[1] ? 1 : -1;
		});
		return result;
	};

	let pixels;
	let journeys;
	db.open().then(() => {
		pixels = liveQuery(() => db.table('fbpixelhunt-pixel').toArray());
		journeys = liveQuery(() => db.table('fbpixelhunt-journey').toArray());
	});
</script>

<h1 class="text-3xl font-bold underline">Hello world!</h1>
<div class="container mx-auto">
	<div class="grid grid-cols-3 gap-6">
		{#if $pixels && $journeys}
			{#each joinPixelsAndJourneys($pixels, $journeys) as [origin, score]}
				<div>
					<img
						id={score[0]}
						src="https://s2.googleusercontent.com/s2/favicons?domain={origin}"
						alt="logo"
						height="16"
						width="16"
					/>
				</div>
				<div>{origin}</div>
				<div>{score}</div>
			{/each}
		{/if}
	</div>
</div>
