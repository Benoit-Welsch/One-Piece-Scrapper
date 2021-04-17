const ddl = require('./ddl');

// for (let i = 0; i < 10; i++) {
//   let url = "https://www.stream-vf.co/anime/one-piece-vostfr/episode-" + (390 + i)
//   ddl(url)
// }

const Episode = require('./episode');
const Manager = require('./manager');

const manager = new Manager();

for (let i = 0; i < 12; i++) {
  manager.push(new Episode("https://www.stream-vf.co/anime/one-piece-vostfr/episode-" + (460 + i)));
  //episode.ddl('./output/');
}

manager.download();