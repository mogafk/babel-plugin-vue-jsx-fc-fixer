# babel-plugin-vue-jsx-fc-fixer
Babel plugin fixing incorrect transpiling of Vue 2 Functional Components + JSX.

## Usage
```typescript jsx
import { VueFC } from '~/types/vue-fc.ts'

interface ButtonProps {
    handleClick: () => void
}

const MyButton: VueFC<ButtonProps> = (props, ctx) => {
	return (
		<button onClick={props.handleClick}>
			{ctx.slots().default}
		</button>
	)
}
```

## Setup

### Installation

```bash
npm i -D babel-plugin-vue-jsx-fc-fixer
```

### Nuxt
Add plugin to `build` section of `nuxt.config.js`

```js
build: {
    babel: {
        plugins: [
            'vue-jsx-fc-fixer',
        ],
    },
},
```

### TypeScript
You will need to add minimal type declarations to your project for proper TypeScript support.

```typescript
import Vue, {RenderContext, VNodeData, VNode} from 'vue'

type CSSClass = (string | string[] | {
    [key: string]: any
})

class VueComponent<P = {}> extends Vue {
    public $props!: P & {
        key?: string | number
        class?: CSSClass | CSSClass[]
        style?: VNodeData['style']
        ref?: VNodeData['ref']
    }
}

export type VueFC<Props> = (props: Props & VueComponent['$props'], ctx: RenderContext) => VNode

```
