const Episode = require("./episode");

class Manager {

  /**
   * @param  {Array} episode Array of episode you want to download
   * @param  {Number} simultaneousDl Maximum number of simultaneous downloads
   */
  constructor(episodes = [], simultaneousDl = 5, path = "./output/") {
    this.bar = [];
    this.episodes = episodes;
    this.simultaneousDl = simultaneousDl;
    this.path = path;

    // Progress bar
    // this.multibar = new cliProgress.MultiBar({
    //   clearOnComplete: false,
    //   hideCursor: true
    // }, cliProgress.Presets.shades_grey);
  }

  push(episode) {
    this.episodes.push(episode);
  }

  download(start = 0, stop = this.simultaneousDl) {
    if (this.episodes.length == 0) return

    let promise = [];

    // Start download of a range of episode 
    for (let index = start; index < stop; index++) {
      //this.promise.push(this.episodes[index].start);
      promise.push(this.episodes[index].ddl(this.path))
    }
    console.log(start, stop)

    // When all download from the range done, start next download
    Promise.all(promise).then((resolve, reject) => {
      if (stop != this.episodes.length) {
        start += this.simultaneousDl;
        // If stop index is bigger than the array set stop index to size of array
        let stop = start + this.simultaneousDl > this.episodes.length ? this.episodes.length : start + this.simultaneousDl;
        this.download(start, stop);
      }
    })
  }
}

module.exports = Manager