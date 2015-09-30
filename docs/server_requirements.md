# Server Requirements

In addition to setting up entirely on the [client-side](./feature_definition.md) `Signalmanjs` allows use of an existing API endpoint on a server to power the configuration of feature flags as well as sampling.

## Setup

```js
import Signalman from 'signalmanjs';

var sm = new Signalman('/myEndpoint');
```

## Example Data Returned from API

### Primary Endpoint

The job of this endpoint is to provide a list of the features. The only requirement from the JSON returned by the primary endpoint is that the top level keys must be the feature names.

```js
// /myEndpoint.json
{
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
}
```

### Feature Endpoint

The job of the feature endpoint is to sample users into test groups, which are then stored into cookies for persistence. This endpoint returns the feature `flag` the user has been sampled into and the cookie expiration `expires`.

#### Flag

The `flag` property is required and is string that notes the flag group the user has been sampled into by the server.

#### Expires

The `expires` property is optional. `expires` can be a number of days from the current date that the feature cookie should expire or a GMT date string. When `expires` is not defined the cookie expiration the [`cookieDefaults` configuration](./configuration.md) (if it was defined) otherwise it defaults to 30 days.

```js
// /myEndpoint/featureOne.json
{
  flag: 'test',
  expires: 30
}

// /myEndpoint/featureTwo.json
{
  flag: 'control',
  expires: '15 Jan 2016 20:28:44 GMT'
}
```
