var fs = require('fs')

  , lru = require('lru-cache')

module.exports = function (pageSize, cacheSize) {

  pageSize = pageSize || 16 * 1024
  cacheSize = cacheSize || 100 * 1024 * 1024

  var cache = lru({
          max: cacheSize
        , length: function (n) { return n.length }
      })

    // for now, naively read the whole file
    , getFromCache = function (fd, callback) {
        var key = fd.toString()
          , data = cache.get(key)

        if (data)
          return setImmediate(function () { callback(null, data) })

        fs.fstat(fd, function (err, stat) {
          if (err) return callback(err)

          data = new Buffer(stat.size)

          fs.read(fd, data, 0, data.length, 0, function (err) {
            if (err)
              return callback(err)

            cache.set(key, data)
            callback(null, data)
          })
        })
      }
    , read = function (fd, buffer, offset, length, position, callback) {
        getFromCache(fd, function (err, data) {
          if (err) return callback(err)

          data.copy(buffer, offset, position, position + length)

          callback(null)
        })
      }
    , write = function (fd, buffer, offset, length, position, callback) {
        fs.write(fd, buffer, offset, length, position, function (err) {
          if (err) return callback(err)

          cache.del(fd)
          callback(null)
        })
      }

  return {
      read: read
    , write: write
  }
}