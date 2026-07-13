import { SelectMulti } from '../src'

import { SelectOption } from '../src/types'
import { longDefaultListOfOptions } from './storybookUtilities'

export default {
	title: 'SelectMulti',
	component: SelectMulti,
};

// Storybook 7's Vue3 renderer no longer passes args to story components that
// use the legacy `props: Object.keys(argTypes)` pattern — args must be exposed
// via setup() and bound explicitly
const Template = (args) => ({
	components: { SelectMulti },
	setup() {
		return { args }
	},
	data() { return { selected: [] } },
	template: `
	<div class="wrapper">
		<SelectMulti
			v-bind="args"
			v-model:values="selected"
	  	/>
	</div>`
});

export const Primary = Template.bind({});
Primary.args = {
	label: 'My SelectMulti',
	options: longDefaultListOfOptions,
	labelField: 'label',
	labelIsVisible: true,
	loading: false,
	placeholder: 'Select Options',
	disabled: false,
	displayPillsBelowInput: false,
	noResultsMessage: '',
	uniqueIdField: 'value'
};


const WithCustomOptionsTemplate = (args) => ({
	components: { SelectMulti },
	setup() {
		const getLabelForSearching = (option: SelectOption): string =>
			`label: ${option[args.labelField || 'label']}, with value: ${option[args.uniqueIdField || 'value']}`

		return { args, getLabelForSearching }
	},
	data() {
		return { values: [] }
	},
	template: `
	<div class="wrapper">
		<SelectMulti
			v-bind="args"
			v-model:values="values"
			:optionLabelForSearching="getLabelForSearching"
		>
				<template v-slot:selectedOption="{ option }" >
					<strong>{{ option[args.labelField || 'label'] }}</strong> <em>{{ option[args.uniqueIdField || 'value'] }}</em>
				</template>
				<template v-slot:option="{ option }" >
					<strong>label: {{ option[args.labelField || 'label'] }}</strong>, <em>with value: {{ option[args.uniqueIdField || 'value'] }}</em>
				</template>
				<template v-slot:input-icon>
					PLUS
				</template>
		</SelectMulti>
	</div>`
});

export const WithCustomOptions = WithCustomOptionsTemplate.bind({});
WithCustomOptions.args = {
	label: 'My SelectMulti with custom options',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	loading: false,
	placeholder: 'Select Options',
	disabled: false,
	displayPillsBelowInput: false,
	noResultsMessage: ''
};

WithCustomOptions.story = {
	parameters: {
		docs: {
			storyDescription: `
Sometimes, we need to display each option in the select with custom formatting,
or in a way different from the standard display of option.label. When this is the case,
an option scoped slot is provided for custom template code, as well as a selectedOption slot
`
		}
	}
}
