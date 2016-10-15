// http://eslint.org/docs/rules
module.exports = {
	"root": true,
	"parser": "babel-eslint",
	"env": {
		"browser": true,
		"node": true,
	"es6": true
	},
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "module",
		"ecmaFeatures": {
			"jsx": true
		}
	},
	"extends": ["eslint:recommended"],
	"rules": {
		"strict": 0,
		"indent": [0, "tab"],
		"quotes": [2, "single"],
		"no-underscore-dangle": 0,
		"no-unused-vars": 2,
		"no-undef": 2,
		"no-unused-expressions": 0,
		"semi": ["error", "never"],
		"new-cap": 0,
		"no-shadow": 0,
		"no-use-before-define": 0,
		"no-console": 0
	}
}
