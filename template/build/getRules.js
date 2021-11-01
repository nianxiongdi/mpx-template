let { mpxLoaderConf } = require('../config/index')
const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const { resolve } = require('./utils')

const baseRules = [
  {
    test: /\.js$/,
    loader: 'babel-loader',
    include: [resolve('src'), resolve('test'), resolve('node_modules/@mpxjs')]
  },
  {
    test: /\.json$/,
    resourceQuery: /asScript/,
    type: 'javascript/auto'
  },
  {
    test: /\.(wxs|qs|sjs|filter\.js)$/,
    use: [
      MpxWebpackPlugin.wxsPreLoader()
    ],
    enforce: 'pre'
  },
  {
    test: /\.(png|jpe?g|gif|svg)$/,
    use: [
      MpxWebpackPlugin.urlLoader({
        name: 'img/[name][hash].[ext]'
      })
    ]
  }
]

const tsRule = {
  test: /\.ts$/,
  use: [
    'babel-loader',
    'ts-loader'
  ]
}

module.exports = function getRules (options) {
  const { mode, tsSupport } = options

  let rules = baseRules.slice()

  if (tsSupport) {
    rules.push(tsRule)
  }

  let currentMpxLoaderConf
  if (typeof mpxLoaderConf === 'function') {
    currentMpxLoaderConf = mpxLoaderConf(options)
  } else {
    currentMpxLoaderConf = mpxLoaderConf
  }

  if (mode === 'web') {
    rules = rules.concat([
      {
        test: /\.mpx$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              transformToRequire: {
                'mpx-image': 'src',
                'mpx-audio': 'src',
                'mpx-video': 'src'
              }
            }
          },
          MpxWebpackPlugin.loader(currentMpxLoaderConf)
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // 如输出web时需要支持其他预编译语言，可以在此添加rule配置
      {
        test: /\.styl(us)?$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ])
  } else {
    rules = rules.concat([
      {
        test: /\.mpx$/,
        use: MpxWebpackPlugin.loader(currentMpxLoaderConf)
      },
      {
        test: /\.styl(us)?$/,
        use: [
          MpxWebpackPlugin.wxssLoader(),
          'stylus-loader'
        ]
      },
      {
        test: /\.wxss$/,
        use: [
          MpxWebpackPlugin.wxssLoader()
        ]
      },
      {
        test: /\.wxml$/,
        use: [
          MpxWebpackPlugin.wxmlLoader()
        ]
      }
    ])
  }

  return rules
}
