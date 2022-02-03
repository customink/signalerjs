import {Promise} from 'es6-promise';
import md5 from 'blueimp-md5';
import Cookies from 'cookies-js';
import Signaler from '../src';

const features = {
  featureOne: ['control', 'test'],
  featureTwo: {
    control: 0.2,
    test: 0.8
  },
  featureThree: ['something', 'another'],
  notSetOne: {
    // 12096e5 is 14 days in miliseconds
    expires: new Date(Date.now() + 12096e5),
    flags: ['test', 'control']
  },
  notSetTwo: {
    expires: 30,
    flags: {
      control: 0.1,
      test: 0
    }
  },
  notSetThree: {
    flags: ['flag', 'flag2']
  }
};

describe('Signaler (client backed)', () => {
  beforeEach(() => {
    Cookies.set(md5('featureOne'), 'control');
    Cookies.set(md5('featureTwo'), 'test');
    Cookies.set(md5('featureThree'), 'something');
  });

  afterEach(() => {
    Cookies.expire(md5('featureOne'));
    Cookies.expire(md5('featureTwo'));
    Cookies.expire(md5('featureThree'));
  });

  describe('setup', () => {
    it('sets features', () => {
      const signal = new Signaler(features);
      expect(signal.featureFlags).toBeInstanceOf(Function);
      expect(signal.featureFlag).toBeInstanceOf(Function);
      expect(signal.setFeatureFlag).toBeInstanceOf(Function);
    });
  });

  describe('featureFlags', () => {
    it('returns current cookie values of feature flags', async () => {
      const returnedFlags = {
        featureOne: 'control',
        featureTwo: 'test',
        featureThree: 'something',
        notSetOne: undefined,
        notSetTwo: undefined,
        notSetThree: undefined
      }
      const signal = new Signaler(features);
      const flags = signal.featureFlags();

      await flags.then(data => {
        expect(data).toEqual(returnedFlags);
      });
    });
  });

  describe('featureFlag', () => {
    describe('feature is stored in a cookie already', () => {
      it('returns the feature flag value', async () => {
        const signal = new Signaler(features);
        const flag = signal.featureFlag('featureOne');
        const flag2 = signal.featureFlag('featureTwo');
        await Promise.all([flag, flag2]).then(([flagData, flag2Data]) => {
          expect(flagData).toEqual('control');
          expect(flag2Data).toEqual('test');
        });
      });
    });

    describe('feature is not stored in a cookie', () => {
      describe('response.expires is a string', () => {
        it('gets the flag value and sets it to a cookie', async () => {
          const signal = new Signaler(features);
          const featureName = 'notSetOne';
          const flag = signal.featureFlag(featureName);

          await flag.then(data => {
            expect(data).toMatch(/^test|control$/);
            const cookieVal = Cookies.get(md5(featureName));
            expect(cookieVal).toMatch(/^test|control$/);
          });
        });
      });

      describe('response.expires is a number', () => {
        it('gets the flag value and sets it to a cookie with the expires option being the number of days after the current date', async () => {
          const signal = new Signaler(features);
          const featureName = 'notSetTwo';
          const flag = signal.featureFlag(featureName);

          await flag.then(data => {
            expect(data).toMatch(/^test|control$/);
            const cookieVal = Cookies.get(md5(featureName));
            expect(cookieVal).toMatch(/^test|control$/);
          });
        });
      });

      describe('response.expires is not defined', () => {
        it('gets the flag value and sets it to a cookie', async () => {
          const signal = new Signaler(features);
          const featureName = 'notSetThree';
          const flag = signal.featureFlag(featureName);

          await flag.then(data => {
            expect(data).toMatch(/^flag|flag2/);
            const cookieVal = Cookies.get(md5(featureName));
            expect(cookieVal).toMatch(/^flag|flag2/);
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

    it('sets the cookie with the options passed in', () => {
      const signal = new Signaler(features);
      const featureName = 'newFeature';
      const featureVal = 'myVal';

      signal.setFeatureFlag(featureName, featureVal);
      const cookieVal = Cookies.get(md5(featureName));
      
      expect(cookieSpy).toHaveBeenCalledWith(md5(featureName), featureVal, {});
      expect(cookieVal).toEqual('myVal');
    });

    it('transforms cookie options', () => {
      const signal = new Signaler(features, {
        transformCookieOptions: obj => {
          obj.path = '/secret';
          return obj;
        }
      });
      const featureName = 'newFeature';
      const featureVal = 'myVal';

      signal.setFeatureFlag(featureName, featureVal, {domain: 'domain'});
      const cookieVal = Cookies.get(md5(featureName));
      
      expect(cookieSpy).toHaveBeenCalledWith(md5(featureName), featureVal, {
        path: '/secret',
        domain: 'domain'
      });
      expect(cookieVal).toEqual('myVal');
    });
  });
});
