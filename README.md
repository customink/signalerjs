[![npm version](https://badge.fury.io/js/signalerjs.svg)](http://badge.fury.io/js/signalerjs)
[![Build Status](https://secure.travis-ci.org/customink/signalerjs.svg?branch=master)](http://travis-ci.org/customink/signalerjs)
[![Dependency Status](https://david-dm.org/customink/signalerjs.svg)](https://david-dm.org/customink/signalerjs)

# Signalerjs

`Signalerjs` is an [AB testing](https://en.wikipedia.org/wiki/A/B_testing) library. It provides a JavaScript interface to sample users into test groups and specify different logic depending on the test group in which a user has been placed. We will refer to each test as a "feature" and the different test groups per "feature" as "feature flags" (hence the name "Signaler").

## Installation

- `npm install --save signalerjs`

## Requirements

Note that if you plan to use `Signalerjs` in browsers that do not have [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) support, you will need to polyfill it yourself with something like [`es6-promise`](https://github.com/jakearchibald/es6-promise).

## Setup

```js
// es6
import Signaler from 'signalerjs';

// es5 with modules
var Signaler = require('signalerjs');

// es5 without modules
// add script tag from node_modules/signalerjs/dist/signalerjs.min.js
var Signaler = window.signalerjs;
```

## Configuration

`Signalerjs` can get feature flag information from a server endpoint or from a JavaScript object on initialization.

### With Server

`Signalerjs` can work in conjunction with a server endpoint that provides JSON data about the features. In this case, the endpoint url needs to be specified in the constructor. [Server endpoint requirements](docs/server_requirements.md).

```js
var serverEndpoint = '/features';
var signal = new Signaler(serverEndpoint);
```

### Without Server

`Signalerjs` can also work entirely on the client-side without the need for a server. In this case the features with their possible flags are specified as an object in the constructor. See [feature definition docs](docs/feature_definition.md);

```js
var features = {
  featureOne: {
    expires: 30,
    flags: ['test', 'control', 'other'],
  },
  featureTwo: {
    expires: '15 Jan 2016 20:28:44 GMT',
    flags: ['test', 'control']
  },
  featureThree:
    expires: 30,
    flags: {
      flagValue: 0.3,
      control: 0.7
    }
  }
};
var signal = new Signaler(features);
```

### Other Config

See [configuration docs](docs/configuration.md) for more details and customizing cookie option settings.

## General API

See full [API docs](docs/api.md).

```js
// get feature flags user is opted into
signal.featureFlags().then(function (flags) {
  // flags =>
  // {
  //   flagOne: 'test',
  //   flagTwo: 'control',
  //   anotherFlag: 'flagValue',
  //   // user has not yet been sampled into this test group
  //   yetAnother: undefined
  // }
});
```

## Example AB Test Usage/Reading values

### With Server
```js
signal.featureFlagFromServer('flagOne').then(function(flag) {
  if (flag === 'test') {
    // custom logic if user has 'test' flag for feature 'flagOne'
  else if (flag === 'control') {
    // custom logic if user has 'control' flag for feature 'flagOne'
  } else {
    // other logic
  }
});
```

### Without Server
```js
const flag = signal.featureFlag('flagOne')
if (flag === 'test') {
  // custom logic if user has 'test' flag for feature 'flagOne'
else if (flag === 'control') {
  // custom logic if user has 'control' flag for feature 'flagOne'
} else {
  // other logic
}
```
