import { defineConfig, type UserConfigExport } from '@tarojs/cli';
import path from 'path';

export default defineConfig<'weapp'>(async (merge) => {
  const baseConfig: UserConfigExport<'weapp'> = {
    projectName: 'ddl-miniprogram',
    date: '2026-5-19',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [
      '@tarojs/plugin-framework-react',
      '@tarojs/plugin-platform-weapp',
    ],
    defineConstants: {
      'process.env.TARO_APP_AI_API_KEY': JSON.stringify(''),
      'process.env.TARO_APP_AI_BASE_URL': JSON.stringify(''),
      'process.env.TARO_APP_AI_MODEL': JSON.stringify(''),
    },
    alias: {
      '@': path.resolve(__dirname, '..', 'src'),
    },
    copy: {
      patterns: [
        {
          from: 'src/assets/tab-icons/',
          to: 'dist/assets/tab-icons/',
        },
      ],
      options: {},
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false,
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    sass: {
      resource: [],
    },
  };

  return baseConfig;
});
