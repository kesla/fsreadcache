var fs = require('fs')

  , test = require('tape')

  , fsreadcache = require('./fsreadcache')

  , directory = __dirname + '/testdata'
  , idx = 0
  , getFdSync = function () {
      return fs.openSync(directory + '/test-file' + (idx++), 'w+')
    }

test('setup', function (t) {
  require('rimraf').sync(directory)
  require('fs').mkdirSync(directory)
  t.end()
})

test('simple test', function (t) {
  var fd = getFdSync()
    , fscache = fsreadcache()
    , input = new Buffer('beep boop')

  fscache.write(fd, input, 0, input.length, null, function (err) {
    t.error(err)

    var buffer = new Buffer(input.length)
    fscache.read(fd, buffer, 0, input.length, 0, function (err) {
      t.error(err)
      t.equal(buffer.toString(), 'beep boop')

      fscache.read(fd, buffer, 0, input.length, 0, function (err) {
        t.equal(buffer.toString(), 'beep boop')
        t.end()
      })
    })
  })
})

test('test with offset and custom length', function (t) {
  var fd = getFdSync()
    , fscache = fsreadcache()
    , input = new Buffer('hello, world')

  fscache.write(fd, input, 0, input.length, null, function (err) {
    t.error(err)

    var buffer = new Buffer(input.length + 4)
    buffer.fill('0')

    fscache.read(fd, buffer, 2, input.length, 0, function (err) {
      t.error(err)
      t.equal(buffer.toString(), '00hello, world00')

      buffer.fill('0')
      fscache.read(fd, buffer, 1, input.length, 0, function (err) {
        t.error(err)
        t.equal(buffer.toString(), '0hello, world000')
        t.end()
      })
    })
  })
})

test('test with custom position', function (t) {
  var fd = getFdSync()
    , fscache = fsreadcache()
    , input = new Buffer('foo bar')

  fscache.write(fd, input, 0, input.length, null, function (err) {
    t.error(err)

    var buffer = new Buffer(3)

    fscache.read(fd, buffer, 0, 3, 4, function (err) {
      t.error(err)
      t.equal(buffer.toString(), 'bar')

      fscache.read(fd, buffer, 0, 3, 4, function (err) {
        t.error(err)
        t.equal(buffer.toString(), 'bar')
        t.end()
      })
    })
  })
})

test('test with changed file', function (t) {
  var fd = getFdSync()
    , fscache = fsreadcache()
    , input = new Buffer('foo bas')
    , input2 = new Buffer('bar')

  fscache.write(fd, input, 0, input.length, null, function (err) {
    t.error(err)

    var buffer = new Buffer(input.length)
    fscache.read(fd, buffer, 0, input.length, 0, function (err) {
      t.error(err)
      t.equal(buffer.toString(), 'foo bas')
      fscache.write(fd, input2, 0, input2.length, 4, function (err) {
        t.error(err)

        fscache.read(fd, buffer, 0, input.length, 0, function (err) {
          t.equal(buffer.toString(), 'foo bar')
          fs.read(fd, buffer, 0, input.length, 0, function (err) {
            t.equal(buffer.toString(), 'foo bar')
            t.end()
          })
        })
      })
    })
  })
})

test('test with appended file', function (t) {
  var fd = getFdSync()
    , fscache = fsreadcache()
    , input = new Buffer('foo')
    , input2 = new Buffer('bar')

  fscache.write(fd, input, 0, input.length, null, function (err) {
    t.error(err)

    var buffer = new Buffer(input.length)
    fscache.read(fd, buffer, 0, input.length, 0, function (err) {
      t.error(err)
      t.equal(buffer.toString(), 'foo')
      fscache.write(fd, input2, 0, input2.length, null, function (err) {
        t.error(err)

        buffer = new Buffer(6)
        fscache.read(fd, buffer, 0, buffer.length, 0, function (err) {
          t.equal(buffer.toString(), 'foobar')
          fscache.write(fd, input2, 1, 1, null, function (err) {

            buffer = new Buffer(7)
            fscache.read(fd, buffer, 0, buffer.length, 0, function (err) {
              t.equal(buffer.toString(), 'foobara')
              t.end()
            })
          })
        })
      })
    })
  })
})