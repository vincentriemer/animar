[![Build Status](https://img.shields.io/travis/vincentriemer/animar/master.svg?style=flat)](https://travis-ci.org/vincentriemer/animar) [![Dependency Status](https://img.shields.io/david/vincentriemer/animar.svg?style=flat)](https://david-dm.org/vincentriemer/animar) [![devDependency Status](https://img.shields.io/david/dev/vincentriemer/animar.svg?style=flat)](https://david-dm.org/vincentriemer/animar#info=devDependencies) [![npm version](https://badge.fury.io/js/animar.svg)](https://badge.fury.io/js/animar) [![Test Coverage](https://codeclimate.com/github/vincentriemer/animar/badges/coverage.svg)](https://codeclimate.com/github/vincentriemer/animar/coverage) [![Test Coverage](https://img.shields.io/codeclimate/coverage/github/vincentriemer/animar.svg?style=flat)](https://codeclimate.com/github/vincentriemer/animar) [![Issue Count](https://codeclimate.com/github/vincentriemer/animar/badges/issue_count.svg)](https://codeclimate.com/github/vincentriemer/animar)

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
