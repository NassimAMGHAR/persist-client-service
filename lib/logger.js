const bunyan = require('bunyan')

const log = (name, filename) => {
  if(process.env.NODE_ENV === 'development') {
    return {
      error: (e) => { console.log(e); },
      info: (i) => { console.log(i); },
      warn: (w) => { console.log(w); }
    }
  }

  return bunyan.createLogger({
    name: name,
    streams: [{
      type: 'rotating-file',
      path: filename,
      period: '1d',   // daily rotation
      count: 3        // keep 3 back copies
    }]
  })
}

module.exports = log
