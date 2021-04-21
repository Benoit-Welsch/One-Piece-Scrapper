const fs = require('fs');
const { join, resolve } = require('path');
const axios = require('axios');
const { MultiBar } = require('cli-progress');

// Api url used to get download link
const APIURL = "https://stream-vf.xyz/api/source/";

// Tag html
const tagScriptStart = "<script type=\"text/javascript\">document.write(f('"
const tagScriptStop = "'));</script> </center></div>"
const tagIdStart = "src=\"https://stream-vf.xyz/v/"
const tagIdStop = "\" frameborder=\"0\" allowfullscreen></iframe>"

String.prototype.splitAndCaps = function() {
  //replace '-' by space and apply cappitale letter to each word
  return this.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

class Episode {
  /**
   * @param  {string} url Url of the episode you want to download
   */

  constructor(url) {
    // Episode Url
    this.url = url

    // Get name from url
    let splitedUrl = url.split('/');
    this.name = splitedUrl[4].splitAndCaps() + " " + splitedUrl[5].splitAndCaps();

    // All promise made by this episode
    this.requests = [];

    // Current state of episode 
    this.state = {
      downloading: false,
      done: false,
    }
  }

  /**
   * Return true if episode not downloaded and not started
   */
  isReady() {
    return !this.state.downloading && !this.state.done;
  }

  /**
   * Fetch id from the streaming html page
   */
  getId() {
    // Get id from scr link in video player
    let req = axios
      .get(this.url)
      .then(res => {
        // Get Script 
        let body = res.data;
        let script = body.substring(body.indexOf(tagScriptStart) + tagScriptStart.length, body.indexOf(tagScriptStop));
        // Script is base64 -> convert to string
        let text = Buffer.from(script, 'base64').toString();
        // Get id from src of iframe
        if (text.indexOf(tagIdStart) == -1 || text.indexOf(tagIdStop) == -1) {
          throw new Error('⚠️  Invalid Url provided')
        }
        this.id = text.substring(text.indexOf(tagIdStart) + tagIdStart.length, text.indexOf(tagIdStop));
      })
    this.requests.push(req);
    return req;
  }

  /**
   * Request Direct Download Link from streaming api
   */
  async getDdlLink() {
    // If no id wait for it
    if (!this.id) await this.getId();

    // Get original link from video player api
    let req = axios
      .post(APIURL + this.id)
      .then(res => {
        let body = res.data;
        this.ddlUrl = body.data[1].file || body.data[0].file;
        this.ddlUrl = this.ddlUrl.replace("https", "http");
        this.resolution = body.data[1].label || body.data[0].label;
        this.format = body.data[1].type || body.data[0].type;
      })

    this.requests.push(req);
    return req
  }

  /**
   * Download episode and save it inside path
   * @param  {string} path Output path of the episode
   * @param  {MultiBar} multibar Multibar instance to show progress
   */
  async ddl(path, multibar = null) {
    // Update status
    this.state.downloading = true;

    // If no ddlUrl wait for it
    if (!this.ddlUrl) await this.getDdlLink();

    // Check output path
    if (!fs.existsSync(path)) throw new Error('⚠️  Folder doesn\'t exist -> not downloaded (' + resolve(path) + ')')

    // Create file if doesn't exist
    let fileName = join(path, this.name) + "." + this.format;
    if (fs.existsSync(fileName)) throw new Error('⚠️  File already exist -> not downloaded (' + this.name + ')')
    let file = fs.createWriteStream(fileName);

    // Start download
    let req = new Promise((resolve, reject) => {
      axios
        .get(this.ddlUrl, {
          method: 'GET',
          responseType: 'stream'
        })
        .then(res => {
          // Write file
          res.data.pipe(file);

          if (multibar) {
            // Create progress bar
            this.lenght = res.headers['content-length'];
            this.currentSize = 0;
            const bar = multibar.create(this.lenght, this.currentSize, { file: this.name });

            // Update progress bar
            res.data.on('data', (chunk) => {
              this.currentSize += chunk.length;
              if (bar) {
                bar.update(this.currentSize, { file: this.name })
              }
            })
          }

          // Done
          res.data.on('end', () => {
              this.state.downloading = false;
              this.state.done = true;
              resolve(this)
            })
            // Error
          res.data.on('error', () => {
            reject()
          })
        })
    })
    this.requests.push(req);
    return req;
  }

  simulate(path, multibar) {
    this.state.downloading = true;
    let max = 10;
    let value = 0;

    let done = () => {
      this.state.done = true;
    }

    const bar = multibar.create(max, value, { file: this.name });
    var name = this.name;
    return new Promise((resolve, reject) => {
      var timer = setInterval(function() {
        // increment value
        value++;

        // update the bar value
        bar.update(value, { file: name })

        // set limit
        if (value >= bar.getTotal()) {
          // stop timer
          clearInterval(timer);
          done()
          bar.stop();
          resolve()
        }
      }, 500 * Math.random());

    })
  }
}

module.exports = Episode;