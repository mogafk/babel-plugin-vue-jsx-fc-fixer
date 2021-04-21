const babel = require('@babel/core')
const visitor = require('./src/index')

babel.transform(
	`
export default ({propName1, propName2}, ctxRest, undef1, undef2) => {
    return (
        <div>
            {ctx.$scopedSlots.actions?.({})}
        </div>
    )
}
`,
	{
		configFile: false,
		presets: [
			['@vue/babel-preset-jsx', {
				// compositionAPI: true
			}],
		],
		plugins: [
			visitor
		]
	},
	(err, res) => {
		if(err) {
			console.log('err is: \n', err)
		} else {
			console.log('transpiled code is: \n', res.code)
		}
	}
)
