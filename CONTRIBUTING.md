Contributing
============

Submitting issues
-----------------

1. Search in the [Github issues](https://github.com/fboes/metar-parser/issues), if a similar issue has already been filed. If so, please contribute to this issue.
2. On [opening a new issue on Github](https://github.com/fboes/metar-parser/issues), add a descriptive title describing in a few words your problem. Think of the terms you would have searched for to find this issue.
3. Leave a reproducible list of steps leading to the error.
4. If possible add the Node and NPM version you ware using as well as the OS.

Setup for development
---------------------

You will need:

1. A [Github account](https://github.com/) and Git
2. [NodeJs](https://nodejs.org/) with NPM installed
3. [Gulp](https://gulpjs.com/) installed globally
4. [ESLint](https://eslint.org/) installed globally
5. [Nodeunit](https://github.com/caolan/nodeunit) installed globally

For Gulp, ESLint and Nodeunit call `npm install -g gulp-cli eslint nodeunit` from command line.

Making changes
--------------

1. [Fork the repository on GitHub](https://help.github.com/articles/fork-a-repo/)
2. Checkout your new repository and run `npm install`.
3. Create a new feature branch from `master` branch, like `feature/my-cool-feature`.
4. Start the Gulp watcher via `gulp watch` and start developing. Coding guidelines will be enforced by Gulp.
5. If you are really nice you will supply a test for the stuff you coded.
5. Add a line to the `CHANGELOG.md` to tell people what you did in your feature.
6. Commit with a meaningful commit message (e.g. the line you put into `CHANGELOG.md`) & push to your repository.
7. Run `npm test`. Be sure that all tests pass before proceeding any further.
8. [Submit a pull request](https://help.github.com/articles/about-pull-requests/).

### Emojis for `CHANGELOG.md`

* :gift: `:gift:` New feature
* :pill: `:pill:` Bugfix, repairing a broken functionality
* :bomb: `:bomb:` Possibly breaking change, needs further explanation
* :wrench: `:wrench:` Internal, technical improvement
