import md5 from 'blueimp-md5';
import Cookies from 'cookies-js';
import sample from 'samplejs';
import {defaultDomain, daysAfterToday} from './helpers';

var cookieDefaults = {
  path: '/',
  domain: defaultDomain(window.location.hostname),
  expires: daysAfterToday(30)
};

function featuresCurrentFlags(features) {
  var flags = {};
  features.map(featureName => {
    flags[featureName] = featureFlagFromCookie(featureName);
  });
  return flags;
}

function featureFlagFromCookie(featureName) {
  return Cookies.get(md5(featureName));
}

function cookieOptionsFromExpires(expires) {
  switch (typeof expires) {
    case 'string':
      return {expires};
    case 'number':
      return {expires: daysAfterToday(expires)};
    default:
      return {};
  }
}

export default function Signaler(urlOrFeatures, config = {}) {
  var transformCookieOptions = config.transformCookieOptions || (data => data);
  Cookies.defaults = config.cookieDefaults || cookieDefaults;

  function featureFlags() {
    switch (typeof urlOrFeatures) {
      case 'string':
        return window.fetch(`${urlOrFeatures}.json`)
          .then(response => response.json())
          .then(data => {
            return featuresCurrentFlags(Object.keys(data));
          });
      default:
        var featureFlags = featuresCurrentFlags(Object.keys(urlOrFeatures));
        return new Promise(resolve => resolve(featureFlags));
    }
  }

  function featureFlag(featureName) {
    var cookieValue = featureFlagFromCookie(featureName);
    return cookieValue ? new Promise(resolve => resolve(cookieValue)) : featureFlagFromServer(featureName);
  }

  function featureFlagFromServer(featureName) {
    switch (typeof urlOrFeatures) {
      case 'string':
        return window.fetch(`${urlOrFeatures}/${featureName}.json`)
          .then(response => {
            console.log(response);
            console.log(response.json());
            response.json();
          })
          .then(data => {
            var cookieOpts = cookieOptionsFromExpires(data.expires);
            setFeatureFlag(featureName, data.flag, cookieOpts);
            return data.flag;
          });
      default:
        var feature = urlOrFeatures[featureName];
        var flag = sample(feature.flags);
        var cookieOpts = cookieOptionsFromExpires(feature.expires);
        setFeatureFlag(featureName, flag, cookieOpts);
        return new Promise(resolve => resolve(flag));
    }
  }

  function setFeatureFlag(featureName, flag, options = {}) {
    Cookies.set(md5(featureName), flag, transformCookieOptions(options));
  }

  return {
    featureFlags,
    featureFlag,
    setFeatureFlag
  };
}
