import SelectMulti from './SelectMulti.vue';

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
	  	/>
	</div>`
});

export const Primary = Template.bind({});
Primary.args = {
	label: 'My SelectMulti',
	options: [{ value: 'option-one', label: 'Option One' }, { value: 'option-two', label: 'Option Two' }],
	labelIsVisible: true,
	placeholder: 'Select Options'
};
