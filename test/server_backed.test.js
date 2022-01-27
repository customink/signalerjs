import {assert, expect} from 'chai';
import {Promise} from 'es6-promise';
import md5 from 'blueimp-md5';
import Cookies from 'cookies-js';
import Signaler from '../src';

window.fetch = jest.fn();

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
    window.fetch.mockClear();
  });

  afterAll(() => {
    delete window.fetch;
  })

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
      const returnedFlags = {
        featureOne: 'control',
        featureTwo: 'test',
        featureThree: 'something'
      };
      const response = {
        featureOne: ['test', 'control'],
        featureTwo: ['test', 'control'],
        featureThree: ['test', 'control', 'something']
      };
      const mockFetch = window.fetch.mockImplementation(() => Promise.resolve(response))
      const signal = new Signaler('myUrl');
      const flags = signal.featureFlags()

      setTimeout(() => {
        flags.then(data => {
          expect(mockFetch).toHaveBeenCalledWith('myUrl.json');
          expect(data).toEqual(returnedFlags);
        });
        done();
      }, 0);
    });
  });

  describe('featureFlag', () => {
    describe('feature is stored in a cookie already', () => {
      it('returns the feature flag value', () => {
        const signal = new Signaler('myUrl');
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
        it('gets the flag value and sets it to a cookie', (done) => {
          const signal = new Signaler('myUrl');
          const featureName = 'notSet';
          const flagValue = 'flagValue';
          // 12096e5 is 14 days in miliseconds
          const expiresValue = new Date(Date.now() + 12096e5).toJSON();
          const response = { flag: flagValue, expires: expiresValue };
          const mockFetch = window.fetch.mockImplementation(() => Promise.resolve(response))
          const flag = signal.featureFlag(featureName);

          setTimeout(() => {
            flag.then(data => {
              expect(mockFetch).toHaveBeenCalledWith(`myUrl/${featureName}.json`);
              expect(data).toEqual(flagValue)
              
              const cookieVal = Cookies.get(md5(featureName));
              expect(cookieVal).toEqual(flagValue);
              done();
            });
          }, 0);
        });
      });

      // describe('response.expires is a number', () => {
      //   it(
      //     'gets the flag value and sets it to a cookie with the expires option being the number of days after the current date',
      //     (done) => {
      //       const signal = new Signaler('myUrl');
      //       const featureName = 'notSet2';
      //       const flagValue = 'flagValue';
      //       const response = { flag: flagValue, expires: 30 };
      //       const mockFetch = window.fetch.mockImplementation(() => Promise.resolve(response))
      //       const flag = signal.featureFlag(featureName);

      //       setTimeout(() => {
      //         flag.then(data => {
      //           expect(mockFetch).toHaveBeenCalledWith(`myUrl/${featureName}.json`);
      //           expect(data).toEqual(flagValue);

      //           const cookieVal = Cookies.get(md5(featureName));
      //           expect(cookieVal).toEqual(flagValue);
      //           done();
      //         });
      //       }, 0);
      //     }
      //   );
      // });

  //     describe('response.expires is not defined', () => {
  //       it('gets the flag value and sets it to a cookie', (done) => {
  //         var signal = new Signaler('myUrl');
  //         var featureName = 'notSet3';
  //         var flagValue = 'flagValue';
  //         var fetchStub = sinon.stub(window, 'fetch', function(url) {
  //           return new Promise((resolve, reject) => {
  //             resolve({
  //               json: function() {
  //                 return {
  //                   flag: flagValue
  //                 };
  //               }
  //             });
  //           });
  //         });
  //         var flag = signal.featureFlag(featureName);

  //         setTimeout(() => {
  //           flag.then(data => {
  //             sinon.assert.calledWith(fetchStub, `myUrl/${featureName}.json`);
  //             assert.equal(data, flagValue);
  //             var cookieVal = Cookies.get(md5(featureName));
  //             assert.equal(cookieVal, flagValue);
  //             fetchStub.restore();
  //             done();
  //           });
  //         }, 0);
  //       });
  //     });
  //   });
  // });

  // describe('setFeatureFlag', () => {
  //   it('sets the cookie with the options passed in', () => {
  //     var signal = new Signaler('myUrl');
  //     var featureName = 'newFeature';
  //     var featureVal = 'myVal';
  //     var cookieSpy = sinon.spy(Cookies, 'set');
  //     signal.setFeatureFlag(featureName, featureVal);
  //     var cookieVal = Cookies.get(md5(featureName));
  //     sinon.assert.calledWith(cookieSpy, md5(featureName), featureVal, {});
  //     assert.equal(cookieVal, 'myVal');
  //     cookieSpy.restore();
  //   });

  //   it('transforms cookie options', () => {
  //     var signal = new Signaler('myUrl', {
  //       transformCookieOptions: (obj) => {
  //         obj.path = '/secret';
  //         return obj;
  //       }
  //     });
  //     var featureName = 'newFeature';
  //     var featureVal = 'myVal';
  //     var cookieSpy = sinon.spy(Cookies, 'set');
  //     signal.setFeatureFlag(featureName, featureVal, {domain: 'domain'});
  //     var cookieVal = Cookies.get(md5(featureName));
  //     sinon.assert.calledWith(cookieSpy, md5(featureName), featureVal, {path: '/secret', domain: 'domain'});
  //     assert.equal(cookieVal, 'myVal');
  //     cookieSpy.restore();
    });
  });
});
