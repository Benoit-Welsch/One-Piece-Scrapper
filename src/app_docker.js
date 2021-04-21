const Episode = require('./episode');
const Manager = require('./manager');

try {

  if (!process.env.start || !process.env.stop) {
    throw new Error(("⚠️  Please define a range through start and stop environment variables"))
  }

  const manager = new Manager(process.env.concurrentDl);

  for (let i = parseInt(process.env.start); i < parseInt(process.env.stop); i++) {
    manager.add(new Episode("https://www.stream-vf.co/anime/one-piece-vostfr/episode-" + i));
  }
  manager.download();

} catch (err) {
  console.log(err.message)
}