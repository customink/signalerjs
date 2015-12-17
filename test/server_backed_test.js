import {assert} from 'chai';
import sinon from 'sinon';
import {Promise} from 'es6-promise';
import axios from 'axios';
import md5 from 'blueimp-md5';
import Cookies from 'cookies-js';
import Signaler from 'src';

describe('Signaler (server backed)', () => {
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
    it('sets url', () => {
      var signal = new Signaler('myUrl');
      assert.isFunction(signal.featureFlags);
      assert.isFunction(signal.featureFlag);
      assert.isFunction(signal.setFeatureFlag);
    });
  });

  describe('featureFlags', () => {
    it('returns current cookie values of feature flags', (done) => {
      var signal = new Signaler('myUrl');
      var axiosStub = sinon.stub(axios, 'get', function(url) {
        return new Promise((resolve, reject) => {
          resolve({
            data: {
              featureOne: ['test', 'control'],
              featureTwo: ['test', 'control'],
              featureThree: ['test', 'control', 'something']
            }
          });
        });
      });
      var flags = signal.featureFlags();

      setTimeout(() => {
        flags.then(data => {
          sinon.assert.calledWith(axiosStub, 'myUrl.json');
          assert.deepEqual(data, {
            featureOne: 'control',
            featureTwo: 'test',
            featureThree: 'something'
          });
        });

        axiosStub.restore();
        done();
      }, 0);
    });
  });

  describe('featureFlag', () => {
    describe('feature is stored in a cookie already', () => {
      it('returns the feature flag value', () => {
        var signal = new Signaler('myUrl');
        var flag = signal.featureFlag('featureOne');
        var flag2 = signal.featureFlag('featureTwo');
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
          var signal = new Signaler('myUrl');
          var featureName = 'notSet';
          var flagValue = 'flagValue';
          var expiresValue = 'January 15, 2016';
          var axiosStub = sinon.stub(axios, 'get', function(url) {
            return new Promise((resolve, reject) => {
              resolve({
                data: {
                  flag: flagValue,
                  expires: expiresValue
                }
              });
            });
          });
          var flag = signal.featureFlag(featureName);

          setTimeout(() => {
            flag.then(data => {
              sinon.assert.calledWith(axiosStub, `myUrl/${featureName}.json`);
              assert.equal(data, flagValue);
              var cookieVal = Cookies.get(md5(featureName));
              assert.equal(cookieVal, flagValue);
              axiosStub.restore();
              done();
            });
          }, 0);
        });
      });

      describe('response.expires is a number', () => {
        it('gets the flag value and sets it to a cookie with the expires option being the number of days after the current date', (done) => {
          var signal = new Signaler('myUrl');
          var featureName = 'notSet2';
          var flagValue = 'flagValue';
          var axiosStub = sinon.stub(axios, 'get', function(url) {
            return new Promise((resolve, reject) => {
              resolve({
                data: {
                  flag: flagValue,
                  expires: 30
                }
              });
            });
          });
          var flag = signal.featureFlag(featureName);

          setTimeout(() => {
            flag.then(data => {
              sinon.assert.calledWith(axiosStub, `myUrl/${featureName}.json`);
              assert.equal(data, flagValue);
              var cookieVal = Cookies.get(md5(featureName));
              assert.equal(cookieVal, flagValue);
              axiosStub.restore();
              done();
            });
          }, 0);
        });
      });

      describe('response.expires is not defined', () => {
        it('gets the flag value and sets it to a cookie', (done) => {
          var signal = new Signaler('myUrl');
          var featureName = 'notSet3';
          var flagValue = 'flagValue';
          var axiosStub = sinon.stub(axios, 'get', function(url) {
            return new Promise((resolve, reject) => {
              resolve({
                data: {
                  flag: flagValue
                }
              });
            });
          });
          var flag = signal.featureFlag(featureName);

          setTimeout(() => {
            flag.then(data => {
              sinon.assert.calledWith(axiosStub, `myUrl/${featureName}.json`);
              assert.equal(data, flagValue);
              var cookieVal = Cookies.get(md5(featureName));
              assert.equal(cookieVal, flagValue);
              axiosStub.restore();
              done();
            });
          }, 0);
        });
      });
    });
  });

  describe('setFeatureFlag', () => {
    it('sets the cookie with the options passed in', () => {
      var signal = new Signaler('myUrl');
      var featureName = 'newFeature';
      var featureVal = 'myVal';
      var cookieSpy = sinon.spy(Cookies, 'set');
      signal.setFeatureFlag(featureName, featureVal);
      var cookieVal = Cookies.get(md5(featureName));
      sinon.assert.calledWith(cookieSpy, md5(featureName), featureVal, {});
      assert.equal(cookieVal, 'myVal');
      cookieSpy.restore();
    });

    it('transforms cookie options', () => {
      var signal = new Signaler('myUrl', {
        transformCookieOptions: (obj) => {
          obj.path = '/secret';
          return obj;
        }
      });
      var featureName = 'newFeature';
      var featureVal = 'myVal';
      var cookieSpy = sinon.spy(Cookies, 'set');
      signal.setFeatureFlag(featureName, featureVal, {domain: 'domain'});
      var cookieVal = Cookies.get(md5(featureName));
      sinon.assert.calledWith(cookieSpy, md5(featureName), featureVal, {path: '/secret', domain: 'domain'});
      assert.equal(cookieVal, 'myVal');
      cookieSpy.restore();
    });
  });
});
