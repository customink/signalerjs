# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2022-02-09

### Changed

- Updated all client-based value getting to behave sychronously
- When getting a cookie value, added a check for md5 encryption and if found, we create new cookie without encryption and expire the old cookie

### Deprecated

- md5

## [0.5.1] - 2022-02-03

### Changed

- Added `browserslist` section to `package.json` to specify that babel should transpile to ES5

## [0.5.0] - 2022-02-01

### Added

- A CHANGELOG! (a little meta but here we are)
- Introduced [Jest](https://jestjs.io/) as the new testing framework
- Added [Prettier](https://prettier.io/)

### Changed

- Updated the outdated Karma tests to Jest tests
- Bumped Node, Babel, Webpack, & ESLint versions

### Removed

- All other testing libraries: karma, chai, sinon, phantomjs, mocha, istanbul
