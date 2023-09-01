/*
 * @Author       : JHao
 * @Date         : 2023-08-31 14:22:43
 * @LastEditors  : JHao
 * @LastEditTime : 2023-08-31 15:02:04
 */
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
    es6: true
  },
  globals: {},
  rules: {},
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: "latest"
  },
};