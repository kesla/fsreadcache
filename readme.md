# fsreadcache[![build status](https://secure.travis-ci.org/kesla/fsreadcache.png)](http://travis-ci.org/kesla/fsreadcache)

Cache calls to fs.read.

Please note that this module is using an in-memory cache, so multiple processes (or multiple instances of fsreadcache) can't use the same filedescriptors.

[![NPM](https://nodei.co/npm/fsreadcache.png?downloads&stars)](https://nodei.co/npm/fsreadcache/)

[![NPM](https://nodei.co/npm-dl/fsreadcache.png)](https://nodei.co/npm/fsreadcache/)

## Installation

```
npm install fsreadcache
```

## Example

### Input

```javascript
var fs = require('fs')
  , fsreadcache = require('./fsreadcache')({
        // optional cacheSize, defaults to 100mb
        cacheSize: 16 * 1024
    })
  , fd = fs.openSync(__dirname + '/testdata/example-file', 'w+')
  , input = new Buffer('123')

// must use fsreadache.write for the cache to be set correctly
//  when changing an already opened file
fsreadcache.write(fd, input, 0, input.length, null, function () {
  var buffer = new Buffer(3)

  fsreadcache.read(fd, buffer, 0, buffer.length, 0, function () {
    console.log('data read from fs:', buffer.toString())

    fsreadcache.read(fd, buffer, 0, buffer.length, 0, function () {
      console.log('data read from cache:', buffer.toString())
    })
  })
})
```

### Output

```
data read from fs: 123
data read from cache: 123
```

## Licence

Copyright (c) 2014 David Björklund

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
