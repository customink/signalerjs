import {assert} from 'chai';
import sinon from 'sinon';
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
      assert.isFunction(signal.featureFlags);
      assert.isFunction(signal.featureFlag);
      assert.isFunction(signal.setFeatureFlag);
    });
  });

  describe('featureFlags', () => {
    it('returns current cookie values of feature flags', done => {
      const signal = new Signaler(features);
      const flags = signal.featureFlags();

      flags.then(data => {
        assert.deepEqual(data, {
          featureOne: 'control',
          featureTwo: 'test',
          featureThree: 'something',
          notSetOne: undefined,
          notSetTwo: undefined,
          notSetThree: undefined
        });
        done();
      });
    });
  });

  describe('featureFlag', () => {
    describe('feature is stored in a cookie already', () => {
      it('returns the feature flag value', done => {
        const signal = new Signaler(features);
        const flag = signal.featureFlag('featureOne');
        const flag2 = signal.featureFlag('featureTwo');
        Promise.all([flag, flag2]).then(([flagData, flag2Data]) => {
          assert.equal(flagData, 'control');
          assert.equal(flag2Data, 'test');
          done();
        });
      });
    });

    describe('feature is not stored in a cookie', () => {
      describe('response.expires is a string', () => {
        it('gets the flag value and sets it to a cookie', done => {
          const signal = new Signaler(features);
          const featureName = 'notSetOne';
          const flag = signal.featureFlag(featureName);

          flag.then(data => {
            assert.match(data, /^test|control$/);
            const cookieVal = Cookies.get(md5(featureName));
            assert.match(cookieVal, /^test|control$/);
            done();
          });
        });
      });

      describe('response.expires is a number', () => {
        it('gets the flag value and sets it to a cookie with the expires option being the number of days after the current date', done => {
          const signal = new Signaler(features);
          const featureName = 'notSetTwo';
          const flag = signal.featureFlag(featureName);

          flag.then(data => {
            assert.match(data, /^test|control$/);
            const cookieVal = Cookies.get(md5(featureName));
            assert.match(cookieVal, /^test|control$/);
            done();
          });
        });
      });

      describe('response.expires is not defined', () => {
        it('gets the flag value and sets it to a cookie', done => {
          const signal = new Signaler(features);
          const featureName = 'notSetThree';
          const flag = signal.featureFlag(featureName);

          flag.then(data => {
            assert.match(data, /^flag|flag2/);
            const cookieVal = Cookies.get(md5(featureName));
            assert.match(cookieVal, /^flag|flag2/);
            done();
          });
        });
      });
    });
  });

  describe('setFeatureFlag', () => {
    it('sets the cookie with the options passed in', () => {
      const signal = new Signaler(features);
      const featureName = 'newFeature';
      const featureVal = 'myVal';
      const cookieSpy = sinon.spy(Cookies, 'set');
      signal.setFeatureFlag(featureName, featureVal);
      const cookieVal = Cookies.get(md5(featureName));
      sinon.assert.calledWith(cookieSpy, md5(featureName), featureVal, {});
      assert.equal(cookieVal, 'myVal');
      cookieSpy.restore();
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
      const cookieSpy = sinon.spy(Cookies, 'set');
      signal.setFeatureFlag(featureName, featureVal, {domain: 'domain'});
      const cookieVal = Cookies.get(md5(featureName));
      sinon.assert.calledWith(cookieSpy, md5(featureName), featureVal, {
        path: '/secret',
        domain: 'domain'
      });
      assert.equal(cookieVal, 'myVal');
      cookieSpy.restore();
    });
  });
});
