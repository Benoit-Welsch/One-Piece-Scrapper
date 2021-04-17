const fs = require('fs');
const { join } = require('path');
const axios = require('axios');

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
    this.url = url
    let splitedUrl = url.split('/');
    this.name = splitedUrl[4].splitAndCaps() + " " + splitedUrl[5].splitAndCaps();
    this.requests = [];
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
        this.resolution = body.data[1].label || body.data[0].label;
        this.format = body.data[1].type || body.data[0].type;
      })

    this.requests.push(req);
    return req
  }

  /**
   * Download episode and save it inside path
   * @param  {string} path Output path of the episode
   */
  async ddl(path, multibar = null) {
    // If no ddlUrl wait for it
    if (!this.ddlUrl) await this.getDdlLink();

    // Create file
    let file = fs.createWriteStream(join(path, this.name) + "." + this.format);

    // Start download
    let req = new Promise((resolve, reject) => {
      axios
        .get(this.ddlUrl, {
          method: 'GET',
          responseType: 'stream',
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
              resolve()
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

}

module.exports = Episode;