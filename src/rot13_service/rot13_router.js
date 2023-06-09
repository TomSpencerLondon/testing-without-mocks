// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import { HttpServerRequest } from "http/http_server_request.js";
import { GenericRouter } from "http/generic_router.js";
import { Rot13Controller } from "./rot13_controller.js";
import { Log } from "infrastructure/log.js";
import * as rot13View from "./rot13_view.js";

/** Router for ROT-13 service */
export class Rot13Router {

	/**
	 * Factory method. Creates the router.
	 * @param log logger to use for all requests
	 * @returns {Rot13Router} the router
	 */
	static create(log) {
		ensure.signature(arguments, [ Log ]);

		return new Rot13Router(log);
	}

	/**
	 * Factory method. Creates a 'nulled' router that doesn't communicate with external systems.
	 * @param [log] logger to use for all requests (defaults to a nulled log)
	 * @returns {Rot13Router} the nulled instance
	 */
	static createNull({
		log = Log.createNull(),
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
		}]]);

		return new Rot13Router(log);
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(log) {
		ensure.signature(arguments, [ Log ]);

		this._log = log;
		this._router = GenericRouter.create(errorHandler, {
			"/rot13/transform": Rot13Controller.create(),
		});
	}

	/**
	 * @returns {*} logger
	 */
	get log() {
		return this._log;
	}
	
	/**
	 * Process request and return response.
	 * @param request the request
	 * @returns {Promise<HttpServerResponse>} the response
	 */
	async routeAsync(request) {
		ensure.signature(arguments, [ HttpServerRequest ]);

		const correlationId = request.headers["x-correlation-id"];
		if (correlationId === undefined) {
			return rot13View.error(400, "missing x-correlation-id header");
		}

		const log = this._log.bind({ correlationId });
		return await this._router.routeAsync(request, log);
	}

}

function errorHandler(status, error, request) {
	ensure.signature(arguments, [ Number, String, HttpServerRequest ]);

	return rot13View.error(status, error);
}