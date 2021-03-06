var mdns = require('multicast-dns');

const defaults = {
  ttl: 7000,
  interval: 2500,
  full_scan: false,
  name: null,
  friendly_name: null,
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

  var timer = (isNaN(opts.ttl) || opts.ttl <= 0)
  ? null
  : setTimeout(() => {
      timer = null;
      close();
      if(!opts.full_scan || devices.length === 0) {
        cb(new Error('device not found'));
      } else if(opts.full_scan) {
        cb(null, devices);
      }
    }, opts.ttl);

  var getIsDuplicate = (info) => {
    return devices.some(device => {
      if(device.port && info.port) {
        return (device.ip === info.ip && device.port === info.port);
      }
      return device.ip === info.ip;
    });
  };

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

    var getFriendlyName = () => {
      var fn = resp_txt.data.find(item => String(item).startsWith('fn='));
      if(fn) {
        fn = String(fn).split('fn=')[1];
        return fn;
      }
      return null;
    };

    var info = {
      name: resp_a.name,
      friendlyName: getFriendlyName(),
      ip: resp_a.data,
      port: null
    };

    if(opts.service_name === defaults.service_name && !info.friendlyName) {
      return;
    }

    if(opts.friendly_name) {
      if(!info.friendlyName || opts.friendly_name !== info.friendlyName) {
        return;
      }
    }

    var resp_srv = response.additionals.find(entry => {
      return entry.type === 'SRV';
    });

    if(resp_srv && resp_srv.data && resp_srv.data.port) {
      info.port = resp_srv.data.port;
    }

    if(opts.full_scan) {
      if(devices.length === 0 || !getIsDuplicate(info)) {
        devices.push(info);
      }
    } else {
      close();
      cb(null, info, response);
    }
  };

  m.on('response', onResponse);

  var scanQuery = () => {
    m.query({
      questions:[{
        name: opts.service_name,
        type: opts.service_type
      }]
    });
  };

  scanQuery();
  var interval = setInterval(() => scanQuery(), opts.interval);

  var close = () => {
    m.removeListener('response', onResponse);
    clearInterval(interval);
    if(timer) {
      clearTimeout(timer);
    }
    m.destroy();
  };

  return close;
};
