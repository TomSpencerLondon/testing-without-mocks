// Copyright Titanium I.T. LLC.
import * as ensure from "util/ensure.js";
import { Log } from "infrastructure/log.js";

/** Configuration for a request to the user-facing website. */
export class WwwConfig {

	/**
	 * Factory method. Creates the configuration.
	 * @param log logger to use for this request
	 * @param rot13ServicePort port of ROT-13 service (host is assumed to be localhost)
	 * @param correlationId unique identifier for this request
	 * @returns {WwwConfig} the configuration
	 */
	static create(log, rot13ServicePort, correlationId) {
		ensure.signature(arguments, [ Log, Number, String ]);

		return new WwwConfig(log, rot13ServicePort, correlationId);
	}

	/**
	 * Test-only factory method. Creates a configuration with overrideable defaults.
	 * @param [log] logger to use for this request
	 * @param [rot13ServicePort] port of ROT-13 service (host is assumed to be localhost)
	 * @param [correlationId] unique identifier for this request
	 * @returns {WwwConfig} the configuration
	 */
	static createTestInstance({
		log = Log.createNull(),
		rot13ServicePort = 42,
		correlationId = "nulled-correlation-id"
	} = {}) {
		ensure.signature(arguments, [[ undefined, {
			log: [ undefined, Log ],
			rot13ServicePort: [ undefined, Number ],
			correlationId: [ undefined, String ],
		}]]);

		return new WwwConfig(log, rot13ServicePort, correlationId);
	}

	/** Only for use by tests. (Use a factory method instead.) */
	constructor(log, rot13ServicePort, correlationId) {
		this._log = log;
		this._rot13ServicePort = rot13ServicePort;
		this._correlationId = correlationId;
	}

	/**
	 * @returns {Log} logger
	 */
	get log() {
		return this._log;
	}

	/**
	 * @returns {number} port of ROT-13 service
	 */
	get rot13ServicePort() {
		return this._rot13ServicePort;
	}

	/**
	 * @returns {string} unique identifier for this request
	 */
	get correlationId() {
		return this._correlationId;
	}

}