/**
 * @summary
 * The shape of a single option provided to `SelectSingle` or `SelectMulti`
 *  
 * @default
 * { label: string, value: string }
 * 
 * @description
 * If your options *do not* match the default { label, value } shape, 
 * some additional props
 * (e.g. `labelField` & `uniqueIdField`)
 * will need to be set on the `SelectSingle` / `SelectMulti` components
 * in order to ensure proper display & selecting/deselecting behavior
 */
export interface SelectOption {
	label?: string
	value?: string
	[key: string]: any
}
