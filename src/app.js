const Episode = require('./episode');
const Manager = require('./manager');

try {
  const manager = new Manager();

  for (let i = 0; i < 12; i++) {
    manager.add(new Episode("https://www.stream-vf.co/anime/one-piece-vostfr/episode-" + (472 + i)));
  }

  manager.download();

} catch (err) {
  console.log(err.message)
}