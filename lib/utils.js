const util = require('util');
const addressparser = require('addressparser');

function addressFormatter(addr) {
  if (addr.address && addr.name) {
    return util.format('"%s" <%s>', addr.name, addr.address);
  }

  return addr.address;
}

function addressParser(addrs) {
  if (!Array.isArray(addrs)) {
    addrs = [addrs];
  }

  return addrs
    .map((addr) => {
      return typeof addr === 'object' ?
        [addr] :
        addressparser(addr);
    })
    .reduce((acc, cur) => {
      return acc.concat(cur);
    }, []);
}

function headersParser(headers) {
  if (!Array.isArray(headers)) {
    headers = Object.keys(headers).map((name) => {
      return { 
        key: name,
        value: headers[name]
      };
    });
  }

  return headers
    .map((header) => {
      return { 
        'Name': header.key,
        'Value': header.value
      };
    });
}

module.exports = {
  addressFormatter: addressFormatter,
  addressParser: addressParser,
  headersParser: headersParser
};
