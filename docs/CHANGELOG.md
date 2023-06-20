## [3.1.1](https://github.com/Safe-Security/unleash-client/compare/v3.1.0...v3.1.1) (2023-06-01)


### Bug Fixes

* **unleash-client:** Added event listener on the error events ([#21](https://github.com/Safe-Security/unleash-client/issues/21)) ([7e99b5a](https://github.com/Safe-Security/unleash-client/commit/7e99b5a4c870f46127cb46fe55ac6faeaeb01517))

# [3.1.0](https://github.com/Safe-Security/unleash-client/compare/v3.0.0...v3.1.0) (2023-03-14)


### Features

* support checking for fallback value in case feature toggle is false ([#20](https://github.com/Safe-Security/unleash-client/issues/20)) ([d86eb2d](https://github.com/Safe-Security/unleash-client/commit/d86eb2db35a4515ba5f001bd5c6f1298a90fbea3))

# [3.0.0](https://github.com/Safe-Security/unleash-client/compare/v2.0.2...v3.0.0) (2023-01-30)


### Features

* Renamed baseUrl to tenantUrl ([#18](https://github.com/Safe-Security/unleash-client/issues/18)) ([38ca99d](https://github.com/Safe-Security/unleash-client/commit/38ca99dc8f7cc1a93b9d108e35aa7c2e27821ca8))


### BREAKING CHANGES

* baseUrl parameter has been renamed to tenantUrl to distinguish in a better way and not confuse with instance level URL

## [2.0.2](https://github.com/Safe-Security/unleash-client/compare/v2.0.1...v2.0.2) (2022-12-20)


### Bug Fixes

* removed error message ([#17](https://github.com/Safe-Security/unleash-client/issues/17)) ([f5bedc4](https://github.com/Safe-Security/unleash-client/commit/f5bedc425639fa14e6859aa637b96aae46cb7324))

## [2.0.1](https://github.com/Safe-Security/unleash-client/compare/v2.0.0...v2.0.1) (2022-11-20)


### Bug Fixes

* updated the http agent to correct one ([#16](https://github.com/Safe-Security/unleash-client/issues/16)) ([1b3a3bc](https://github.com/Safe-Security/unleash-client/commit/1b3a3bc40c92c8e9e75382a7e690cfa791a08f20))

# [2.0.0](https://github.com/Safe-Security/unleash-client/compare/v1.0.2...v2.0.0) (2022-11-15)


* feat!: added additional parameters config (#15) ([82baf62](https://github.com/Safe-Security/unleash-client/commit/82baf62990611de3351c614fd8d17319224d6787)), closes [#15](https://github.com/Safe-Security/unleash-client/issues/15)


### BREAKING CHANGES

* additional object added to refer the baseUrl config having a fallback value for backward compatibility

Co-authored-by: Aman Jain (ECS/DEL) <aman.j@safe.security>

## [1.0.2](https://github.com/Safe-Security/unleash-client/compare/v1.0.1...v1.0.2) (2022-09-30)


### Bug Fixes

* small cleanup on workflow command, trigger release ([ff835d8](https://github.com/Safe-Security/unleash-client/commit/ff835d8a573a9de5b2b5e2031e7fd2fdf9fc7134))
