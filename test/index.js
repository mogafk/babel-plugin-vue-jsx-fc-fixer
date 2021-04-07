import diff from 'jest-diff';
import plugin from '../src/index.js'
import { transform } from '@babel/core'

const stripIndent = (str) => {
	const regex = new RegExp(`^[ \\t\\s]*`, 'gm');

	return str.replace(regex, '');
};

expect.extend({
	toEqualCode(rawReceived, rawExpected) {
		const received = stripIndent(rawReceived.trim())
		const expected = stripIndent(rawExpected.trim())
    
		const pass = received == expected

		const message = pass 
			? () => 'toEqualCode passed'+ 
        '\n\n' + 
        `Expected: ${rawExpected}`
			: () => diff(received, expected)

		return {message, pass}
	}
})

const transpile = src =>
	new Promise((resolve, reject) => {
		transform(
			src,
			{
				configFile: false,
				//   presets: ['@vue/babel-preset-jsx'],
				plugins: [plugin],
			},
			(err, result) => {
				if (err) {
					return reject(err)
				}
				resolve(result.code)
			}
		)
	})

const tests = [
	{
		name: 'Only props injection',
		from: `
export default (props) => {
	return <div />;
}
        `,
		to: `
export default (__ctx => {
	const {
		props
	} = __ctx;

	return <div />;
});
        `,
	},
	{
		name: 'props + context injection',
		from: `
export default (props, context) => {
	return <div />;
}
        `,
		to: `
export default (__ctx => {
	const {
		props,
		...context
	} = __ctx;

	return <div />;
});
        `,
	},
	{
		name: 'props + context(not default names)',
		from: `
export default (myAwesomeProps, myAwesomeContextName) => {
	return <div />;
}
      `,
		to: `
export default (__ctx => {
	const {
		myAwesomeProps,
		...myAwesomeContextName
	} = __ctx;

	return <div />;
});
      `,
	},
	{
		name: 'desctruct props',
		from: `
export default ({propA, propB}, myContext) => {
	return <div />;
}
    `,
		to: `
export default (__ctx => {
	const {
		props: {
		propA,
		propB
		},
		...myContext
	} = __ctx;

	return <div />;
});
    `,
	},
	{
		name: 'desctruct props and context',
		from: `
export default ({propA, propB}, {slots, data, ...restContext}) => {
	return <div />;
}
    `,
		to: `
export default (__ctx => {
	const {
		props: {
			propA,
			propB
		},
		slots,
		data,
		...restContext
	} = __ctx;

	return <div />;
});
    `,
	},
	{
		name: 'undefined params',
		from: `
export default (props, ctx, undef1, undef2, undef3) => {
	return (
		<div />
	)
}
    `,
		to: `
export default (__ctx => {
	let undef1, undef2, undef3;
	const {
		props,
		...ctx
	} = __ctx;

	return <div />;
});
    `,
	}
]


tests.forEach(testcase => {
	test(testcase.name, async () => {
		const code = await transpile(testcase.from)

		expect(code).toEqualCode(testcase.to);
	})
})
