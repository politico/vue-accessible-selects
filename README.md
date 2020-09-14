# vue-accessible-selects

## Current Development

This entire repo is very much in an alpha state, and should currently be used only within internal Politico projects, as props / events / classes remain fluid. However, we are working towards a 1.0.0 release, and want to capture our relevant bugs fixed during that process.

## References

* Current guiding blogpost: https://www.24a11y.com/2019/select-your-poison-part-2/ 
* Select single implementation: https://github.com/microsoft/sonder-ui/tree/master/src/components/select 
* Select multiple implementation: https://github.com/microsoft/sonder-ui/tree/master/src/components/multiselect

## Current Usage *(updated 8/25/20)*

```ts
import { SelectOption } from './types'
import SelectSingle from './SelectSingle.vue'
import SelectMultiple from './SelectSingle.vue'

const sampleOptions: SelectOption[] = [{
	label: 'One Option',
	value: 'one_option'
}, {
	label: 'Another Option',
	value: 'another_option'
}]

export default Vue.extend({
	components: { SelectSingle, SelectMultiple },
	data() {
		return {
			sampleOptions,
			selectSingleValue: {} as SelectOption,
			selectMultipleValues: [] as SelectOption[]
		}
	},
	methods: {
		handleSelectEvent(selectedValue: SelectOption) {
			// selectedValue will be the most recently selected value
			// *generally not necessary*, if state can be handled w/ v-model alone
		},
		handleRemoveEvent(selectedValue: SelectOption) {
			// selectedValue will be the most recently removed value
			// *generally not necessary*, if state can be handled w/ v-model alone
		},
		handleSearchChangeEvent(inputValue: string) {
			// inputValue will be the current user-provided search string
			// primarily useful for making autocomplete calls
		}
	}
})

```

```html
<SelectSingle
	v-model="selectSingleValue"
	:options="sampleOptions"
	label="My Single Select"
	:labelisVisible="true"
	@select="handleSelectEvent"
/>

<SelectMultiple
	v-model="selectMultipleValues"
	:options="sampleOptions"
	label="My Multiple Select"
	:labelIsVisible="true"
	placeholder="Default Text to Display"
	@select="handleSelectEvent"
	@remove="handleRemoveEvent"
	@searchChange="handleSearchChangeEvent"
/>
```