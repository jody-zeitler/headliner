const axios = require('axios');

function* generateNewsTitles() {
	while (true) {
		let count = 1;
		const titles = fetchNewsTitles().then((results) => {
			count = results.length || 0;
			if (count <= 0) {
				throw new Error('empty result set');
			}
			return results;
		});
		for (let i = 0; i < count; i++) {
			yield titles.then((results) => results[i]);
		}
	}
}

function fetchNewsTitles() {
	return axios.get('https://en.wikinews.org/w/api.php?format=json&action=query&generator=random&grnnamespace=0&grnlimit=10')
		.then(({data}) => {
			return Object.values(data.query.pages).map((p) => p.title);
		});
}

module.exports = {generateNewsTitles};
