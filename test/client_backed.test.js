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
    Cookies.set('featureOne', 'control');
    Cookies.set('featureTwo', 'test');
    Cookies.set('featureThree', 'something');
  });

  afterEach(() => {
    Cookies.expire('featureOne');
    Cookies.expire('featureTwo');
    Cookies.expire('featureThree');
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
      it('returns the feature flag value', () => {
        const signal = new Signaler(features);
        const flag = signal.featureFlag('featureOne');
        const flag2 = signal.featureFlag('featureTwo');
        expect(flag).toEqual('control');
        expect(flag2).toEqual('test');
      });
    });

    describe('feature is stored in a cookie as an md5 encrypted value', () => {
      beforeAll(() => {
        Cookies.set(md5('featureWithMd5'), 'test');
      });

      it('sets a new cookie w/o md5 encrpytion, expires the old cookie, and returns the flag value', async () => {
        const features = {featureWithMd5: ['control', 'test'],}
        const signal = new Signaler(features);
        const featureName = 'featureWithMd5'
        const flag = signal.featureFlag(featureName)

        await flag.then(data => {
          expect(data).toEqual('test');
          
          const expiredCookieVal = Cookies.get(md5(featureName));
          expect(expiredCookieVal).toEqual(undefined);
          
          const newCookieVal = Cookies.get(`feature_${featureName}`)
          expect(newCookieVal).toMatch(/^test|control$/);
        });
      })
    })

    describe('feature is not stored in a cookie', () => {
      describe('response.expires is a string', () => {
        it('gets the flag value and sets it to a cookie', () => {
          const signal = new Signaler(features);
          const featureName = 'notSetOne';
          const flag = signal.featureFlag(featureName);
          expect(flag).toMatch(/^test|control$/);
         
          const cookieVal = Cookies.get(`feature_${featureName}`);
          expect(cookieVal).toMatch(/^test|control$/);
        });
      });

      describe('response.expires is a number', () => {
        it('gets the flag value and sets it to a cookie with the expires option being the number of days after the current date', () => {
          const signal = new Signaler(features);
          const featureName = 'notSetTwo';
          const flag = signal.featureFlag(featureName);
          expect(flag).toMatch(/^test|control$/);
          
          const cookieVal = Cookies.get(`feature_${featureName}`);
          expect(cookieVal).toMatch(/^test|control$/);
        });
      });

      describe('response.expires is not defined', () => {
        it('gets the flag value and sets it to a cookie', () => {
          const signal = new Signaler(features);
          const featureName = 'notSetThree';
          const flag = signal.featureFlag(featureName);
          expect(flag).toMatch(/^flag|flag2/);
          
          const cookieVal = Cookies.get(`feature_${featureName}`);
          expect(cookieVal).toMatch(/^flag|flag2/);
        });
      });
    });
  });

  describe('setFeatureFlag', () => {
    const cookieSpy = jest.spyOn(Cookies, 'set');

    afterAll(() => {
      jest.restoreAllMocks();
    });

    afterEach(() => {
      cookieSpy.mockClear();
    })

    it('sets the cookie with the options passed in', () => {
      const signal = new Signaler(features);
      const featureName = 'newFeature';
      const featureVal = 'myVal';

      signal.setFeatureFlag(featureName, featureVal);
      const cookieVal = Cookies.get(`feature_${featureName}`);
      
      expect(cookieSpy).toHaveBeenCalledWith(`feature_${featureName}`, featureVal, {});
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
      const cookieVal = Cookies.get(`feature_${featureName}`);
      
      expect(cookieSpy).toHaveBeenCalledWith(`feature_${featureName}`, featureVal, {
        path: '/secret',
        domain: 'domain'
      });
      expect(cookieVal).toEqual('myVal');
    });
  });
});
