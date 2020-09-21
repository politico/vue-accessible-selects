import SelectSingle from './SelectSingle.vue';

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
	options: [{ value: 'option-one', label: 'Option One' }, { value: 'option-two', label: 'Option Two' }],
	labelIsVisible: true,
	disabled: false
};
