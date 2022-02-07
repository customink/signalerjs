# API

After a `Signalerjs` object created with either with [server-side](./server_requirements.md) or [client-side](./feature_definition.md) backed sampling, three functions are exposed.

## Constructor

### Server-side sampling

`Signalerjs` can flag users into feature test groups by sampling on the client side. To configure this way, a string of the path to the primary JSON endpoint is the first argument of the `Signalerjs` function and an optional [configuration](./configuration.md) object is the second. [More details](./server_requirements.md)

```js
const primaryEndpoint = '/myUrl';
const config = {
  cookieDefaults: {
    path: '/'
  }
};
const signal = new Signaler(primaryEndpoint, config);
```

### Client-side sampling

`Signalerjs` can flag users into feature test groups by sampling on the client side. To configure this way, a features object is the first argument of the `Signalerjs` function and an optional [configuration](./configuration.md) object is the second. [More details](./feature_definition.md)

```js
const features = {
  featureOne: {
    flags: ['test', 'control'],
    expires: 30
  },
  featureTwo: {
    flags: ['test', 'control'],
    expires: 10
  }
};
const config = {
  cookieDefaults: {
    path: '/'
  }
};
const signal = new Signaler(features, config);
```

## featureFlags

Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) containing an object with all the feature flags that the user has been sampled into. Each key in the object is the name of a feature, and each value is the feature flag value. If the value is undefined, the user has not been flagged into a group for that feature.

```js
const signal = new Signaler(features);

signal.featureFlags().then(function (flags) {
  // flags =>
  // {
  //   featureOne: 'test',
  //   featureTwo: 'control',
  //   featureS: undefined
  // }
});
```

## featureFlag

Returns the flag value a user has for a given test. If the user is not flagged into a test group for that feature, they are sampled into one at this time and the value is stored to a cookie and returned.

```js
var signal = new Signaler(features);

const flag = signal.featureFlag('featureOne');
```

## featureFlagFromServer

Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) containing the flag value a user has for a given feature if you are requesting. If the user is not flagged into a test group for that feature, they are sampled into one at this time and the value is stored to a cookie and returned.

```js
const signal = new Signaler(features);

signal.featureFlag('featureOne').then(function (flag) {
  // flag => 'test'
});
```

## setFeatureFlag

This sets the feature flag in a cookie. Since `featureFlag` handles flagging users into a test group for you, this is probably not a function you will need to use. It is provided as a hook in case any extra functionality regarding cookies/ sampling is required that is outside of the scope of this `Signalerjs`.

`setFeatureFlag` takes the feature name as the first argument, the flag value as the second, and optionally takes an object of options to be used when setting the cookie. This may use `cookieDefaults` or the `transformCookieOptions` function if they have been defined in the [configuration](./configuration.md).

One important thing to note is that the cookie names are MD5 hashed values of the feature names. This is to obscure details from users.

```js
const signal = new Signaler(features);
g
signal.setFeatureFlag('featureOne', 'test', {domain: '.example.com'});
```
