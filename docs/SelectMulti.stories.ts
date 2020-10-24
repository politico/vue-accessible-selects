import SelectMulti from '../src/SelectMulti.vue'

import { SelectOption } from '../src/types'
import { longDefaultListOfOptions } from './storybookUtilities'

export default {
	title: 'SelectMulti',
	component: SelectMulti,
};

const Template = (args, { argTypes }) => ({
	props: Object.keys(argTypes),
	components: { SelectMulti },
	data() { return { values: [] } },
	template: `
	<div class="wrapper">
		<SelectMulti
			v-model="values"
			:options="options"
			:label="label"
			:labelIsVisible="labelIsVisible"
			:placeholder="placeholder"
			:disabled="disabled"
			:displayPillsBelowInput="displayPillsBelowInput"
	  	/>
	</div>`
});

export const Primary = Template.bind({});
Primary.args = {
	label: 'My SelectMulti',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	placeholder: 'Select Options',
	disabled: false,
	displayPillsBelowInput: false,
};


const WithCustomOptionsTemplate = (args, { argTypes }) => ({
	props: Object.keys(argTypes),
	components: { SelectMulti },
	data() {
		return { values: [{}] }
	},
	methods: {
		getLabelForSearching(option: SelectOption): string {
			return `label: ${option.label}, with value: ${option.value}`
		}
	},
	template: `
	<div class="wrapper">
		<SelectMulti
			v-model="values"
			:options="options"
			:label="label"
			:labelIsVisible="labelIsVisible"
			:optionLabelForSearching="getLabelForSearching"
			:placeholder="placeholder"
			:disabled="disabled"
			:displayPillsBelowInput="displayPillsBelowInput"
			>
				<template v-slot:selectedOption="{ option }" >
					<strong>{{ option.label }}</strong> <em>{{ option.value }}</em>
				</template>
				<template v-slot:option="{ option }" >
					<strong>label: {{ option.label }}<strong>, <em>with value: {{ option.value }}</em>
				</template>
		</SelectMulti>
	</div>`
});

export const WithCustomOptions = WithCustomOptionsTemplate.bind({});
WithCustomOptions.args = {
	label: 'My SelectMulti with custom options',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	placeholder: 'Select Options',
	disabled: false,
	displayPillsBelowInput: false,
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
