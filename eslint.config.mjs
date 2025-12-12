import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const config = await generateEslintConfig({})

// Project uses ESM (.js with "type": "module"); ensure ESLint parses as modules
config.push({
	files: ['**/*.js', '**/*.mjs'],
	languageOptions: {
		sourceType: 'module',
	},
})

export default config
