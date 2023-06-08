// Copyright Titanium I.T. LLC.
import assert from "util/assert.js";
import * as ensure from "util/ensure.js";
import { HttpServerRequest } from "http/http_server_request.js";
import { WwwConfig } from "../www_config.js";
import * as homePageView from "./home_page_view.js";
import { Rot13Client } from "../infrastructure/rot13_client.js";
import { HomePageController } from "./home_page_controller.js";
import { Log } from "infrastructure/log.js";
import { Clock } from "infrastructure/clock.js";
import {request} from "http";
import Assert from "../../../build/util/assert.js";

const IRRELEVANT_PORT = 42;
const IRRELEVANT_INPUT = "irrelevant_input";
const IRRELEVANT_CORRELATION_ID = "irrelevant-correlation-id";

describe.only("Home Page Controller", () => {

    describe("happy paths", () => {

        it("GET renders home page", async () => {
            const { response } = await getAsync();
            assert.deepEqual(response, homePageView.homePage());
        });

        it("POST asks ROT-13 service to transform text", async () => {
            const { rot13Requests } = await postAsync({
                body: "text=hello%20world",
                rot13ServicePort: 999,
                correlationId: "my-correlation-id",
            });

            assert.deepEqual(rot13Requests.data, [{
                text: "hello world",
                port: 999,
                correlationId: "my-correlation-id",
            }]);
        });

        it("POST renders result of ROT-13 service call", async () => {
            const { response } = await postAsync({ rot13Response: "my_response" });
            assert.deepEqual(response, homePageView.homePage("my_response"));
        });

    });


    describe("parse edge cases", () => {

        it("logs warning when form field not found (and treats request like GET)", async () => {
            const { response, rot13Requests, logOutput } = await postAsync({ body: "" });

            assert.deepEqual(logOutput.data, [{
                alert: "monitor",
                endpoint: "/",
                method: "POST",
                message: "form parse error",
                error: "'text' form field not found",
                form: {},
            }], "should log a warning");

            assert.deepEqual(response, homePageView.homePage(), "should render home page");
            assert.deepEqual(rot13Requests.data, [], "shouldn't call ROT-13 service");
        });

        it("logs warning when duplicated form field found (and treats request like GET)", async () => {
            const { response, rot13Requests, logOutput } = await postAsync({ body: "text=one&text=two" });

            assert.deepEqual(logOutput.data, [{
                alert: "monitor",
                endpoint: "/",
                method: "POST",
                message: "form parse error",
                error: "should only be one 'text' form field",
                form: {
                    text: [ "one", "two" ],
                },
            }], "should log a warning");

            assert.deepEqual(response, homePageView.homePage(), "should render home page");
            assert.deepEqual(rot13Requests.data, [], "shouldn't call ROT-13 service");
        });

    });


    describe("ROT-13 service edge cases", () => {

        it("fails gracefully, and logs error, when service returns error", async () => {
            const { response, logOutput } = await postAsync({
                rot13ServicePort: 9999,
                rot13Error: "my_error"
            });

            assert.deepEqual(logOutput.data, [{
                alert: "emergency",
                endpoint: "/",
                method: "POST",
                message: "ROT-13 service error",
                error: "Error: Unexpected status from ROT-13 service\n" +
                    "Host: localhost:9999\n" +
                    "Endpoint: /rot13/transform\n" +
                    "Status: 500\n" +
                    "Headers: {}\n" +
                    "Body: my_error",
            }], "should log an emergency");

            assert.deepEqual(response, homePageView.homePage("ROT-13 service failed"), "should render home page");
        });

        it("fails gracefully, cancels request, and logs error, when service responds too slowly", async () => {
            const { responsePromise, clock, logOutput, rot13Requests } = await post({ rot13Hang: true });

            await clock.advanceNulledClockUntilTimersExpireAsync();
            const response = await responsePromise;

            assert.deepEqual(logOutput.data, [{
                alert: "emergency",
                endpoint: "/",
                method: "POST",
                message: "ROT-13 service timed out",
                timeoutInMs: 5000,
            }], "should log an emergency");

            assert.deepEqual(rot13Requests.data, [
                {
                    port: IRRELEVANT_PORT,
                    text: IRRELEVANT_INPUT,
                    correlationId: IRRELEVANT_CORRELATION_ID,
                },
                {
                    port: IRRELEVANT_PORT,
                    text: IRRELEVANT_INPUT,
                    correlationId: IRRELEVANT_CORRELATION_ID,
                    cancelled: true,
                },
            ], "should cancel request");

            assert.deepEqual(response, homePageView.homePage("ROT-13 service timed out"), "should render home page");
        });

    });

});


async function getAsync() {
    const rot13Client = Rot13Client.createNull();
    const clock = Clock.createNull();
    const controller = new HomePageController(rot13Client, clock);

    const request = HttpServerRequest.createNull();
    const config = WwwConfig.createTestInstance();

    const response = await controller.getAsync(request, config);
    return { response };
}

async function postAsync(options) {
    const { responsePromise, ...remainder } = post(options);
    return {
        response: await responsePromise,
        ...remainder,
    };
}

function post({
                  body = `text=${IRRELEVANT_INPUT}`,
                  rot13ServicePort = IRRELEVANT_PORT,
                  correlationId = IRRELEVANT_CORRELATION_ID,
                  rot13Response = "irrelevant ROT-13 response",
                  rot13Error = undefined,
                  rot13Hang = false,
              } = {}) {
    const rot13Client = Rot13Client.createNull([{
        response: rot13Response,
        error: rot13Error,
        hang: rot13Hang,
    }]);
    const rot13Requests = rot13Client.trackRequests();

    const log = Log.createNull();
    const logOutput = log.trackOutput();

    const clock = Clock.createNull();
    const controller = new HomePageController(rot13Client, clock);

    const request = HttpServerRequest.createNull({ body });
    const config = WwwConfig.createTestInstance({ log, rot13ServicePort, correlationId });

    const responsePromise = controller.postAsync(request, config);

    return {
        responsePromise,
        rot13Requests,
        logOutput,
        clock,
    };
}