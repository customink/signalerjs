# Feature Definition

When configuring on the client-side, features can be configured with a POJO. Each top-level key must be an object where each key is the name of a feature and the properties `expires` and `flags` are permitted, where `expires` is optional and `flags` is required.

## Expires

The `expires` property is optional. `expires` can be a number of days from the current date that the feature cookie should expire or a GMT date string. When `expires` is not defined the cookie expiration the [`cookieDefaults` configuration](./configuration.md) (if it was defined) otherwise it defaults to 30 days.

## Flags

`flags` can be an array of strings or an object. Using an array provides an easy way to define flags with equal weights, while an object allows for weighting each flag with a different probability.

In the case that `flags` is an array, each string in the array represents a flag and one flag is randomly selected from the array when sampling a user into a feature flag test group.

When `flags` is an object, each key represents the weight of the flag compared to the others. These weights are normalized out of the total sum of the flags and then one is randomly selected taking the weight into account when a user is sampled into a feature flag test group.

## Example

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

var sm = new Signalman(features);
```
