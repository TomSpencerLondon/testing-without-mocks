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

const IRRELEVANT_PORT = 42;
const IRRELEVANT_INPUT = "irrelevant_input";
const IRRELEVANT_CORRELATION_ID = "irrelevant-correlation-id";

describe.only("Home Page Controller", () => {

	describe("happy paths", () => {

		// Challenge #1
		it("GET renders home page", async () => {
			// Arrange

			// Act

			// Assert
		});

		// Challenge #2a, 2b, 2c
		it("POST asks ROT-13 service to transform text", async () => {
			// Arrange

			// Act

			// Assert
		});

		// Challenge #3
		it("POST renders result of ROT-13 service call", async () => {
			// Arrange

			// Act

			// Assert
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
