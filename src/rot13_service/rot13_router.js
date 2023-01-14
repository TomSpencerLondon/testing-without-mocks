// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const HttpRequest = require("http/http_request");
const HttpResponse = require("http/http_response");
const GenericRouter = require("http/generic_router");
const rot13Controller = require("./rot13_controller");

/** Router for ROT-13 service */
module.exports = class Rot13Router {

	static create() {
		ensure.signature(arguments, []);

		return new Rot13Router();
	}

	constructor() {
		this._router = GenericRouter.create(errorHandler, {
			"/rot13/transform": rot13Controller,
		});
	}

	async routeAsync(request) {
		ensure.signature(arguments, [ HttpRequest, [ undefined, Object ]]);

		return await this._router.routeAsync(request);
	}

};

function errorHandler(status, error, request) {
	ensure.signature(arguments, [ Number, String, HttpRequest ]);

	return HttpResponse.createJsonResponse({
		status,
		body: { error }
	});
}