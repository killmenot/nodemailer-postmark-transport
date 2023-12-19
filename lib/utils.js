'use strict';

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
      return typeof addr === 'object'
        ? [addr]
        : addressparser(addr);
    })
    .reduce((acc, cur) => {
      return acc.concat(cur);
    }, []);
}

function headersParser(headers) {
  if (!Array.isArray(headers)) {
    headers = Object.keys(headers).map((name) => {
      return Array.isArray(headers[name])
        ? headers[name].map(function (x) {
          return {
            key: name,
            value: x
          };
        })
        : {
            key: name,
            value: headers[name]
          };
    });
  }

  return headers
    .reduce(function (acc, x) {
      return acc.concat(x);
    }, [])
    .map((header) => {
      return {
        Name: header.key,
        Value: header.value
      };
    });
}

function callbackPromise(resolve, reject) {
  return function () {
    const args = Array.from(arguments);
    const err = args.shift();
    if (err) {
      reject(err);
    } else {
      resolve(...args);
    }
  };
}

module.exports = {
  addressFormatter,
  addressParser,
  callbackPromise,
  headersParser
};
