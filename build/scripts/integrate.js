// Copyright Titanium I.T. LLC.

import * as repo from "../util/repo.js";
import branches from "../config/branches.js";
import pathLib from "node:path";
import Colors from "../util/colors.js";

runAsync();

async function runAsync() {
	const args = process.argv;
	if (args.length !== 3) {
		const name = pathLib.basename(process.argv[1]).split(".")[0];
		console.log(`Usage: ${name} "commit message"`);
		return;
	}

	try {
		await integrateAsync(args[2]);
		console.log(Colors.brightGreen.inverse("\n   SUCCESS   \n"));
	}
	catch (err) {
		process.stdout.write(
			Colors.brightRed.inverse("\n   FAILED   \n") +
			Colors.brightRed(`${err.message}\n\n`)
		);
	}
}

async function integrateAsync(message) {
	writeHeader("Checking repository");
	await ensureNothingToCheckIn("Commit changes before integrating");

	writeHeader("Checking npm");
	await ensureNpmBuildFilesAreIgnored();

	writeHeader("Validating build");
	await validateBuildAsync(branches.dev);

	writeHeader("Merging dev branch");
	await mergeBranchesAsync(message);

	writeHeader("Validating integration");
	await validateBuildAsync(branches.integration);

	await rebaseAsync(branches.typescript, branches.integration);

	await rebaseAsync(branches.usingNullablesJs, branches.integration);
	await rebaseAsync(branches.usingNullablesJsValidation, branches.usingNullablesJs);
	await rebaseAsync(branches.usingNullablesTs, branches.typescript);
	await rebaseAsync(branches.usingNullablesTsValidation, branches.usingNullablesTs);

	await rebaseAsync(branches.highLevelInfrastructureJs, branches.integration);
	await rebaseAsync(branches.highLevelInfrastructureJsValidation, branches.highLevelInfrastructureJs);
	await rebaseAsync(branches.highLevelInfrastructureTs, branches.typescript);
	await rebaseAsync(branches.highLevelInfrastructureTsValidation, branches.highLevelInfrastructureTs);

	await rebaseAsync(branches.narrowIntegrationTestsJs, branches.integration);
	await rebaseAsync(branches.narrowIntegrationTestsJsValidation, branches.narrowIntegrationTestsJs);
	await rebaseAsync(branches.narrowIntegrationTestsTs, branches.typescript);
	await rebaseAsync(branches.narrowIntegrationTestsTsValidation, branches.narrowIntegrationTestsTs);

	await rebaseAsync(branches.embeddedStubsJs, branches.narrowIntegrationTestsJsValidation);
	await rebaseAsync(branches.embeddedStubsJsValidation, branches.embeddedStubsJs);
	await rebaseAsync(branches.embeddedStubsTs, branches.narrowIntegrationTestsTsValidation);
	await rebaseAsync(branches.embeddedStubsTsValidation, branches.embeddedStubsTs);
}

async function rebaseAsync(branchFrom, branchTo) {
	writeHeader(`Rebasing ${branchFrom} branch`);
	await repo.rebaseAsync(branchFrom, branchTo);

	writeHeader(`Validating ${branchFrom} branch`);
	await validateBuildAsync(branchFrom);
}

async function ensureNpmBuildFilesAreIgnored() {
	await repo.runCodeInBranch(branches.dev, async () => {
		await repo.rebuildNpmPackagesAsync(branches.dev);
		await ensureNothingToCheckIn("Need to ignore NPM build files");
	});
}

async function ensureNothingToCheckIn(errorMessage) {
	if (await repo.hasUncommittedChangesAsync()) throw new Error(errorMessage);
}

async function mergeBranchesAsync(message) {
	try {
		await repo.mergeBranchWithCommitAsync(branches.dev, branches.integration, `INTEGRATE: ${message}`);
		await repo.mergeBranchWithoutCommitAsync(branches.integration, branches.dev);
	}
	catch (err) {
		writeHeader("Integration failed; resetting repository");
		await repo.resetToFreshCheckoutAsync();
		throw new Error("Integration failed");
	}
}

async function validateBuildAsync(branch) {
try {
		await repo.runCodeInBranch(branch, async() => {
			await repo.runBuildAsync();
		});
	}
	catch (err) {
		throw new Error(`${branch} failed build`);
	}
}

function writeHeader(message) {
	console.log(Colors.brightWhite.underline("\n" + message));
}