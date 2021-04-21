const fs = require('fs');
const { resolve } = require('path');

const Episode = require("./episode");
const { MultiBar } = require('cli-progress');
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

    if (!fs.existsSync(path)) throw new Error('⚠️  Folder doesn\'t exist -> not downloaded (' + resolve(path) + ')')

    // Progress bar
    this.multibar = new MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: _colors.cyan('{bar}') + '| {percentage}% || {file}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      stopOnComplete: true,
    });
  }

  add(episode) {
    if (this.episodes.find(epi => epi.url === episode.url)) console.log('⚠️  Duplicated episode -> not added (' + episode.name + ')')
    else this.episodes.push(episode);
  }

  list() {
    this.episodes.forEach(episode => {
      console.log(episode.name)
    });
  }

  showData() {
    console.log('Total episode          :  ' + this.episodes.length);
    console.log('Simultaneous download  :  ' + this.simultaneousDl);
    console.log();
    console.log('Download in progress ...');
  }

  download() {
    if (this.episodes.length == 0) return

    let start = 0;
    let stop = this.episodes.length < this.simultaneousDl ? this.episodes.length : this.simultaneousDl;
    let promise = [];

    this.showData()

    // Global progress bar
    const bar = this.multibar.create(this.episodes.length, 0, { file: 'Total' })

    const ddlNextEpisode = () => {
      // Find the next episode to download 
      let episode = this.episodes.find(episode => episode.isReady());
      if (episode) {

        let ddl = episode.ddl(this.path, this.multibar)
          .catch(err => {
            console.log(err.message)
          })
          .finally(() => {
            bar.increment();
            ddlNextEpisode()
          })

        promise.push(ddl)
      }
    }

    // Start download of a range of episode 
    for (let index = start; index < stop; index++) {
      ddlNextEpisode()
    }
  }

  simulate() {
    if (this.episodes.length == 0) return

    let start = 0;
    let stop = this.episodes.length < this.simultaneousDl ? this.episodes.length : this.simultaneousDl;
    let promise = [];

    this.showData()

    // Global progress bar
    const bar = this.multibar.create(this.episodes.length, 0, { file: 'Total' })

    const ddlNextEpisode = () => {
      // Find the next episode to download 
      let episode = this.episodes.find(episode => episode.isReady());
      if (episode) {

        let ddl = episode.simulate(this.multibar)
          .catch(err => {
            console.log(err.message)
          })
          .finally(() => {
            bar.increment();
            ddlNextEpisode()
          })

        promise.push(ddl)
      }
    }

    // Start download of a range of episode 
    for (let index = start; index < stop; index++) {
      ddlNextEpisode()
    }
  }
}

module.exports = Manager