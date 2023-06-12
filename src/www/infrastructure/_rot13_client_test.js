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

        // Challenge #3
        it("parses response", async () => {
            // to do
            const {response} = await transformAsync({
                rot13ServiceStatus: VALID_ROT13_STATUS,
                rot13ServiceHeaders: VALID_ROT13_HEADERS,
                rot13ServiceBody: VALID_ROT13_BODY
            });

            assert.equal(response, VALID_RESPONSE);
        });

        // Challenge #4
        it("tracks requests", async () => {
            // to do
            const {rot13Requests} = await transformAsync({
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
            const expectedError =
                "Unexpected status from ROT-13 service\n" +
                `Host: ${HOST}:9999\n` +
                "Endpoint: /rot13/transform\n" +
                "Status: 400\n" +
                `Headers: ${JSON.stringify(VALID_ROT13_HEADERS)}\n` +
                `Body: ${VALID_ROT13_BODY}`;

            await assert.throwsAsync(() => transformAsync({
                port: 9999,
                rot13ServiceStatus: 400,
                rot13ServiceHeaders: VALID_ROT13_HEADERS,
                rot13ServiceBody: VALID_ROT13_BODY,
            }), expectedError);
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
            const rot13Client = Rot13Client.createNull();
            const {response} = await transformAsync({rot13Client});
            assert.equal(response, "Nulled Rot13Client response");
        });

        // Challenge #6
        it("can configure multiple responses", async () => {
            const rot13Client = Rot13Client.createNull([
                {response: "response 1"},
                {response: "response 2"},
            ]);

            const {response: response1} = await transformAsync({rot13Client});
            const {response: response2} = await transformAsync({rot13Client});

            assert.equal(response1, "response 1");
            assert.equal(response2, "response 2");
        });

        // Challenge #8
        it("simulates errors", async () => {
            const rot13Client = Rot13Client.createNull([{error: "my error"}]);
            await assertFailureAsync({
                rot13Client,
                rot13ServiceStatus: 500,
                rot13ServiceHeaders: {},
                rot13ServiceBody: "my error",
                message: "Unexpected status from ROT-13 service",
            });
        });

        // Bonus Challenge #1
        it("simulates hangs", async () => {
            // to do
        });

    });

});

async function transformAsync({
                                  rot13Client,
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
    rot13Client = rot13Client ?? new Rot13Client(httpClient);
    const rot13Requests = rot13Client.trackRequests();
    // Act
    const response = await rot13Client.transformAsync(port, text, correlationId);

    return {response, rot13Requests, httpRequests};
}

async function assertFailureAsync({
   rot13Client,
   port = 42,
   rot13ServiceStatus = VALID_ROT13_STATUS,
   rot13ServiceHeaders = VALID_ROT13_HEADERS,
   rot13ServiceBody = VALID_ROT13_BODY,
   message,
}) {
    const expectedError =
        `${message}\n` +
        `Host: ${HOST}:${port}\n` +
        "Endpoint: /rot13/transform\n" +
        `Status: ${rot13ServiceStatus}\n` +
        `Headers: ${JSON.stringify(rot13ServiceHeaders)}\n` +
        `Body: ${rot13ServiceBody}`;

    await assert.throwsAsync(
        () => transformAsync({
            rot13Client,
            port,
            rot13ServiceStatus,
            rot13ServiceHeaders,
            rot13ServiceBody,
        }),
        expectedError,
    );
}