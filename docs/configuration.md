# Configuration

The `Signalerjs` function takes an optional configuration object as its second argument. The configuration options both affect how cookies are stored in the browser.

## cookieDefaults

The `cookieDefaults` key of the configuration object allows to set the default options used when setting cookies (`path`, `domain`, and `expires`).

Defaults:
- `path`: '/'
- `domain`: `window.location.hostname`
- `expires`: 30 days after the current date

```js
var primaryEndpoint = '/myUrl';
var config = {
  cookieDefaults: {
    path: '/',
    domain: '.example.com'
  }
};
var signal = new Signaler(primaryEndpoint, config);
```

## transformCookieOptions

This is a hook to allow for even more dynamic configuration of the cookie options that `cookieDefaults` does not provide alone. The cookie options are passed through this function before being used to set the cookie.

```js
var primaryEndpoint = '/myUrl';
var config = {
  transformCookieOptions: function(config) {
    return {
      path: config.path,
      expires: Math.floor(Math.random() * 30) + 1
    };
  }
};
var signal = new Signaler(primaryEndpoint, config);
```
