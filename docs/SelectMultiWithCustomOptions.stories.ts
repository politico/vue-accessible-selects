import SelectMulti from '../src/SelectMulti.vue'

import { longDefaultListOfOptions } from './storybookUtilities'

export default {
	title: 'SelectMulti with custom options',
	component: SelectMulti,
};

const Template = (args, { argTypes }) => ({
	props: Object.keys(argTypes),
	components: { SelectMulti },
	data() {
		return { values: [{}] } },
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

export const Primary = Template.bind({});
Primary.args = {
	label: 'My SelectMulti with custom options',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	placeholder: 'Select Options',
	disabled: false,
	displayPillsBelowInput: false,
};
