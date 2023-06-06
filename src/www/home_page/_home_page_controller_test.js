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
			// Arrange
			const rot13Client = Rot13Client.createNull();
			const clock = Clock.createNull();
			const controller = new HomePageController(rot13Client, clock);
			const request = HttpServerRequest.createNull();
			const config = WwwConfig.createTestInstance();

			// Act
			const response = await controller.getAsync(request, config);

			// Assert
			const expected = homePageView.homePage();
			assert.deepEqual(expected, response);
		});

		// Challenge #2a, 2b, 2c
		it("POST asks ROT-13 service to transform text", async () => {
			// Arrange
			const rot13Client = Rot13Client.createNull();
			const rot13Requests = rot13Client.trackRequests();

			const clock = Clock.createNull();
			const controller = new HomePageController(rot13Client, clock);

			const request = HttpServerRequest.createNull({
				body: "text=hello%20world",
			});

			const config = WwwConfig.createTestInstance({
				rot13ServicePort: 123,
				correlationId: "0000-0000",
			});

			// Act
			await controller.postAsync(request, config);
			// Assert

			assert.deepEqual(rot13Requests.data, [{
				port: 123,
				text: "hello world",
				correlationId: "0000-0000"
			}]);

		});

		// Challenge #3
		it("POST renders result of ROT-13 service call", async () => {
			// Arrange

			const rot13Client = Rot13Client.createNull();
			const rot13Requests = rot13Client.trackRequests();
			const clock = Clock.createNull();
			const controller = new HomePageController(rot13Client, clock);

			const request = HttpServerRequest.createNull({
				body: "text=hello%20world",
			});
			const config = WwwConfig.createTestInstance(
				{
					rot13ServicePort: 999,
					correlationId: "my-correlation-id",
				}
			);

			// Act
			await controller.postAsync(request, config);

			// Assert
			assert.deepEqual(rot13Requests.data, [{
				port: 999,
				text: "hello world",
				correlationId: "my-correlation-id",
			}]);
		});
	});


	describe("parse edge cases", () => {

		// Challenge #5
		it("logs warning when form field not found (and treats request like GET)", async () => {
			// to do
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

});
