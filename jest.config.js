module.exports = {
  preset: 'ts-jest',
  "transform": {
		".*\\.(vue)$": "vue-jest"
  },
  "moduleFileExtensions": [
		"js",
		"json",
		"ts",
		// tell Jest to handle `*.vue` files
		"vue"
  ],
  "transform": {
		// process `*.vue` files with `vue-jest`
		".*\\.(js)$": "babel-jest",
		".*\\.(ts)$": "ts-jest",
		".*\\.(vue)$": "vue-jest"
	},
  "collectCoverage": true,
	"collectCoverageFrom": ["src/**/*.{js,ts,vue}"]
};