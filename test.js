var test = require('tape')
  , levelup = require('levelup')

var db = levelup(__dirname + '/testdb')

// Load up #inc
db.inc = require('./')(db)

// Delete old test keys
db.batch([
    'a'
  , 'b'
].map(function(key) {
  return { type: 'del', key: key }
}), function(err) {
  if (err) throw err

  test('Should increment "atomically"', function(t) {
    t.plan(2)

    var times = 0

    db.inc('b', 0.03681494823849502, function(){
      db.inc('b', 0.016595898341492214, function(){
        for (var i = 0; i < 100; i += 1) {
          db.inc('b', 1, done)
        }
      })
    })





    function done(err) {
      if (err) throw err
      times += 1
      if (times < 100) return

      db.get('b', function(err, val) {
        t.ok(!err)
        t.equal(Number(val), 100.05341084657999)
      })
    }
  })
})
