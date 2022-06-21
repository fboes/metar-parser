module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    semi: ['error', 'always']
  },
  overrides: [
    {
        files: [
            "test/*.js"
        ],
        env: {
            mocha: true
        }
    }
  ]
}
