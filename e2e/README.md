# @team-monite/e2e - End-to-End Package Testing

## Overview

This package is dedicated to testing the functionality of the `@monite/*` packages. It allows for verification of package installation capabilities and the ability of building projects using these installed packages.

The testing process utilizes [Verdaccio](https://verdaccio.org/), a local package registry, to simulate the publication and installation of packages in a controlled environment. This approach ensures the reliability of the packages before they are released into production.

### Running the Tests

#### Preparation

*You must build your packages before publishing!*
To do this, run the following command from the root of the repository:

```bash
yarn build
```

#### Testing

Execute the following command to start the end-to-end tests:

```bash
yarn e2e:test
```

This command will sequentially run:

- `e2e:publish-to-private-registry` - Publish packages to the local registry.
- `e2e:update-projects-from-private-registry` - Update dependencies in test projects.
- `e2e:build-projects` - Build the test projects.
- `e2e:unpublish-from-private-registry` - Remove packages from the local registry for reuse in future tests.

## Test Stands

- `projects/sdk-drop-in-with-vite` - SDK React with Vite as the bundler.

## Adding a New Test Stand

To add a new test stand:

1.  Create a new folder in `projects/`
2.  Set up a new project within this folder.

New test projects will automatically be detected and added to the list of testable projects.
