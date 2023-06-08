// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import * as homePageView from "./home_page_view.js";
import { Rot13Client } from "../infrastructure/rot13_client.js";
import { HttpServerRequest } from "http/http_server_request.js";
import { WwwConfig } from "../www_config.js";
import { Clock } from "infrastructure/clock.js";

const ENDPOINT = "/";
const INPUT_FIELD_NAME = "text";
const TIMEOUT_IN_MS = 5000;

/** Endpoint for '/' home page. */
export class HomePageController {

	/**
	 * Factory method. Creates the controller.
	 * @returns {HomePageController} the controller
	 */
	static create() {
		ensure.signature(arguments, []);

		return new HomePageController(Rot13Client.create(), Clock.create());
	}

	/**
	 * Factory method. Creates a 'nulled' controller that doesn't talk to the ROT-13 service.
	 * @returns {HomePageController} the nulled instance
	 */
	static createNull() {
		ensure.signature(arguments, []);

		return new HomePageController(Rot13Client.createNull(), Clock.createNull());
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(rot13Client, clock) {
		ensure.signature(arguments, [ Rot13Client, Clock ]);

		this._rot13Client = rot13Client;
		this._clock = clock;
	}

	/**
	 * Handle GET request.
	 * @param request HTTP request
	 * @param config configuration for this request
	 * @returns {HttpServerResponse} HTTP response
	 */
	async getAsync(request, config) {
		ensure.signature(arguments, [ HttpServerRequest, WwwConfig ]);  // run-time type checker (ignore me)

		// to do
		return homePageView.homePage();
	}

	/**
	 * Handle POST request.
	 * @param request HTTP request
	 * @param config configuration for this request
	 * @returns {Promise<HttpServerResponse>} HTTP response
	 */
	async postAsync(request, config) {
		const userInput = await parseRequestBodyAsync(request, config.log);
		if (userInput === null) return homePageView.homePage();

		const output = await this._rot13Client.transformAsync(
			config.rot13ServicePort,
			userInput,
			config.correlationId,
		);
		return homePageView.homePage(output);
	}
}

async function parseRequestBodyAsync(request, log) {
	const form = await request.readBodyAsUrlEncodedFormAsync();
	const textFields = form[INPUT_FIELD_NAME];

	try {
		if (textFields === undefined) throw new Error(`'${INPUT_FIELD_NAME}' form field not found`);
		if (textFields.length !== 1) throw new Error(`should only be one '${INPUT_FIELD_NAME}' form field`);

		return textFields[0];
	}
	catch (err) {
		log.monitor({
			endpoint: ENDPOINT,
			method: "POST",
			message: "form parse error",
			error: err.message,
			form,
		});
		return null;
	}
}
