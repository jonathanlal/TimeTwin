module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            'react': './node_modules/react',
            'react-dom': './node_modules/react-dom',
          },
        },
      ],
    ],
  };
};
