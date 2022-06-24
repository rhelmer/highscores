<script lang="ts">
	import { fly } from 'svelte/transition';

	import { liveQuery, type Observable } from 'dexie';
	import { db } from '../db';

	let pixels: Observable<Pixels[]>;
	let journeys: Observable<Journeys[]>;

	interface Journeys {
		id: string;
		rally_id: string;
		user_journey_page_visit_start_date_time: string;
		user_journey_page_visit_stop_date_time: string;
		user_journey_attention_duration: string;
		user_journey_page_id: string;
		user_journey_url: string;
	}

	interface Pixels {
		id: string;
		rally_id: string;
		facebook_pixel_has_facebook_login_cookies: string;
		facebook_pixel_pixel_page_id: string;
		facebook_pixel_url: string;
	}

	const joinPixelsAndJourneys = (pixels: Array<Pixels>, journeys: Array<Journeys>) => {
		let highScores = new Map();

		for (const pixel of pixels) {
			for (const journey of journeys) {
				const origin = new URL(journey.user_journey_url).origin;
				if (pixel.facebook_pixel_pixel_page_id === journey.user_journey_page_id) {
					console.debug(origin, pixel, journey);

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

	db.open().then(() => {
		pixels = liveQuery(() => db.table('fbpixelhunt-pixel').toArray());
		journeys = liveQuery(() => db.table('fbpixelhunt-journey').toArray());
	});
</script>

<div>
	<h1 class="text-lg">Facebook Pixel Hunt - High Scores</h1>
	<div class="container grid grid-cols-5">
		{#if $pixels && $journeys}
			{#each joinPixelsAndJourneys($pixels, $journeys) as [origin, score]}
				{#key origin}
					<div class="item" in:fly={{ y: 20, duration: 500 }} out:fly={{ y: 20, duration: 500 }}>
						<img
							id={origin}
							src="https://s2.googleusercontent.com/s2/favicons?domain={origin}"
							alt="logo"
							height="16"
							width="16"
						/>
					</div>
					<div
						class="item col-span-3"
						in:fly={{ y: 20, duration: 1000 }}
						out:fly={{ y: 20, duration: 1000 }}
					>
						{origin}
					</div>
					<div class="item" in:fly={{ y: 20, duration: 1000 }} out:fly={{ y: 20, duration: 1000 }}>
						{score}
					</div>
				{/key}
			{/each}
		{/if}
	</div>
</div>

<style>
	.item {
		background-color: #80cbc4;
		border: 1px solid #fff;
		padding: 5px;
		font-size: 16px;
		text-align: center;
	}
	.container {
		padding: 5px;
		display: grid;
		border-radius: 5px;
	}
</style>
