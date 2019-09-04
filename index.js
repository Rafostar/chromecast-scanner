var mdns = require('multicast-dns');
var dnstxt = require('dns-txt')();

var defaults = {
  ttl: 5000,
  full_scan: false,
  service_name: '_googlecast._tcp.local',
  service_type: 'PTR',
  mdns: {}
};

module.exports = (opts, cb) => {
  if(typeof opts === 'function') {
    cb = opts;
    opts = defaults;
  } else {
    opts = {...defaults, ...opts};
  }

  var devices = [];
  var m = mdns(opts.mdns);

  var timer = setTimeout(() => {
    close();
    if(!opts.full_scan || devices.length == 0) {
      cb(new Error('device not found'));
    } else if(opts.full_scan) {
      cb(null, devices);
    }
  }, opts.ttl);

  var onResponse = response => {
    var answer = response.answers[0];

    if(answer &&
        (answer.name !== opts.service_name ||
         answer.type !== opts.service_type)) {
      return;
    }

    var resp_a = response.additionals.find(entry => {
      return entry.type === 'A';
    });

    var resp_txt = response.additionals.find(entry => {
      return entry.type === 'TXT';
    });

    if(!resp_a || !resp_txt || (opts.name && resp_a.name !== opts.name)) {
      return;
    }

    var info = {
      name: resp_a.name,
      friendlyName: dnstxt.decode(resp_txt.data).fn,
      ip: resp_a.data
    };

    if(opts.full_scan) devices.push(info);
    else {
      cb(null, info, response);
      close();
    }
  };

  m.on('response', onResponse);

  m.query({
    questions:[{
      name: opts.service_name,
      type: opts.service_type
    }]
  });

  var close = () => {
    m.removeListener('response', onResponse);
    clearTimeout(timer);
    m.destroy();
  };

  return close;
};
