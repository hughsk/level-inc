module.exports = function(db) {
  var cache = {}, nop = new Function;

  function inc(key, val, callback) {
    if (typeof val === "function" && !callback) {
      callback = val;
      val = 1;
    } else if(!val) {
      val = 1
    }

    callback = callback || nop;

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

      current = current | 0
      current += cache[key].value
      delete cache[key]

      db.put(key, current, function(err) {
        ready.map(function(cb) { return cb(err) })
      })
    })
  }

  return inc
}
