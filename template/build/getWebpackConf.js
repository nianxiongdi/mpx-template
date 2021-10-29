const webpackBaseConf = require('./webpack.base.conf')
const { mergeWithCustomize, customizeObject } = require('webpack-merge')
const getRules = require('./getRules')
const getPlugins = require('./getPlugins')
const { resolveSrc, resolveDist, getRootPath } = require('./utils')

module.exports = function getWebpackConfs (options) {
  const { plugin, subDir, mode, env, production, watch } = options
  const entry = plugin ? {
    plugin: resolveSrc('plugin.json?mpx&type=json&extract&isPlugin&asScript', subDir)
  } : {
    app: resolveSrc('app.mpx', subDir)
  }
  const rootPath = getRootPath(mode, env)
  const output = {
    path: resolveDist(rootPath, subDir)
  }
  const name = plugin ? `${rootPath}-plugin-compiler` : `${rootPath}-compiler`
  const rules = getRules(options)
  const plugins = getPlugins(options)
  const extendConfs = {}
  if (production) {
    extendConfs.mode = 'production'
  }
  extendConfs.optimization = {
    nodeEnv: production ? 'production' : 'development'
  }
  if (watch) {
    extendConfs.cache = true
    extendConfs.snapshot = {
      managedPaths: []
    }
    // 仅在watch模式下生产sourcemap
    // 百度小程序不开启sourcemap，开启会有模板渲染问题
    if (mode !== 'swan') {
      extendConfs.devtool = 'source-map'
    }
  }

  return mergeWithCustomize({
    customizeObject: customizeObject({
      snapshot: 'replace'
    })
  })(webpackBaseConf, {
    name,
    entry,
    output,
    module: {
      rules
    },
    plugins
  }, extendConfs)
}
