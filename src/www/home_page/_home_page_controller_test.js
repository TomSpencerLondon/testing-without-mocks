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

		// Challenge #1
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

		// Challenge #5
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

		// Challenge #6
		it("logs warning when duplicated form field found (and treats request like GET)", async () => {
			// to do
		});

	});


	describe("ROT-13 service edge cases", () => {

		// Challenge #7
		it("fails gracefully, and logs error, when service returns error", async () => {
			// to do
		});

		// Challenge #9
		it("fails gracefully, cancels request, and logs error, when service responds too slowly", async () => {
			// to do
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

    async function postAsync({
                                 body = `text=${IRRELEVANT_INPUT}`,
                                 rot13ServicePort = IRRELEVANT_PORT,
                                 correlationId = IRRELEVANT_CORRELATION_ID,
                                 rot13Response = "irrelevant ROT-13 response",
                             } = {}) {
        const rot13Client = Rot13Client.createNull([{ response: rot13Response }]);
        const rot13Requests = rot13Client.trackRequests();

        const log = Log.createNull();
        const logOutput = log.trackOutput();

        const clock = Clock.createNull();
        const controller = new HomePageController(rot13Client, clock);

        const request = HttpServerRequest.createNull({ body });
        const config = WwwConfig.createTestInstance({ log, rot13ServicePort, correlationId });

        const response = await controller.postAsync(request, config);

        return { response, rot13Requests, logOutput };
    }

});
