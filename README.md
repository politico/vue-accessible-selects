# vue-accessible-selects

[![npm version](https://badge.fury.io/js/%40politico%2Fvue-accessible-selects.svg)](https://badge.fury.io/js/%40politico%2Fvue-accessible-selects)
[![Netlify Status](https://api.netlify.com/api/v1/badges/dd8c8636-2b7a-4984-a031-712b57d9bfba/deploy-status)](https://app.netlify.com/sites/vue-accessible-selects/deploys)

## Current Development

This entire repo is very much in an alpha state, and should currently be used only within internal Politico projects, as props / events / classes remain fluid. However, we are working towards a 1.0.0 release, and want to capture our relevant bugs fixed during that process.

## References

* Current guiding blogpost: https://www.24a11y.com/2019/select-your-poison-part-2/
* Codepen from blogpost: https://codepen.io/smhigley/pen/gObMVzv (#1 ≈ SelectSingle, #3 ≈ SelectMulti)
* Select single implementation: https://github.com/microsoft/sonder-ui/tree/master/src/components/select
* Select multiple implementation: https://github.com/microsoft/sonder-ui/tree/master/src/components/multiselect

## Current Usage *(updated 9/25/20)*

```shell
npm i @politico/vue-accessible-selects
```

```javascript
// In component

import { SelectSingle, SelectMulti } from '@politico/vue-accessible-selects'

const sampleOptions = [{
	label: 'One Option',
	value: 'one_option'
}, {
	label: 'Another Option',
	value: 'another_option'
}]

export default {
	components: { SelectSingle, SelectMulti },
	data() {
		return {
			sampleOptions,
			selectSingleValue: {},
			selectMultiValues: []
		}
	},
}

```

```html
<!-- In component -->
<SelectSingle
	v-model="selectSingleValue"
	:options="sampleOptions"
	label="My Single Select"
	:labelIsVisible="true"
/>

<SelectMulti
	v-model="selectMultiValues"
	:options="sampleOptions"
	label="My Multiple Select"
	:labelIsVisible="true"
	placeholder="Default Text to Display"
/>
```
## WARNING! node-sass deprecated
To compile scss code you must use dart `sass` package  as it uses `sass:math` module for divisions instead of slash https://sass-lang.com/documentation/breaking-changes/slash-div

`node-sass` is deprecated
```scss
// In any .scss file
// Simple, use default styles provided by lib
@import '~@politico/vue-accessible-selects/styles';

@include selects();
@include select-single();
@include select-multi();
```

for more detailed implementations, checkout the docs site

### Custom Styling

As we determine the most-commonly externally-referenced classes, we'll add them here

* `.combo-input`
* `.combo-menu`
