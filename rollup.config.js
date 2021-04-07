// import minify from 'rollup-plugin-babel-minify'

export default {
	input: 'src/index.js',
	// plugins: [minify({ comments: false })],
	// output: [
	//   {
	//     file: 'dist/index.esm.js',
	//     format: 'es',
	//   },
	//   {
	//     file: 'dist/index.js',
	//     format: 'cjs',
	//   },
	// ],
	output: [
		{
			file: 'dist/plugin.cjs.js',
			format: 'cjs',
			// format: 'es',
		},
	],
}
