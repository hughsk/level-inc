function noop(){}

module.exports = function(db) {
  var cache = {}

  function inc(key, val, callback) {
    // `val` defaults to 1 when not supplied.
    if (typeof val === "function") {
      callback = val
      val = 1
    } else
    if (arguments.length < 2) {
      val = 1
    }

    callback = callback || noop

    if (cache[key]) {
      cache[key].ready.push(callback)
      cache[key].value += val
      return
    }

    cache[key] = {
        value: val
      , ready: [callback]
    }

    db.get(key, function(err, current) {
      var ready = cache[key].ready
      if (!current && current !== 0) {
        current = 0;
      } else current = Number(current);
      current += Number(cache[key].value)
      delete cache[key]

      db.put(key, current, function(err) {
        ready.map(function(cb) { return cb(err) })
      })
    })
  }

  return inc
}
