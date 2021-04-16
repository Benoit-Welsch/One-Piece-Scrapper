const ddl = require('./ddl');

for (let i = 0; i < 10; i++) {
  let url = "https://www.stream-vf.co/anime/one-piece-vostfr/episode-" + (390 + i)
  ddl(url)
}