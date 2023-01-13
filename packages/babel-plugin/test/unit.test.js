/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const { default: pluginTester } = require('babel-plugin-tester')

const groqzPlugin = require('../dist/index.cjs')

// eslint-disable-next-line no-undef
const path = require('path')

pluginTester({
  plugin: groqzPlugin,
  fixtures: path.join(__dirname, '__fixtures__'),
})
