const {generateNewsTitles} = require('./wikinews');

const KEY_C_C = 3;
const KEY_BACKSPACE = 8;

const ASCII_MIN = 32; // space
const ASCII_MAX = 126; // tilde

class Headliner {
	constructor({enableErrorBell = true} = {}) {
		this.processStdin = this.processStdin.bind(this);
		this.newsTitles = generateNewsTitles();

		this.enableErrorBell = enableErrorBell;

		this.currentPhrase = null;
		this.phraseIndex = 0;

		this.correctCharacters = 0;
		this.missedCharacters = 0;

		this.startTime = 0;
		this.totalTime = 0;
	}

	setupStdin() {
		process.stdin.setRawMode(true);
		process.stdin.on('data', this.processStdin);
	}

	async newTitle() {
		this.currentPhrase = null;
		this.phraseIndex = 0;
		this.currentPhrase = await this.newsTitles.next().value;
		console.log(this.currentPhrase);
	}

	processStdin(data) {
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
		if (code === currentCharCode || currentCharCode >= ASCII_MAX) {
			this.recordCorrectCharacter();
		} else {
			this.missedCharacters++;
			if (this.enableErrorBell === true) {
				soundBell();
			}
		}
	}

	recordCorrectCharacter() {
		process.stdout.write(this.currentPhrase[this.phraseIndex]);
		this.correctCharacters++;
		if (++this.phraseIndex >= this.currentPhrase.length) {
			process.stdout.write('\n');
			this.endTitle();
			this.newTitle();
		}
	}

	endTitle() {
		this.currentPhrase = null;
		this.totalTime += Date.now() - this.startTime;
		this.startTime = null;
		const words = this.correctCharacters / 5;
		const minutes = this.totalTime / 1000 / 60;
		const wpm = (words / minutes).toFixed(1);
		const characters = this.correctCharacters + this.missedCharacters;
		const accuracy = ((this.correctCharacters / characters) * 100).toFixed(1);
		console.log(`WPM: ${wpm}. Accuracy: ${accuracy}%`);
	}
}

class FreeformHeadliner extends Headliner {
	constructor() {
		super(...arguments);
		this.missDebt = 0;
	}

	newTitle() {
		this.missDebt = 0;
		return super.newTitle();
	}

	processStdin(data) {
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
		switch (code) {
			case currentCharCode:
				if (this.missDebt === 0) {
					this.recordCorrectCharacter();
				}
				return;
			case KEY_BACKSPACE:
				if (this.missDebt > 0) {
					this.missDebt--;
					writeBackspace();
				} else if (this.phraseIndex > 0) {
					this.phraseIndex--;
					writeBackspace();
				}
				return;
			default:
				if (currentCharCode > ASCII_MAX && this.missDebt === 0) {
					this.recordCorrectCharacter(); // e for effort
				} else {
					this.missedCharacters++;
					if (this.enableErrorBell === true) {
						soundBell();
					}
					if (code >= ASCII_MIN) {
						this.missDebt++;
						process.stdout.write(data);
					}
				}
		}
	}
}

function writeBackspace() {
	process.stdout.write('\b \b');
}

function soundBell() {
	process.stderr.write('\u0007');
}

module.exports = {
	Headliner,
	FreeformHeadliner
};
