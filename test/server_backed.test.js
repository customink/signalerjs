import {Promise} from 'es6-promise';
// import md5 from 'blueimp-md5';
import Cookies from 'cookies-js';
import Signaler from '../src';

window.fetch = jest.fn();

describe('Signaler (server backed)', () => {
  beforeEach(() => {
    Cookies.set('feature_featureOne', 'control');
    Cookies.set('feature_featureTwo', 'test');
    Cookies.set('feature_featureThree', 'something');
  });

  afterEach(() => {
    Cookies.expire('feature_featureOne');
    Cookies.expire('feature_featureTwo');
    Cookies.expire('feature_featureThree');
    window.fetch.mockClear();
  });

  afterAll(() => {
    delete window.fetch;
  });

  describe('setup', () => {
    it('sets url', () => {
      const signal = new Signaler('myUrl');
      expect(signal.featureFlags).toBeInstanceOf(Function);
      expect(signal.featureFlagFromServer).toBeInstanceOf(Function);
      expect(signal.setFeatureFlag).toBeInstanceOf(Function);
    });
  });

  describe('featureFlags', () => {
    it('returns current cookie values of feature flags', async () => {
      const returnedFlags = {
        featureOne: 'control',
        featureTwo: 'test',
        featureThree: 'something'
      };
      const response = {
        json: () =>
          Promise.resolve({
            featureOne: ['test', 'control'],
            featureTwo: ['test', 'control'],
            featureThree: ['test', 'control', 'something']
          })
      };
      const mockFetch = window.fetch.mockImplementation(() =>
        Promise.resolve(response)
      );
      const signal = new Signaler('myUrl');
      const flags = signal.featureFlags();

      await flags.then(data => {
        expect(mockFetch).toHaveBeenCalledWith('myUrl.json');
        expect(data).toEqual(returnedFlags);
      });
    });
  });

  describe('featureFlag', () => {
    describe('feature is stored in a cookie already', () => {
      it('returns the feature flag value', () => {
        const signal = new Signaler('myUrl');
        const flag = signal.featureFlagFromServer('featureOne');
        const flag2 = signal.featureFlagFromServer('featureTwo');
        Promise.all([flag, flag2]).then(([flagData, flag2Data]) => {
          expect(flagData).toEqual('control');
          expect(flag2Data).toEqual('test');
        });
      });
    });

    describe('feature is not stored in a cookie', () => {
      describe('response.expires is a string', () => {
        it('gets the flag value and sets it to a cookie', async () => {
          const signal = new Signaler('myUrl');
          const featureName = 'notSet';
          const flagValue = 'flagValue';
          // 12096e5 is 14 days in miliseconds
          const expiresValue = new Date(Date.now() + 12096e5).toJSON();
          const response = {
            json: () =>
              Promise.resolve({flag: flagValue, expires: expiresValue})
          };
          const mockFetch = window.fetch.mockImplementation(() =>
            Promise.resolve(response)
          );
          const flag = signal.featureFlagFromServer(featureName);

          await flag.then(data => {
            expect(mockFetch).toHaveBeenCalledWith(`myUrl/${featureName}.json`);
            expect(data).toEqual(flagValue);

            const cookieVal = Cookies.get(`feature_${featureName}`);
            expect(cookieVal).toEqual(flagValue);
          });
        });
      });

      describe('response.expires is a number', () => {
        it('gets the flag value and sets it to a cookie with the expires option being the number of days after the current date', async () => {
          const signal = new Signaler('myUrl');
          const featureName = 'notSet2';
          const flagValue = 'flagValue';
          const response = {
            json: () => Promise.resolve({flag: flagValue, expires: 30})
          };
          const mockFetch = window.fetch.mockImplementation(() =>
            Promise.resolve(response)
          );
          const flag = signal.featureFlagFromServer(featureName);

          await flag.then(data => {
            expect(mockFetch).toHaveBeenCalledWith(`myUrl/${featureName}.json`);
            expect(data).toEqual(flagValue);

            const cookieVal = Cookies.get(`feature_${featureName}`);
            expect(cookieVal).toEqual(flagValue);
          });
        });
      });

      describe('response.expires is not defined', () => {
        it('gets the flag value and sets it to a cookie', async () => {
          const signal = new Signaler('myUrl');
          const featureName = 'notSet3';
          const flagValue = 'flagValue';
          const response = {json: () => Promise.resolve({flag: flagValue})};
          const mockFetch = window.fetch.mockImplementation(() =>
            Promise.resolve(response)
          );
          const flag = signal.featureFlagFromServer(featureName);

          await flag.then(data => {
            expect(mockFetch).toHaveBeenCalledWith(`myUrl/${featureName}.json`);
            expect(data).toEqual(flagValue);

            const cookieVal = Cookies.get(`feature_${featureName}`);
            expect(cookieVal).toEqual(flagValue);
          });
        });
      });
    });
  });

  describe('setFeatureFlag', () => {
    const cookieSpy = jest.spyOn(Cookies, 'set');

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      cookieSpy.mockClear();
    })

    it('sets the cookie with the options passed in', () => {
      const signal = new Signaler('myUrl');
      const featureName = 'newFeature';
      const featureVal = 'myVal';

      signal.setFeatureFlag(featureName, featureVal);
      const cookieVal = Cookies.get(`feature_${featureName}`);

      expect(cookieSpy).toHaveBeenCalledWith(`feature_${featureName}`, featureVal, {});
      expect(cookieVal).toEqual('myVal');
    });

    it('transforms cookie options', () => {
      const signal = new Signaler('myUrl', {
        transformCookieOptions: obj => {
          obj.path = '/secret';
          return obj;
        }
      });
      const featureName = 'newFeature';
      const featureVal = 'myVal';
      signal.setFeatureFlag(featureName, featureVal, {domain: 'domain'});
      const cookieVal = Cookies.get(`feature_${featureName}`);
      expect(cookieSpy).toHaveBeenCalledWith(`feature_${featureName}`, featureVal, {
        path: '/secret',
        domain: 'domain'
      });
      expect(cookieVal).toEqual('myVal');
    });
  });
});
