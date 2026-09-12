const fs = require('fs')
const path = require('path')

// Simple script that writes the included seed.json to a new file to demonstrate generator
const seed = require('../src/data/seed.json')
const out = path.resolve(process.cwd(), 'dist-seed.json')
fs.writeFileSync(out, JSON.stringify(seed, null, 2))
console.log('Wrote seed to', out)
