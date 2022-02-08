import md5 from 'blueimp-md5';
import Cookies from 'cookies-js';
import sample from 'samplejs';
import {defaultDomain, daysAfterToday} from './helpers';

const cookieDefaults = {
  path: '/',
  domain: defaultDomain(window.location.hostname),
  expires: daysAfterToday(30)
};

const featuresCurrentFlags = features => {
  const flags = {};
  features.map(featureName => {
    flags[featureName] = featureFlagFromCookie(featureName);
  });
  return flags;
}

const featureFlagFromCookie = featureName => {
  let cookieValue = Cookies.get(md5(featureName));
  if (cookieValue) {
    Cookies.set(`feature_${featureName}`, cookieValue);
    Cookies.expire(md5(featureName));
  } else {
    cookieValue = Cookies.get(`feature_${featureName}`);
  }
  return cookieValue;
}

const cookieOptionsFromExpires = expires => {
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
  const transformCookieOptions = config.transformCookieOptions || (data => data);
  Cookies.defaults = config.cookieDefaults || cookieDefaults;

  const featureFlags = () => {
    switch (typeof urlOrFeatures) {
      case 'string':
        return window
          .fetch(`${urlOrFeatures}.json`)
          .then(response => response.json())
          .then(data => {
            return featuresCurrentFlags(Object.keys(data));
          });
      default:
        return new Promise(resolve => resolve(featuresCurrentFlags(Object.keys(urlOrFeatures))));
    }
  }

  const featureFlag = featureName => {
    const cookieValue = featureFlagFromCookie(featureName);
    if(cookieValue) {
      return cookieValue;
    } else { 
      const feature = urlOrFeatures[featureName];
      const flag = sample(feature.flags);
      const cookieOpts = cookieOptionsFromExpires(feature.expires);
      setFeatureFlag(featureName, flag, cookieOpts);
      return flag;
    }
  }

  const featureFlagFromServer = featureName => {
    return window
      .fetch(`${urlOrFeatures}/${featureName}.json`)
      .then(response => response.json())
      .then(data => {
        const cookieOpts = cookieOptionsFromExpires(data.expires);
        setFeatureFlag(featureName, data.flag, cookieOpts);
        return data.flag;
      });
  }

  const setFeatureFlag = (featureName, flag, options = {}) => {
    Cookies.set(`feature_${featureName}`, flag, transformCookieOptions(options));
  }

  return {
    featureFlags,
    featureFlag,
    featureFlagFromServer,
    setFeatureFlag
  };
}
