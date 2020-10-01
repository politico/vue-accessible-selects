import SelectMulti from '../src/SelectMulti.vue'

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
	displayPillsBelowInput: false
};
