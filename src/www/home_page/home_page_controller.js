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
		ensure.signature(arguments, [ HttpServerRequest, WwwConfig ]);

		return homePageView.homePage();
	}

	/**
	 * Handle POST request.
	 * @param request HTTP request
	 * @param config configuration for this request
	 * @returns {Promise<HttpServerResponse>} HTTP response
	 */
	async postAsync(request, config) {
		ensure.signature(arguments, [ HttpServerRequest, WwwConfig ]);

		const log = config.log.bind({ endpoint: ENDPOINT, method: "POST" });

		const { input, inputErr } = parseBody(await request.readBodyAsUrlEncodedFormAsync(), log);
		if (inputErr !== undefined) return homePageView.homePage();

		const { output, outputErr } = await transformAsync(this._rot13Client, this._clock, log, config, input);
		if (outputErr !== undefined) return homePageView.homePage("ROT-13 service failed");

		return homePageView.homePage(output);
	}

}

function parseBody(formData, log) {
	try {
		const textFields = formData[INPUT_FIELD_NAME];

		if (textFields === undefined) throw new Error(`'${INPUT_FIELD_NAME}' form field not found`);
		if (textFields.length > 1) throw new Error(`multiple '${INPUT_FIELD_NAME}' form fields found`);

		return { input: textFields[0] };
	}
	catch (inputErr) {
		log.monitor({
			message: "form parse error",
			error: inputErr.message,
			formData,
		});
		return { inputErr };
	}
}

async function transformAsync(rot13Client, clock, log, config, input) {
	try {
		const { transformPromise, cancelFn } = rot13Client.transform(config.rot13ServicePort, input, config.correlationId);
		const output = await clock.timeoutAsync(
			TIMEOUT_IN_MS,
			transformPromise,
			() => timeout(log, cancelFn));
		return { output };
	}
	catch (outputErr) {
		log.emergency({
			message: "ROT-13 service error",
			error: outputErr,
		});
		return { outputErr };
	}
}

function timeout(log, cancelFn) {
	log.emergency({
		message: "ROT-13 service timed out",
		timeoutInMs: TIMEOUT_IN_MS,
	});
	cancelFn();
	return "ROT-13 service timed out";
}