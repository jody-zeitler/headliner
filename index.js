const {Headliner, FreeformHeadliner} = require('./headliner');

/**
 * The base mode only echos characters that are correct.
 * Freeform mode makes you do your own error correction,
 * just like in real life!
 */
const MODE = 'freeform';
/**
 * Sends a bell character to stderr whenever a mistake
 * is made. Turn up those speakers for maximum negative
 * reinforcement.
 */
const BELL = true;

async function main() {
	const HeadlinerMode = MODE === 'freeform' ? FreeformHeadliner : Headliner;
	const app = new HeadlinerMode({enableErrorBell: BELL});
	app.setupStdin();
	app.newTitle();
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error.stack);
	});
}
