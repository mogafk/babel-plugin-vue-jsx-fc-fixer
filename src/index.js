const syntaxJsx = require('@babel/plugin-syntax-jsx')

/**
 * Check if expression is in method
 * @param t
 * @param path
 * @param parentLimitPath
 * @returns boolean
 */
const isInMethod = (t, path, parentLimitPath) => {
	if (!path || path === parentLimitPath) {
		return false
	}
	if (t.isObjectMethod(path)) {
		return true
	}
	return isInMethod(t, path.parentPath, parentLimitPath)
}
  
/**
   * Check path has JSX
   * @param t
   * @param path
   * @returns boolean
   */
const hasJSX = (t, path) => {
	let hasJSX = false
  
	path.traverse({
		JSXElement(elPath) {
			if (!isInMethod(t, elPath, path)) {
				hasJSX = true
			}
		},
	})
  
	return hasJSX
}
  
/**
   * Check if it's a functional componet declarator
   * @param t
   * @param path
   * @returns boolean
   */
const isFunctionalComponentDeclarator = (t, path) => {
	const firstCharacter = path.get('id.name').node[0]
	if (firstCharacter < 'A' || firstCharacter > 'Z') {
		return false
	}
  
	return hasJSX(t, path)
}


function fixParams(t, path) {
	const [props, context, ...undefVars] = path.get('params')

	const newObjectProperties = []
	if (props) {
		if(t.isObjectPattern(props)) {
			newObjectProperties.push(
				t.objectProperty(
					t.identifier('props'),
					props.node
				)
			)
		} else if (t.isIdentifier(props)) {
			newObjectProperties.push(
				t.objectProperty(
					props.node,
					props.node,
					false, true
				)
			)
		}
	}

	if (context) {
		if(t.isObjectPattern(context)) {
			context.get('properties').forEach(prop => {
				newObjectProperties.push(
					prop.node
				)
			})
		} else if (t.isIdentifier(context)) {
			newObjectProperties.push(
				t.restElement(context.node)
			)
		}
	}

	let undefinedParams = null
	if (undefVars.length) {
		undefinedParams = t.variableDeclaration('let',
			undefVars.map(variable => t.variableDeclarator(variable.node))
		)
	}

	if (newObjectProperties.length) {
		path.get('body')
			.unshiftContainer(
				'body',
				[
					undefinedParams,
					t.variableDeclaration('const', [
						t.variableDeclarator(
							t.objectPattern(
								newObjectProperties
							),
							t.identifier('__ctx')
						)
					])
				].filter(Boolean)
			)
        
		path.set('params', [
			t.identifier('__ctx')
		])
	}
}

module.exports = babel => {
	const t = babel.types
    
	return {
		inherits: syntaxJsx.default || syntaxJsx,
		// inherits: syntaxJsx,
		visitor: {
			Program(p) {
				p.traverse({
					ExportDefaultDeclaration: {
						exit(path) {
							if (!t.isArrowFunctionExpression(path.node.declaration) || !hasJSX(t, path)) {
								return
							}

							fixParams(t, path.get('declaration'))
						},
					},
					VariableDeclaration: {
						exit(path) {
							if (
								path.node.declarations.length !== 1 ||
									!t.isVariableDeclarator(path.node.declarations[0]) ||
									!t.isArrowFunctionExpression(path.node.declarations[0].init)
							) {
								return
							}

							const declarator = path.get('declarations')[0]

							if (!isFunctionalComponentDeclarator(t, declarator)) {
								return
							}

							fixParams(t, declarator.get('init'))
						}
					},
				})
			}
		}
	}
}