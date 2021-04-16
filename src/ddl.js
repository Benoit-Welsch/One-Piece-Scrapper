const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
const fs = require('fs');
const { join } = require('path');
const cliProgress = require('cli-progress');

// Tag html
const tagScriptStart = "<script type=\"text/javascript\">document.write(f('"
const tagScriptStop = "'));</script> </center></div>"
const tagIdStart = "src=\"https://stream-vf.xyz/v/"
const tagIdStop = "\" frameborder=\"0\" allowfullscreen></iframe>"

// Progress bar
const multibar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true

}, cliProgress.Presets.shades_grey);

// Api url used to get download link
const apiUrl = {
  hostname: "stream-vf.xyz",
  path: "/api/source/"
}


// Extract hostname and path from url  
const extractUrl = (url) => {
  let hostname;
  let path;

  // Find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }
  // Find & remove "?"
  hostname = hostname.split('?')[0];
  // Get path
  path = url.substring(url.indexOf(hostname) + hostname.length, url.length);
  return { hostname: hostname, path: path };
}

// Get id
const ddl = (url) => {
  url = extractUrl(url);
  let name = url.path.split('/')[3] + ".mp4";
  const req = https.request({
    hostname: url.hostname,
    port: 443,
    path: url.path,
    method: 'GET'
  }, res => {
    let body;
    res.on('data', d => {
      body += d;
    })
    res.on('end', () => {
      // Get Script 
      let script = body.substring(body.indexOf(tagScriptStart) + tagScriptStart.length, body.indexOf(tagScriptStop));
      // Script is base64 -> convert to string
      let text = Buffer.from(script, 'base64').toString();
      // Get id from src of iframe
      id = text.substring(text.indexOf(tagIdStart) + tagIdStart.length, text.indexOf(tagIdStop));
      // Get download url from api
      var req = https.request({
        'method': 'POST',
        'hostname': apiUrl.hostname,
        'path': apiUrl.path + id,
      }, function(res) {
        var apiResponse = "";

        res.on("data", (chunk) => {
          apiResponse += chunk;
        });

        res.on("end", () => {
          apiResponse = JSON.parse(apiResponse);
          let url = apiResponse.data[1].file || apiResponse.data[0].file
            // Download file
          start(url, name, './output/');
        });

        res.on("error", function(error) {
          console.error(error);
        });
      });

      req.end();

    })
  })

  req.on('error', error => {
    console.error(error)
  })
  req.end()
}

// Download file from url 
const start = (url, name, dir) => {
  let bar;
  let currentSize = 0;
  let totalSize = 0;

  // Create file
  const file = fs.createWriteStream(join(dir, name));
  // Download file
  const request = https.get(url, (response) => {
    // Create progress bar
    bar = multibar.create(response.headers['content-length'], 0, { filename: name });
    // Write file
    response.pipe(file);
    // Get size of data recieved
    response.on('data', (chunk) => {
      currentSize += chunk.length;
      if (bar) {
        bar.update(currentSize)
      }
    })
  })
  request.on('response', function(data) {
    totalSize = data.headers['content-length']
  });
  request.end()
}

module.exports = ddl;