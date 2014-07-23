var fs = require('fs')

  , AsyncCache = require('async-cache')

module.exports = function (pageSize, cacheSize) {

  pageSize = pageSize || 16 * 1024
  cacheSize = cacheSize || 100 * 1024 * 1024

  var cache = new AsyncCache({
          max: cacheSize
        , length: function (n) { return n.length }
        , load: function (fd, callback) {
            fd = parseInt(fd, 10)

            fs.fstat(fd, function (err, stat) {
              if (err) return callback(err)

              data = new Buffer(stat.size)

              fs.read(fd, data, 0, data.length, 0, function (err) {
                if (err)
                  return callback(err)

                callback(null, data)
              })
            })
          }
      })

    , read = function (fd, buffer, offset, length, position, callback) {
        cache.get(fd, function (err, data) {
          if (err) return callback(err)

          data.copy(buffer, offset, position, position + length)

          callback(null)
        })
      }
    , write = function (fd, buffer, offset, length, position, callback) {
        fs.write(fd, buffer, offset, length, position, function (err) {
          var value

          if (err) return callback(err)

          if (position !== null || !(value = cache.peek(fd))) {
            cache.del(fd)
          } else {
            cache.set(fd, Buffer.concat([ value, buffer.slice(offset, offset + length) ]))
          }

          callback(null)
        })
      }

  return {
      read: read
    , write: write
  }
}