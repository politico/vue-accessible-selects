import { SelectMulti } from '../src'

import { SelectOption } from '../src/types'
import { longDefaultListOfOptions } from './storybookUtilities'

export default {
	title: 'SelectMulti',
	component: SelectMulti,
};

const Template = (args, { argTypes }) => ({
	props: Object.keys(argTypes),
	components: { SelectMulti },
	data() { return { selected: [] } },
	template: `
	<div class="wrapper">
		<SelectMulti
			v-model:values="selected"
			:options="options"
			:label="label"
			:labelField="labelField"
			:loading="loading"
			:labelIsVisible="labelIsVisible"
			:placeholder="placeholder"
			:disabled="disabled"
			:iconIsClickable="iconIsClickable"
			:displayPillsBelowInput="displayPillsBelowInput"
			:noResultsMessage="noResultsMessage"
			:uniqueIdField="uniqueIdField"
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
	iconIsClickable: true,
	placeholder: 'Select Options',
	disabled: false,
	displayPillsBelowInput: false,
	noResultsMessage: '',
	uniqueIdField: 'value'
};


const WithCustomOptionsTemplate = (args, { argTypes }) => ({
	props: Object.keys(argTypes),
	components: { SelectMulti },
	data() {
		return { values: [{}] }
	},
	methods: {
		getLabelForSearching(option: SelectOption): string {
			return `label: ${option[this.labelField]}, with value: ${option[this.uniqueIdField]}`
		}
	},
	template: `
	<div class="wrapper">
		<SelectMulti
			v-model="values"
			:options="options"
			:label="label"
			:loading="loading"
			:labelIsVisible="labelIsVisible"
			:optionLabelForSearching="getLabelForSearching"
			:placeholder="placeholder"
			:disabled="disabled"
			:displayPillsBelowInput="displayPillsBelowInput"
			:noResultsMessage="noResultsMessage"
		>
				<template v-slot:selectedOption="{ option }" >
					<strong>{{ option[labelField] }}</strong> <em>{{ option[uniqueIdField] }}</em>
				</template>
				<template v-slot:option="{ option }" >
					<strong>label: {{ option[labelField] }}</strong>, <em>with value: {{ option[uniqueIdField] }}</em>
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