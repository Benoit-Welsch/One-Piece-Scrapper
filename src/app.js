const Episode = require('./episode');
const Manager = require('./manager');

const manager = new Manager();

for (let i = 0; i < 12; i++) {
  manager.push(new Episode("https://www.stream-vf.co/anime/one-piece-vostfr/episode-" + (472 + i)));
  //episode.ddl('./output/');
}

manager.download();