const path = require('path');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.scss$/,
      sideEffects: true,
      loaders: ["style-loader", "css-loader", "sass-loader"],
      include: path.resolve(__dirname, '../.storybook')
    });
    return config;
  },
}
