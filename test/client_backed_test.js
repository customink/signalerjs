import {assert} from 'chai';
import sinon from 'sinon';
import {Promise} from 'es6-promise';
import md5 from 'blueimp-md5';
import Cookies from 'cookies-js';
import Signalman from 'src';

var features = {
  featureOne: ['control', 'test'],
  featureTwo: {
    control: 0.2,
    test: 0.8
  },
  featureThree: ['something', 'another'],
  notSetOne: {
    expires: 'January 15, 2016',
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

describe('Signalman (client backed)', () => {
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
      var sm = new Signalman(features);
      assert.isFunction(sm.featureFlags);
      assert.isFunction(sm.featureFlag);
      assert.isFunction(sm.setFeatureFlag);
    });
  });

  describe('featureFlags', () => {
    it('returns current cookie values of feature flags', (done) => {
      var sm = new Signalman(features);
      var flags = sm.featureFlags();

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
      it('returns the feature flag value', (done) => {
        var sm = new Signalman(features);
        var flag = sm.featureFlag('featureOne');
        var flag2 = sm.featureFlag('featureTwo');
        Promise.all([flag, flag2]).then(([flagData, flag2Data]) => {
          assert.equal(flagData, 'control');
          assert.equal(flag2Data, 'test');
          done();
        });
      });
    });

    describe('feature is not stored in a cookie', () => {
      describe('response.expires is a string', () => {
        it('gets the flag value and sets it to a cookie', (done) => {
          var sm = new Signalman(features);
          var featureName = 'notSetOne';
          var expiresValue = 'January 15, 2016';
          var flag = sm.featureFlag(featureName);

          flag.then(data => {
            assert.match(data, /^test|control$/);
            var cookieVal = Cookies.get(md5(featureName));
            assert.match(cookieVal, /^test|control$/);
            done();
          });
        });
      });

      describe('response.expires is a number', () => {
        it('gets the flag value and sets it to a cookie with the expires option being the number of days after the current date', (done) => {
          var sm = new Signalman(features);
          var featureName = 'notSetTwo';
          var dateStub = sinon.stub(Date, 'now', () => {
            return 1443659501420;
          });
          var flag = sm.featureFlag(featureName);

          flag.then(data => {
            assert.match(data, /^test|control$/);
            var cookieVal = Cookies.get(md5(featureName));
            assert.match(cookieVal, /^test|control$/);

            dateStub.restore();
            done();
          });
        });
      });

      describe('response.expires is not defined', () => {
        it('gets the flag value and sets it to a cookie', (done) => {
          var sm = new Signalman(features);
          var featureName = 'notSetThree';
          var flag = sm.featureFlag(featureName);

          flag.then(data => {
            assert.match(data, /^flag|flag2/);
            var cookieVal = Cookies.get(md5(featureName));
            assert.match(cookieVal, /^flag|flag2/);
            done();
          });
        });
      });
    });
  });

  describe('setFeatureFlag', () => {
    it('sets the cookie with the options passed in', () => {
      var sm = new Signalman(features);
      var featureName = 'newFeature';
      var featureVal = 'myVal';
      var cookieSpy = sinon.spy(Cookies, 'set');
      sm.setFeatureFlag(featureName, featureVal);
      var cookieVal = Cookies.get(md5(featureName));
      sinon.assert.calledWith(cookieSpy, md5(featureName), featureVal, {});
      assert.equal(cookieVal, 'myVal');
      cookieSpy.restore();
    });

    it('transforms cookie options', () => {
      var sm = new Signalman(features, {
        transformCookieOptions: (obj) => {
          obj.path = '/secret';
          return obj;
        }
      });
      var featureName = 'newFeature';
      var featureVal = 'myVal';
      var cookieSpy = sinon.spy(Cookies, 'set');
      sm.setFeatureFlag(featureName, featureVal, {domain: 'domain'});
      var cookieVal = Cookies.get(md5(featureName));
      sinon.assert.calledWith(cookieSpy, md5(featureName), featureVal, {path: '/secret', domain: 'domain'});
      assert.equal(cookieVal, 'myVal');
      cookieSpy.restore();
    });
  });
});

