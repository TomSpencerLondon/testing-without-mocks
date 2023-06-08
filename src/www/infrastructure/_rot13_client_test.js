// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import assert from "util/assert.js";
import { HttpClient } from "http/http_client.js";
import { Rot13Client } from "./rot13_client.js";
import { ignorePromiseErrorAsync } from "util/test_helper.js";

const HOST = "localhost";
const IRRELEVANT_PORT = 42;
const IRRELEVANT_TEXT = "irrelevant text";
const IRRELEVANT_CORRELATION_ID = "irrelevant correlation-id";

const VALID_ROT13_STATUS = 200;
const VALID_ROT13_HEADERS = { "content-type": "application/json" };
const VALID_RESPONSE = "transformed_text";
const VALID_ROT13_BODY = JSON.stringify({ transformed: VALID_RESPONSE });

describe.only("ROT-13 Service client", () => {

	describe("happy path", () => {

		// Challenge #1
		it("makes request", async () => {
			// Arrange
			const httpClient = HttpClient.createNull();
			const httpRequests = httpClient.trackRequests();
			const rot13Client = new Rot13Client(httpClient);
			// Act
			await rot13Client.transformAsync(9999, "text_to_transform", "my-correlation-id");
			// Assert
			assert.deepEqual(httpRequests.data, [{
				host: HOST,
				port: 9999,
				path: "/rot13/transform",
				method: "post",
				headers: {
					"content-type": "application/json",
					"x-correlation-id": "my-correlation-id"
				},
				body: JSON.stringify({text: "text_to_transform"}),
			}]);
		});

		// Challenge #3
		it("parses response", async () => {
			// to do
		});

		// Challenge #4
		it("tracks requests", async () => {
			// to do
		});

	});


	describe("failure paths", () => {

		// Challenge #7
		it("fails gracefully when status code has unexpected value", async () => {
			// to do
		});

		// Challenge #10 (1 of 4)
		it("fails gracefully if body doesn't exist", async () => {
			// to do
		});

		// Challenge #10 (2 of 4)
		it("fails gracefully if body is unparseable", async () => {
			// to do
		});

		// Challenge #10 (3 of 4)
		it("fails gracefully if body has unexpected value", async () => {
			// to do
		});

		// Challenge #10 (4 of 4)
		it("doesn't fail when body has more fields than we expect", async () => {
			// to do
		});

	});


	describe("cancellation", () => {

		// Bonus Challenge #2
		it("can cancel requests", async () => {
			// to do
		});

		// Bonus Challenge #3 (1 of 2)
		it("tracks requests that are cancelled", async () => {
			// to do
		});

		// Bonus Challenge #3 (2 of 2)
		it("doesn't track attempted cancellations that don't actually cancel the request", async () => {
			// to do
		});

	});


	describe("nulled instance", () => {

		// Challenge #5
		it("provides default response", async () => {
			// to do
		});

		// Challenge #6
		it("can configure multiple responses", async () => {
			// to do
		});

		// Challenge #8
		it("simulates errors", async () => {
			// to do
		});

		// Bonus Challenge #1
		it("simulates hangs", async () => {
			// to do
		});

	});

});
