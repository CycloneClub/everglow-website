import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(projectRoot, '.output', 'server');
const entryPath = resolve(outputRoot, 'index.mjs');
const host = '127.0.0.1';
const port = process.env.SMOKE_TEST_PORT || '43177';
const baseUrl = `http://${host}:${port}`;
const startupTimeoutMs = 30_000;

const delay = (milliseconds) =>
	new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

async function readJson(path) {
	return JSON.parse(await readFile(path, 'utf8'));
}

async function verifyBundledUnhead() {
	const outputPackage = await readJson(resolve(outputRoot, 'package.json'));
	const bundledPackage = await readJson(
		resolve(outputRoot, 'node_modules', 'unhead', 'package.json'),
	);
	const expectedVersion = outputPackage.dependencies?.unhead;
	const actualVersion = bundledPackage.version;

	if (!expectedVersion) {
		throw new Error(
			'Production artifact does not declare an Unhead dependency.',
		);
	}

	if (actualVersion !== expectedVersion) {
		throw new Error(
			`Production artifact Unhead mismatch: expected ${expectedVersion}, resolved ${actualVersion}.`,
		);
	}

	console.log(
		`Bundled Unhead ${actualVersion} matches the production manifest.`,
	);
}

async function fetchRequired(path) {
	const response = await fetch(new URL(path, baseUrl), {
		signal: AbortSignal.timeout(5_000),
	});

	if (!response.ok) {
		throw new Error(`${path} returned HTTP ${response.status}.`);
	}

	return response;
}

async function waitUntilReady(server) {
	const deadline = Date.now() + startupTimeoutMs;
	let lastError;

	while (Date.now() < deadline) {
		if (server.exitCode !== null) {
			throw new Error(
				`Production server exited during startup with code ${server.exitCode}.`,
			);
		}

		try {
			const response = await fetch(new URL('/', baseUrl), {
				signal: AbortSignal.timeout(1_000),
			});
			if (response.ok) return;
			lastError = new Error(
				`/ returned HTTP ${response.status} during startup.`,
			);
		} catch (error) {
			lastError = error;
		}

		await delay(200);
	}

	throw new Error(
		`Production server was not ready within ${startupTimeoutMs}ms: ${lastError?.message || 'unknown error'}`,
	);
}

function extractOgImage(html) {
	const propertyFirst = html.match(
		/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
	);
	const contentFirst = html.match(
		/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["'][^>]*>/i,
	);
	return (propertyFirst?.[1] || contentFirst?.[1])?.replaceAll('&amp;', '&');
}

function assertHtmlIncludes(html, pattern, label) {
	if (!pattern.test(html)) {
		throw new Error(`Server-rendered home page is missing ${label}.`);
	}
}

async function verifyHttpSurfaces() {
	const homeResponse = await fetchRequired('/');
	const homeHtml = await homeResponse.text();

	assertHtmlIncludes(homeHtml, /<title[^>]*>[^<]+<\/title>/i, 'a title');
	assertHtmlIncludes(homeHtml, /twitter:card/i, 'twitter:card metadata');
	assertHtmlIncludes(
		homeHtml,
		/rel=["']alternate["']/i,
		'alternate-language links',
	);
	assertHtmlIncludes(homeHtml, /application\/ld\+json/i, 'Schema.org JSON-LD');

	const robotsResponse = await fetchRequired('/robots.txt');
	const robotsText = await robotsResponse.text();
	if (!/user-agent:/i.test(robotsText)) {
		throw new Error('/robots.txt does not contain a User-agent directive.');
	}

	const sitemapResponse = await fetchRequired('/sitemap.xml');
	const sitemapText = await sitemapResponse.text();
	if (!/<(?:urlset|sitemapindex)[\s>]/i.test(sitemapText)) {
		throw new Error('/sitemap.xml does not contain a sitemap document.');
	}

	const ogImagePath = extractOgImage(homeHtml);
	if (!ogImagePath) {
		throw new Error('Server-rendered home page is missing og:image metadata.');
	}

	const canonicalOgImageUrl = new URL(ogImagePath, baseUrl);
	const localOgImageUrl = new URL(
		`${canonicalOgImageUrl.pathname}${canonicalOgImageUrl.search}`,
		baseUrl,
	);
	const ogImageResponse = await fetch(localOgImageUrl, {
		signal: AbortSignal.timeout(15_000),
	});
	if (!ogImageResponse.ok) {
		throw new Error(`OG image returned HTTP ${ogImageResponse.status}.`);
	}

	const contentType = ogImageResponse.headers.get('content-type') || '';
	if (!contentType.startsWith('image/')) {
		throw new Error(
			`OG image returned unexpected content type ${contentType || '(missing)'}.`,
		);
	}

	const ogImage = await ogImageResponse.arrayBuffer();
	if (ogImage.byteLength === 0) {
		throw new Error('OG image response is empty.');
	}

	console.log('Production HTTP and SEO smoke checks passed.');
}

async function verifyServer() {
	let stdout = '';
	let stderr = '';
	let failure;
	let closed = false;
	const server = spawn(process.execPath, [entryPath], {
		cwd: projectRoot,
		env: {
			...process.env,
			HOST: host,
			NODE_ENV: 'production',
			PORT: port,
		},
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	const spawnFailed = new Promise((_, reject) => {
		server.once('error', reject);
	});
	const exited = new Promise((resolveExit) => {
		server.once('close', (code, signal) => {
			closed = true;
			resolveExit({ code, signal });
		});
	});

	server.stdout.on('data', (data) => {
		stdout += data;
	});
	server.stderr.on('data', (data) => {
		stderr += data;
	});

	try {
		await Promise.race([waitUntilReady(server), spawnFailed]);
		await verifyHttpSurfaces();
	} catch (error) {
		failure = error;
		throw error;
	} finally {
		if (!closed) {
			server.kill();
			await Promise.race([exited, delay(3_000)]);
		}

		if (!closed && server.kill('SIGKILL')) {
			await Promise.race([exited, delay(3_000)]);
		}

		if (failure) {
			if (stdout.trim())
				console.error(`\nProduction server stdout:\n${stdout.trim()}`);
			if (stderr.trim())
				console.error(`\nProduction server stderr:\n${stderr.trim()}`);
		}
	}
}

async function main() {
	await verifyBundledUnhead();
	await verifyServer();
}

main().catch((error) => {
	console.error(`Production smoke test failed: ${error.message}`);
	process.exitCode = 1;
});
