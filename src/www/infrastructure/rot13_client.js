// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import * as type from "util/type.js";
import { HttpClient } from "http/http_client.js";
import { OutputListener } from "util/output_listener.js";

const HOST = "localhost";
const TRANSFORM_ENDPOINT = "/rot13/transform";
const RESPONSE_TYPE = { transformed: String };

/** Client for ROT-13 service */
export class Rot13Client {

	/**
	 * Factory method. Creates the client.
	 * @returns {Rot13Client} the client
	 */
	static create() {
		ensure.signature(arguments, []);
		
		return new Rot13Client(HttpClient.create());
	}

	/**
	 * Factory method. Creates a 'nulled' client that makes requests to a simulated ROT-13 service rather
	 * than making real HTTP requests.
	 * @param [options] Array of simulated responses for nulled instance to return. Each request returns
	 * the next simulated response in the array.
	 * @param [options[].response] the transformed text returned by the simulated service
	 * @param [options[].error] if defined, causes the simulated service to return an error
	 * @param [options[].hang] if true, the simulated request never returns
	 * @returns {Rot13Client} the nulled client
	 */
	static createNull(options) {
		throw new Error("not implemented");
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(httpClient) {
		ensure.signature(arguments, [ HttpClient ]);

		this._httpClient = httpClient;
	}

	/**
	 * Call the ROT-13 service and return the response. Doesn't have the ability to cancel the request.
	 * @param port the port of the ROT-13 service (the host is assumed to be 'localhost')
	 * @param text the text to transform
	 * @param correlationId a unique ID for this user's request
	 * @returns {Promise<string>} the response
	 */
	async transformAsync(port, text, correlationId) {
		ensure.signature(arguments, [ Number, String, String ]);  // run-time type checker (ignore me)

		// to do
	}

	/**
	 * Track requests made to the ROT-13 service.
	 * @returns {OutputTracker} the request tracker
	 */
	trackRequests() {
		ensure.signature(arguments, []);  // run-time type checker (ignore me)

		// to do
	}

}
