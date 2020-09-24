# vue-accessible-selects

[![npm version](https://badge.fury.io/js/%40politico%2Fvue-accessible-selects.svg)](https://badge.fury.io/js/%40politico%2Fvue-accessible-selects)
[![Netlify Status](https://api.netlify.com/api/v1/badges/dd8c8636-2b7a-4984-a031-712b57d9bfba/deploy-status)](https://app.netlify.com/sites/vue-accessible-selects/deploys)

## Current Development

This entire repo is very much in an alpha state, and should currently be used only within internal Politico projects, as props / events / classes remain fluid. However, we are working towards a 1.0.0 release, and want to capture our relevant bugs fixed during that process.

## References

* Current guiding blogpost: https://www.24a11y.com/2019/select-your-poison-part-2/ 
* Select single implementation: https://github.com/microsoft/sonder-ui/tree/master/src/components/select 
* Select multiple implementation: https://github.com/microsoft/sonder-ui/tree/master/src/components/multiselect

## Current Usage *(updated 9/24/20)*

```shell
npm i @politico/vue-accessible-components
```

```ts
// In component

import { SelectSingle, SelectMulti, SelectOption } from '@politico/vue-accessible-selects'

const sampleOptions: SelectOption[] = [{
	label: 'One Option',
	value: 'one_option'
}, {
	label: 'Another Option',
	value: 'another_option'
}]

export default Vue.extend({
	components: { SelectSingle, SelectMulti },
	data() {
		return {
			sampleOptions,
			selectSingleValue: {} as SelectOption,
			selectMultiValues: [] as SelectOption[]
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
<!-- in component -->
<SelectSingle
	v-model="selectSingleValue"
	:options="sampleOptions"
	label="My Single Select"
	:labelIsVisible="true"
	@select="handleSelectEvent"
/>

<SelectMulti
	v-model="selectMultiValues"
	:options="sampleOptions"
	label="My Multiple Select"
	:labelIsVisible="true"
	placeholder="Default Text to Display"
	@select="handleSelectEvent"
	@remove="handleRemoveEvent"
	@searchChange="handleSearchChangeEvent"
/>
```

```scss
// For now, we provide SCSS mixins to customize w/ colors
// Soon, we'll add documentation for the primary classes to target, as well as a default .css file to include
// So in a .scss file used by your project (safe to do globally, since the styles are wrapped by unique `vue-accessible-` prefixed roots)...

// Using Webpack syntax: `~` indicates "look in the current working directory"
@import '~@politico/vue-accessible-selects/dist/mixins.scss';

@include select(
	$primary-background-color: white,
	$focus-background-color: green,
)
@include select-multi(
	$selected-option-pill-color: blue,
	$selected-option-pill-background-color: lightblue
)
```

For additional custom styling, the following classes are intended to be stable for targeting:

* Root, Single: `.vue-accessible-select-single`
* Root, Multi: `.vue-accessible-select-multi`

### Both

* `.combo-input`
* `.combo-label`
* `.combo-menu`
* `.combo-option`
* `.combo-option.option-selected`
* `.combo-option.option-current`

### Multi

* `.selected-options`
* `.selected-option-pill`
