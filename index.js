const tty = require('tty');
const {generateNewsTitles} = require('./wikinews');

const KEY_C_C = 3;
const KEY_BACKSPACE = 8;

class Headliner {
	constructor() {
		this.newsTitles = generateNewsTitles();

		this.currentPhrase = null;
		this.phraseIndex = 0;

		this.correctCharacters = 0;
		this.missedCharacters = 0;

		this.startTime = 0;
		this.totalTime = 0;
	}

	setupStdin() {
		process.stdin.setRawMode(true);
		process.stdin.on('data', (data) => {
			const code = data.readInt8();
			if (code === KEY_C_C) {
				process.exit(0);
				return;
			}
			if (!this.currentPhrase) {
				return;
			}
			this.startTime = this.startTime || Date.now();
			const currentCharCode = this.currentPhrase.charCodeAt(this.phraseIndex);
			if (code === currentCharCode || currentCharCode > 127) {
				process.stdout.write(this.currentPhrase[this.phraseIndex]);
				this.correctCharacters++;
				if (++this.phraseIndex >= this.currentPhrase.length) {
					process.stdout.write('\n');
					this.endTitle();
					this.newTitle();
				}
			} else {
				this.missedCharacters++;
			}
		});
	}

	endTitle() {
		this.currentPhrase = null;
		this.totalTime += Date.now() - this.startTime;
		this.startTime = null;
		const words = this.correctCharacters / 5;
		const minutes = this.totalTime / 1000 / 60;
		const wpm = (words / minutes).toFixed(3);
		const characters = this.correctCharacters + this.missedCharacters;
		const accuracy = ((this.correctCharacters / characters) * 100).toFixed(1);
		console.log(`WPM: ${wpm}. Accuracy: ${accuracy}`);
	}

	async newTitle() {
		this.currentPhrase = null;
		this.currentPhrase = await this.newsTitles.next().value;
		this.phraseIndex = 0;
		console.log(this.currentPhrase);
	}
}

async function main() {
	const app = new Headliner();
	app.setupStdin();
	app.newTitle();
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error.stack);
	});
}
