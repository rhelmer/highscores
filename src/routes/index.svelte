<script lang="ts">
	import { liveQuery, type Observable } from 'dexie';
	import { db } from '../db';

	let journeys: Observable<Journeys[]>;

	interface Journeys {
		id: string;
		rally_id: string;
		user_journey_page_visit_start_date_time: string;
		user_journey_page_visit_stop_date_time: string;
		user_journey_attention_duration: string;
		user_journey_page_id: string;
		user_journey_referrer: string;
		user_journey_url: string;
	}

	function sumOrigins(entries: Array<Object>) {
		const urlScores = new Map();
		for (const entry of entries) {
			let url: URL;
			try {
				url = new URL(entry.user_journey_referrer);
			} catch (ex) {
				console.debug(ex);
			}
			if (!url) {
				continue;
			}
			const origin = url.origin;

			if (urlScores.has(origin)) {
				const count = urlScores.get(origin);
				urlScores.set(origin, count + 1);
			} else {
				urlScores.set(origin, 1);
			}
		}
		return Array.from(urlScores);
	}

	db.open().then(() => {
		journeys = liveQuery(() => db.table('user-journey').toArray());
	});
</script>

<div>
	<h1 class="text-lg">Rally Extension - Top referrers</h1>
	<div class="container grid grid-cols-5">
		{#if $journeys}
			{#each sumOrigins($journeys) as [url, score]}
				<div class="item col-span-4">{url}</div>
				<div class="item">{score}</div>
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
