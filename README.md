# vue-accessible-selects

[![npm version](https://badge.fury.io/js/@politico%2Fvue-accessible-selects.svg)](https://badge.fury.io/js/@politico%2Fvue-accessible-selects)

**Description:** Select & Multi Select implementations for Vue, focused especially on implementing accessibility best practices
- **Technology stack:** Vue 3, Typescript, Vite
- **Demo:** [vue-accessible-selects.netlify.app/](vue-accessible-selects.netlify.app/)


## Installation

```shell
npm i @politico/vue-accessible-selects
```

## Usage
```javascript

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

### Custom Styling

Most-commonly externally-referenced classes:

* `.combo-input`
* `.combo-menu`

## References

- Guiding blogpost: https://www.24a11y.com/2019/select-your-poison-part-2/
- Codepen from above blogpost: https://codepen.io/smhigley/pen/gObMVzv
	- #1 ≈ SelectSingle
	- #3 ≈ SelectMulti
- Select single implementation: https://github.com/microsoft/sonder-ui/tree/master/src/components/select
- Select multiple implementation: https://github.com/microsoft/sonder-ui/tree/master/src/components/multiselect

## WARNING! node-sass deprecated
To compile scss code you must use dart `sass` package  as it uses `sass:math` module for divisions instead of slash https://sass-lang.com/documentation/breaking-changes/slash-div

`node-sass` is deprecated
```scss
// In any .scss file
// Simple, use default styles provided by lib
// Require `NodePackageImporter` importer for importing this way
// https://sass-lang.com/documentation/js-api/classes/nodepackageimporter/
@use 'pkg:@politico/vue-accessible-selects/styles' as *;

@include selects();
@include select-single();
@include select-multi();
```

for more detailed implementations, checkout the docs site
