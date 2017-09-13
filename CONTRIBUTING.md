### The issues section is for bug reports and feature requests only. If you need help, please use [stackoverflow](http://stackoverflow.com/questions/tagged/twgl.js).

## How to contribute to TWGL.js

1. Make sure you have a GitHub account.
2. Fork the repository on GitHub.
3. Check the [Contribution Guidelines](#Contribution Guidelines) below.
4. Make changes to your clone of the repository.
5. Submit a pull request.

## Contrubution Guidelines

*  Always make your contributions for the latest dev branch, not master.
*  Create separate branches per patch or feature.
*  Once done with a patch / feature do not add more commits to a feature branch (pull requests are not repository state snapshots, any change you do in that branch will be included in the pull request).
*  If you add a new feature it's good to add also an example (both for showing how it's used and for testing it still works after eventual refactorings).
*  If you add some assets for the examples (like textures, models, sounds, etc), make sure they have a proper license allowing for their use here (less restrictive the better).
*  If you modify existing code (refactoring / optimization / bug fix), run relevant examples to check they didn't break or that there wasn't some performance regress.
*  Watch out for eslint and uglify errors when building the libs, there should not be any.
*  If some GitHub issue is relevant to patch / feature, it's good to mention issue number with hash (e.g. #2774) in a commit message to get cross-reference in GitHub web interface.
*  Format whitespace consistently with the rest of code base.
*  Don't include `docs` or `dist` files in pull requests.

## Building

1.  install [node.js](http://nodejs.org)

2.  cd into the TWGL folder and type

       npm install

3.  You should now be able to build TWGL by typing

       npm run build

4.  You can build just the docs by typing

       npm run builddocs
       
5.  You can also lint the examples by typing

       npm run pre-push

## Developing

If you're trying to debug something you added to TWGL there are 2 common ways

1.  Use the non minified versions.

    Change the `<script src="twgl-full.min.js">` to `<script src="twgl-full.js">`.

    You still have to build after every change but at least the file will be readable.

2.  Use the [requirejs AMD](http://requirejs.org) version

    require.js is a JavaScript library that provides way for scripts to include other scripts
    without having to manually put in script tags. You add just the require.js script to your
    page with a special `data-main` attribute. It loads your main script and any scripts
    those scripts depend on etc. There's [an example if using TWGL this way here](http://twgljs.org/examples/amd.html).

    The advantage to this method is you don't have to compile the scripts because it uses
    the source scripts. The disadvantage is your main script must
    be in a separate file. It can't not be embedded in the HTML AFAIK.

## Running

The easiest way to run TWGL locally is to run a webserver. Type

    npm run serve

Then in your browser go to `http://localhost:8080`

    http://localhost:8080/examples/tiny.html

To quit the web server type Ctrl-C.


