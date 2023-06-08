// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import assert from "util/assert.js";
import {HttpClient} from "http/http_client.js";
import {Rot13Client} from "./rot13_client.js";
import {ignorePromiseErrorAsync} from "util/test_helper.js";

const HOST = "localhost";
const IRRELEVANT_PORT = 42;
const IRRELEVANT_TEXT = "irrelevant text";
const IRRELEVANT_CORRELATION_ID = "irrelevant correlation-id";

const VALID_ROT13_STATUS = 200;
const VALID_ROT13_HEADERS = {"content-type": "application/json"};
const VALID_RESPONSE = "transformed_text";
const VALID_ROT13_BODY = JSON.stringify({transformed: VALID_RESPONSE});

describe.only("ROT-13 Service client", () => {

    describe("happy path", () => {

        // Challenge #1
        it("makes request", async () => {
            // Arrange
            const {httpRequests} = await transformAsync(
                {
                    port: 9999,
                    text: "text_to_transform",
                    correlationId: "my-correlation-id"
                });
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

        async function transformAsync({
            port = IRRELEVANT_PORT,
            text = IRRELEVANT_TEXT,
            correlationId = IRRELEVANT_CORRELATION_ID,
            rot13ServiceStatus = VALID_ROT13_STATUS,
            rot13ServiceHeaders = VALID_ROT13_HEADERS,
            rot13ServiceBody = VALID_ROT13_BODY
        }) {
            // Arrange
            const httpClient = HttpClient.createNull({
                "/rot13/transform": {
                    status: rot13ServiceStatus,
                    headers: rot13ServiceHeaders,
                    body: rot13ServiceBody,
                }
            });
            const httpRequests = httpClient.trackRequests();
            const rot13Client = new Rot13Client(httpClient);
            const rot13Requests = rot13Client.trackRequests();
            // Act
            const response = await rot13Client.transformAsync(port, text, correlationId);

            return {response, rot13Requests, httpRequests};
        }

        // Challenge #3
        it("parses response", async () => {
            // to do
            const { response } = await transformAsync({
                rot13ServiceStatus: VALID_ROT13_STATUS,
                rot13ServiceHeaders: VALID_ROT13_HEADERS,
                rot13ServiceBody: VALID_ROT13_BODY
            });

            assert.equal(response, VALID_RESPONSE);
        });

        // Challenge #4
        it("tracks requests", async () => {
            // to do
            const { rot13Requests } = await transformAsync({
                port: 9999,
                text: "my text",
                correlationId: "my-correlation-id",
            });

            assert.deepEqual(rot13Requests.data, [{
                port: 9999,
                text: "my text",
                correlationId: "my-correlation-id",
            }]);
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
