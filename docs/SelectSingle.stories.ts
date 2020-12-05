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
			:labelField="labelField"
			:labelIsVisible="labelIsVisible"
			:loading="loading"
			:disabled="disabled"
			:valueField="valueField"
		/>
	</div>`
});

export const Primary = Template.bind({});
Primary.args = {
	label: 'My SelectSingle',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	loading: false,
	disabled: false
};

const optionsWithArrayValues = [
    {
        value: ['value-1', 'value-2'],
        label: 'Option 1'
    },
    {
        value: 'value-3',
        label: 'Option 2'
    }
]

export const withArrayAsOptionValues = Template.bind({})
withArrayAsOptionValues.args = {
    label: 'My SelectSingle With Array Values',
    options: optionsWithArrayValues,
    labelIsVisible: true,
    disabled: false
}

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
			:loading="loading"
			:disabled="disabled"
		>
			<template v-slot:selectedOption="{ option }" >
				<strong>{{ option[labelField] }}</strong> <em>{{ option[valueField] }}</em>
			</template>
			<template v-slot:option="{ option }" >
				<strong>label: {{ option[labelField] }}</strong>, <em>with value: {{ option[valueField] }}</em>
			</template>
		</SelectSingle>
	</div>`
});

export const WithCustomOptions = WithCustomOptionsTemplate.bind({});
WithCustomOptions.args = {
	label: 'My SelectSingle with custom options',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	loading: false,
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
