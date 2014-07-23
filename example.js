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