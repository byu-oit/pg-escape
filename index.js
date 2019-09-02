const assert = require('assert')
const fs = require('fs')

const txt = fs.readFileSync(__dirname + '/reserved.txt', 'utf8')
const reserved = txt.split('\n').reduce(function (map, word) {
  map[word.toLowerCase()] = true
  return map
}, {})

exports = module.exports = format

function format (fmt) {
  let i = 1
  const args = arguments
  return fmt.replace(/%([%sILQ])/g, function (_, type) {
    if ('%' == type) return '%'

    const arg = args[i++]
    switch (type) {
      case 's':
        return exports.string(arg)
      case 'I':
        return exports.ident(arg)
      case 'L':
        return exports.literal(arg)
      case 'Q':
        return exports.dollarQuotedString(arg)
    }
  })
}

exports.string = function (val) {
  return null == val ? '' : String(val)
}

const randomTags = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'g', 'j', 'k',
  'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't']

function random (start, end) {
  const range = end - start
  return Math.floor((Math.random() * range) + start)
}

exports.dollarQuotedString = function (val) {
  if (val === undefined || val === null || val === '') return ''
  const randomTag = '$' + randomTags[random(0, randomTags.length)] + '$'
  return randomTag + val + randomTag
}

exports.ident = function (val) {
  assert(null != val, 'identifier required')
  return validIdent(val) ? val : quoteIdent(val)
}

exports.literal = function (val) {
  if (null == val) return 'NULL'
  if (Array.isArray(val)) {
    const vals = val.map(exports.literal)
    return '(' + vals.join(', ') + ')'
  }
  if (typeof val === 'number') val = val.toString()
  const backslash = ~val.indexOf('\\')
  const prefix = backslash ? 'E' : ''
  val = val.replace(/'/g, '\'\'')
  val = val.replace(/\\/g, '\\\\')
  return prefix + '\'' + val + '\''
}

function validIdent (id) {
  if (reserved[id]) return false
  return /^([a-z_][a-z0-9_$]*)|[*]$/i.test(id)
}

function quoteIdent (id) {
  id = id.replace(/"/g, '""')
  return '"' + id + '"'
}
