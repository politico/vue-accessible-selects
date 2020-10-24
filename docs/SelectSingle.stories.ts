import SelectSingle from '../src/SelectSingle.vue';

import { longDefaultListOfOptions } from './storybookUtilities'

export default {
	title: 'SelectSingle',
	component: SelectSingle,
};

const Template = (args, { argTypes }) => ({
	props: Object.keys(argTypes),
	components: { SelectSingle },
	data() { return { value: {} } },
	template: `
	<div class="wrapper">
		<SelectSingle 
			v-model="value" 
			:options="options"
			:label="label" 
			:labelIsVisible="labelIsVisible"
			:disabled="disabled"
		/>
	</div>`
});

export const Primary = Template.bind({});
Primary.args = {
	label: 'My SelectSingle',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	disabled: false
};


const WithCustomOptionsTemplate = (args, { argTypes }) => ({
	props: Object.keys(argTypes),
	components: { SelectSingle },
	data() {
		return {
			value: {
				value: 'option-two',
				label: 'Option Two'
			}
		}
	},
	template: `
	<div class="wrapper">
		<SelectSingle
			v-model="value"
			:options="options"
			:label="label"
			:labelIsVisible="labelIsVisible"
			:disabled="disabled"
		>
			<template v-slot:selectedOption="{ option }" >
				<strong>{{ option.label }}</strong> <em>{{ option.value }}</em>
			</template>
			<template v-slot:option="{ option }" >
				<strong>label: {{ option.label }}</strong>, <em>with value: {{ option.value }}</em>
			</template>
		</SelectSingle>
	</div>`
});

export const WithCustomOptions = WithCustomOptionsTemplate.bind({});
WithCustomOptions.args = {
	label: 'My SelectSingle with custom options',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	disabled: false
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
