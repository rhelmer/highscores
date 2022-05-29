/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	interface Locals {
		userid: string;
	}

	interface Journeys {
		id: string,
		rally_id: string,
		user_journey_page_visit_start_date_time: string,
		user_journey_page_visit_stop_date_time: string,
		user_journey_attention_duration: string,
		user_journey_page_id: string,
		user_journey_url: string
	}

	interface Pixels {
		id: string,
		rally_id: string
		facebook_pixel_has_facebook_login_cookies: string,
		facebook_pixel_pixel_page_id: string,
		facebook_pixel_url: string
	}
}
