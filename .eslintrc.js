module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-groqz`
  extends: ['groqz'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
}
