[![Build Status](https://img.shields.io/travis/vincentriemer/animar/master.svg?style=flat)](https://travis-ci.org/vincentriemer/animar) [![npm version](https://badge.fury.io/js/animar.svg)](https://badge.fury.io/js/animar)

[![bitHound Dependencies](https://www.bithound.io/github/vincentriemer/animar/badges/dependencies.svg)](https://www.bithound.io/github/vincentriemer/animar/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/vincentriemer/animar/badges/devDependencies.svg)](https://www.bithound.io/github/vincentriemer/animar/master/dependencies/npm)

[![bitHound Code](https://www.bithound.io/github/vincentriemer/animar/badges/code.svg)](https://www.bithound.io/github/vincentriemer/animar) [![Test Coverage](https://img.shields.io/codeclimate/coverage/github/vincentriemer/animar.svg?style=flat)](https://codeclimate.com/github/vincentriemer/animar) [![Issue Count](https://codeclimate.com/github/vincentriemer/animar/badges/issue_count.svg)](https://codeclimate.com/github/vincentriemer/animar)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/vincentriemer.svg)](https://saucelabs.com/u/vincentriemer)

# Animar

**NOTE**: This is still very much a work in progress (espcially in the documentation department). If you attempt to use this in its current state, you are doing so at your own risk.

## Initialization

```javascript
var animar = new Animar();
```

## Animating an Element

The Animar library only provides one function for animating an element. The syntax is as follows:

```
animar.add([DOMElement element], [Object attributeMap], [Object options]);
```
