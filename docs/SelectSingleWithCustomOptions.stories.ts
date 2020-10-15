import SelectSingle from '../src/SelectSingle.vue';

import { longDefaultListOfOptions } from './storybookUtilities'

export default {
	title: 'SelectSingle with custom options',
	component: SelectSingle,
};

const Template = (args, { argTypes }) => ({
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
				[{{ option.label }}] [{{ option.value }}]
			</template>
			<template v-slot:option="{ option }" >
				[label]: {{ option.label }} [with value]: {{ option.value }}
			</template>
		</SelectSingle>
	</div>`
});

export const Primary = Template.bind({});
Primary.args = {
	label: 'My SelectSingle with custom options',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	disabled: false
};

