# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.23.4](https://github.com/Sphereon-Opensource/SSI-SDK/compare/v0.23.2...v0.23.4) (2024-04-25)

**Note:** Version bump only for package @sphereon/ssi-sdk.xstate-machine-persistence

# [0.23.0](https://github.com/Sphereon-Opensource/SSI-SDK/compare/v0.22.0...v0.23.0) (2024-04-24)

**Note:** Version bump only for package @sphereon/ssi-sdk.xstate-machine-persistence

# [0.22.0](https://github.com/Sphereon-Opensource/SSI-SDK/compare/v0.21.1...v0.22.0) (2024-04-04)

**Note:** Version bump only for package @sphereon/ssi-sdk.xstate-machine-persistence

## [0.21.1](https://github.com/Sphereon-Opensource/SSI-SDK/compare/v0.21.0...v0.21.1) (2024-04-04)

**Note:** Version bump only for package @sphereon/ssi-sdk.xstate-machine-persistence

# [0.21.0](https://github.com/Sphereon-Opensource/SSI-SDK/compare/v0.19.0...v0.21.0) (2024-03-20)

### Bug Fixes

- fixed XStatePersistence plugin and fixed the tests ([56d8f18](https://github.com/Sphereon-Opensource/SSI-SDK/commit/56d8f1883802208a2d15f2f25ec03b0bcfb0a4e3))

### Features

- Add rest client mode to xstate-machine-persistence, allowing to process local events but delegate the execution to a REST server ([02c5e12](https://github.com/Sphereon-Opensource/SSI-SDK/commit/02c5e12f68c94f7a2d099b59de1d13b4c77ea5a4))
- Add support to automatically cleanup on final states, as well as to cleanup all other instances when starting a machine ([484fc21](https://github.com/Sphereon-Opensource/SSI-SDK/commit/484fc215a95232b861b81d6def6e42260ac8a1f9))
- Add support to start and resume xstate statemachines, with automatic persistence on state changes ([f6baae0](https://github.com/Sphereon-Opensource/SSI-SDK/commit/f6baae0527a80acfd423e4efe1c2f2b79e60bb8c))
- added unit tests and refactored plugin methods ([31eac66](https://github.com/Sphereon-Opensource/SSI-SDK/commit/31eac66d70168a74e9a79c0bb2e50c7dc942682a))
- Allow to use a customInstanceId as well as an existingInstanceId, so we can differentiate between re-using an existing machine and using a custom id ([3aeb93d](https://github.com/Sphereon-Opensource/SSI-SDK/commit/3aeb93d9b4dd373f445cec5cbe33d08364b2df74))

### Reverts

- Revert "chore: Make sure plugins having listener methods, actually expose the interface" ([99db568](https://github.com/Sphereon-Opensource/SSI-SDK/commit/99db56856054c86c2e8955d43a0b6e2c7a5228bf))
- Remove BBS support. ([205e0db](https://github.com/Sphereon-Opensource/SSI-SDK/commit/205e0db2bb985bf33a618576955d8b28a39ff932))

### BREAKING CHANGES

- Remove BBS support. Upstream support for Windows and RN is missing. Needs to be revisited at a later point in time
