# multicast-scanner
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TFVDFD88KQ322)
[![Donate](https://img.shields.io/badge/Donate-PayPal.Me-lightgrey.svg)](https://www.paypal.me/Rafostar)

### Scan your local network for mDNS devices.
Based on [xat/chromecast-scanner](https://github.com/xat/chromecast-scanner).

Scanner is set to scan for Chromecasts by default. Service name and type to scan for can be set when launching scan.

Defaults:
```javascript
{
  ttl: 7000,
  interval: 2500,
  full_scan: false,
  name: null,
  friendly_name: null,
  service_name: '_googlecast._tcp.local',
  service_type: 'PTR',
  mdns: {}
}
```

The `mdns` object in options is passed to `multicast-dns` and can be used to alter its defaults.

### Usage Example
```javascript
var scanner = require('multicast-scanner');

scanner({ full_scan: true }, (err, devices) => {
  if(err) return console.log(err.message);

  devices.forEach(device => {
    console.log(device);
  });
});
```

```javascript
/* Example Output:
{ name: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX.local',
  friendlyName: 'My Chromecast',
  ip: '192.168.1.XXX' }
*/
```

### Installation

`npm install multicast-scanner`

## License
MIT

## Donation
If you like my work please support it by buying me a cup of coffee :grin:

[![PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TFVDFD88KQ322)
