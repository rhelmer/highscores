<script lang="ts">
	import { fly } from 'svelte/transition';

	import { liveQuery, type Observable } from 'dexie';
	import { db } from '../db';

	import { v4 as uuidv4 } from 'uuid';

	const rallyId = uuidv4();
	const pageIds = [uuidv4(), uuidv4()];

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

	// FIXME get this from glean yaml
	db.version(1).stores({
		'fbpixelhunt-journey':
			'id,rally_id,user_journey_page_visit_start_date_time,user_journey_page_visit_stop_date_time,user_journey_attention_duration,user_journey_page_id,user_journey_url',
		'fbpixelhunt-pixel':
			'id,rally_id,facebook_pixel_has_facebook_login_cookies,facebook_pixel_pixel_page_id,facebook_pixel_url',
		'study-enrollment': 'id,rally_id'
	});
	db.open().then(async () => {
		pixels = liveQuery(() => db.table('fbpixelhunt-pixel').toArray());
		journeys = liveQuery(() => db.table('fbpixelhunt-journey').toArray());
	});

	async function addTestData() {
		db.open().then(async () => {
			const test_pixels = [
				{
					rally_id: rallyId,
					facebook_pixel_has_facebook_login_cookies: false,
					facebook_pixel_pixel_page_id: pageIds[0],
					facebook_pixel_form_data: 'a=example',
					facebook_pixel_url: 'https://www.facebook.com/tr/'
				},
				{
					rally_id: rallyId,
					facebook_pixel_has_facebook_login_cookies: false,
					facebook_pixel_pixel_page_id: pageIds[0],
					facebook_pixel_form_data: 'a=example',
					facebook_pixel_url: 'https://www.facebook.com/tr/'
				}
			];
			const test_journeys = [
				{
					rally_id: rallyId,
					user_journey_page_visit_start_date_time: '2022-05-30T13:40:57.444-07:00',
					user_journey_page_visit_stop_date_time: '2022-05-30T13:41:07.537-07:00',
					user_journey_attention_duration: 1342,
					user_journey_page_id: pageIds[0],
					user_journey_referrer: 'https://www.example.com/',
					user_journey_url: 'https://rally.mozilla.org'
				},
				{
					rally_id: rallyId,
					user_journey_page_visit_start_date_time: '2022-05-30T13:40:57.444-07:00',
					user_journey_page_visit_stop_date_time: '2022-05-30T13:41:07.537-07:00',
					user_journey_attention_duration: 1342,
					user_journey_page_id: pageIds[0],
					user_journey_referrer: 'https://www.example.com/',
					user_journey_url: 'https://mozilla.org'
				}
			];

			test_pixels.forEach(
				async (pixel) => await db.table('fbpixelhunt-pixel').put({ id: uuidv4(), ...pixel })
			);
			test_journeys.forEach(
				async (journey) => await db.table('fbpixelhunt-journey').put({ id: uuidv4(), ...journey })
			);
		});
	}
</script>

<div>
	<h1 class="text-lg">Facebook Pixel Hunt - DB Test</h1>
	<form id="add-test-data">
		<table border="true">
			<tr>PageID: <input /> </tr>
			<tr>Form data: <input /> </tr>
			<tr>URL: <input /> </tr>
		</table>
		<button on:click={addTestData}>Add test data</button>
	</form>
	<div class="container grid grid-cols-5">
		{#if $pixels && $journeys}
			{#each joinPixelsAndJourneys($pixels, $journeys) as [origin, score]}
				{#key origin}
					<div class="item" in:fly={{ y: 20, duration: 1000 }} out:fly={{ y: 20, duration: 1000 }}>
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
	table,
	tr {
		border: 1px solid black;
		align-items: start;
	}
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
