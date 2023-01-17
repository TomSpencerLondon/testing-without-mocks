// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const type = require("util/type");
const HttpClient = require("http/http_client");
const HttpResponse = require("http/http_response");
const OutputTracker = require("util/output_tracker");
const EventEmitter = require("events");

const HOST = "localhost";
const TRANSFORM_ENDPOINT = "/rot13/transform";
const RESPONSE_TYPE = { transformed: String };
const REQUEST_EVENT = "request";

/** ROT-13 service client */
module.exports = class Rot13Client {

	static create() {
		ensure.signature(arguments, []);
		return new Rot13Client(HttpClient.create());
	}

	static createNull(options) {
		ensure.signature(arguments, [ [ undefined, Array ] ]);

		const httpResponses = nullHttpResponses(options);
		return new Rot13Client(HttpClient.createNull({
			[TRANSFORM_ENDPOINT]: httpResponses,
		}));
	}

	static nullErrorString(port, error) {
		ensure.signature(arguments, [ Number, String ]);

		const errorResponse = HttpResponse.create({
			status: 500,
			body: error,
		});
		return formatError("Unexpected status from ROT-13 service", port, errorResponse);
	}

	constructor(httpClient) {
		this._httpClient = httpClient;
		this._emitter = new EventEmitter();
	}

	async transformAsync(port, text, requestId) {
		ensure.signature(arguments, [ Number, String, String ]);

		return await this.transform(port, text, requestId).transformPromise;
	}

	transform(port, text, requestId) {
		ensure.signature(arguments, [ Number, String, String ]);

		const { responsePromise, cancelFn } = performRequest(port, text, requestId, this._httpClient, this._emitter);
		const transformPromise = validateAndParseResponseAsync(responsePromise, port);
		return { transformPromise, cancelFn };
	}

	trackRequests() {
		ensure.signature(arguments, []);

		return new OutputTracker(this._emitter, REQUEST_EVENT);
	}

};

function performRequest(port, text, requestId, httpClient, emitter) {
	const requestData = { port, text, requestId };
	emitter.emit(REQUEST_EVENT, requestData);

	const { responsePromise, cancelFn: httpCancelFn } = httpClient.request({
		host: HOST,
		port,
		method: "POST",
		path: TRANSFORM_ENDPOINT,
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ text }),
	});

	const cancelFn = () => {
		const cancelled = httpCancelFn(
			"ROT-13 service request cancelled\n" +
			`Host: ${HOST}:${port}\n` +
			`Endpoint: ${TRANSFORM_ENDPOINT}`,
		);
		if (cancelled) emitter.emit(REQUEST_EVENT, { ...requestData, cancelled: true });
	};

	return { responsePromise, cancelFn };
}

async function validateAndParseResponseAsync(responsePromise, port) {
	const response = await responsePromise;
	if (response.status !== 200) {
		throwError("Unexpected status from ROT-13 service", port, response);
	}
	if (response.body === "") {
		throwError("Body missing from ROT-13 service", port, response);
	}

	let parsedBody;
	try {
		parsedBody = JSON.parse(response.body);
	}
	catch(err) {
		throwError(`Unparseable body from ROT-13 service: ${err.message}`, port, response);
	}

	const typeError = type.check(parsedBody, RESPONSE_TYPE, { name: "body", allowExtraKeys: true });
	if (typeError !== null) {
		throwError(`Unexpected body from ROT-13 service: ${typeError}`, port, response);
	}
	return parsedBody.transformed;
}

function throwError(message, port, response) {
	throw new Error(formatError(message, port, response));
}

function formatError(message, port, response) {
	return "" +
		`${message}
Host: ${HOST}:${port}
Endpoint: ${TRANSFORM_ENDPOINT}
Status: ${response.status}
Headers: ${JSON.stringify(response.headers)}
Body: ${response.body}`;
}


function nullHttpResponses(responses = [ {} ]) {
	return responses.map((response) => nullHttpResponse(response));
}

function nullHttpResponse({
	response = "Null Rot13Client response",
	error,
	hang = false,
} = {}) {
	ensure.signature(arguments, [
		[
			undefined, {
			response: [ undefined, String ],
			error: [ undefined, String ],
			hang: [ undefined, Boolean ],
		},
		],
	]);

	if (error !== undefined) {
		return {
			status: 500,
			headers: {},
			body: error,
			hang,
		};
	}
	else {
		return {
			status: 200,
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ transformed: response }),
			hang,
		};
	}
}
