const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
	testEnvironment: "node",
	roots: ["<rootDir>/cdk/test"],
	testMatch: ["**/*.test.ts"],
	transform: {
		// Updated ts-jest configuration format
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				// ts-jest specific configuration goes here
				tsconfig: "<rootDir>/tsconfig.json",  // Full path to root tsconfig
				diagnostics: true,
				isolatedModules: true // Recommended for better performance
			}
		],
	},
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/'
	}),
};
