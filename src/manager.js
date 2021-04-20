const Episode = require("./episode");
const cliProgress = require('cli-progress');
const _colors = require('colors');

class Manager {

  /**
   * @param  {Number} simultaneousDl Maximum number of simultaneous downloads
   * @param  {string} path Output path of episodes
   * @param  {Array<Episode>} episode Array of episode you want to download
   */
  constructor(simultaneousDl = 5, path = "./output/", episodes = []) {
    this.bar = [];
    this.episodes = episodes;
    this.simultaneousDl = simultaneousDl;
    this.path = path;

    // Progress bar
    this.multibar = new cliProgress.MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: _colors.cyan('{bar}') + '| {percentage}% || {file}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
  }

  add(episode) {
    this.episodes.push(episode);
  }

  download(start = 0, stop = this.simultaneousDl) {
    if (this.episodes.length == 0) return

    let promise = [];

    if (start == 0) {
      console.log('Total episode          :  ' + this.episodes.length);
      console.log('Simultaneous download  :  ' + this.simultaneousDl);
      console.log();
      console.log('Download in progress ...');
    }

    // Start download of a range of episode 
    for (let index = start; index < stop; index++) {
      //this.promise.push(this.episodes[index].start);
      promise.push(this.episodes[index].ddl(this.path, this.multibar))
    }

    // When all download from the range done, start next download
    Promise.all(promise).then((resolve, reject) => {
      if (stop != this.episodes.length) {
        start += this.simultaneousDl;
        // If stop index is bigger than the array set stop index to size of array
        let stop = start + this.simultaneousDl > this.episodes.length ? this.episodes.length : start + this.simultaneousDl;
        this.download(start, stop);
      } else {
        this.multibar.stop();
      }
    })
  }
}

module.exports = Manager