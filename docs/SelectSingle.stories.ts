import { SelectSingle } from '../src';

import { longDefaultListOfOptions } from './storybookUtilities'

export default {
	title: 'SelectSingle',
	component: SelectSingle,
};

// Storybook 7's Vue3 renderer no longer passes args to story components that
// use the legacy `props: Object.keys(argTypes)` pattern — args must be exposed
// via setup() and bound explicitly
const Template = (args) => ({
	components: { SelectSingle },
	setup() {
		return { args }
	},
	data() { return { selected: {} } },
	template: `
	<div class="wrapper">
		<SelectSingle
			v-bind="args"
			v-model:value="selected"
			placeholder="Select any option"
		/>
	</div>`
});

export const Primary = Template.bind({});
Primary.args = {
	label: 'My SelectSingle',
	options: longDefaultListOfOptions,
	labelIsVisible: true,
	prependLabel: false,
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

const WithCustomOptionsTemplate = (args) => ({
	components: { SelectSingle },
	setup() {
		return { args }
	},
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
			v-bind="args"
			v-model:value="value"
		>
			<template v-slot:selectedOption="{ option }" >
				<strong>{{ option[args.labelField || 'label'] }}</strong> <em>{{ option[args.uniqueIdField || 'value'] }}</em>
			</template>
			<template v-slot:option="{ option }" >
				<strong>label: {{ option[args.labelField || 'label'] }}</strong>, <em>with value: {{ option[args.uniqueIdField || 'value'] }}</em>
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

const WithPanelOptionTemplate = (args) => ({
	components: { SelectSingle },
	setup() {
		return { args }
	},
	data() {
		return {
			value: {},
			appliedRange: ''
		}
	},
	template: `
	<div class="wrapper">
		<SelectSingle
			v-bind="args"
			v-model:value="value"
			placeholder="Select an option"
			:panelOption="{ label: 'Custom range', value: 'custom-range' }"
			:panelOptionSelected="!!appliedRange"
		>
			<template v-slot:panelOption="{ option, selected }">
				<div style="display: flex; flex-direction: column;">
					<span>{{ option.label }}</span>
					<small>{{ selected ? appliedRange : 'Select Dates' }}</small>
				</div>
			</template>
			<template v-slot:panel="{ closeMenu, showOptions }">
				<div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
					<button @click="showOptions">&lsaquo; Back to presets</button>
					<p>Any content can live here — e.g. a date range picker.</p>
					<button @click="appliedRange = '03/15/2026 - 06/15/2026'; value = { label: appliedRange, value: 'custom-range' }; closeMenu()">
						Apply
					</button>
				</div>
			</template>
		</SelectSingle>
	</div>`
});

export const WithPanelOption = WithPanelOptionTemplate.bind({});
WithPanelOption.args = {
	label: 'My SelectSingle with a panel option',
	options: longDefaultListOfOptions,
	labelIsVisible: true
};

WithPanelOption.story = {
	parameters: {
		docs: {
			storyDescription: `
When a select needs one special trailing option that opens richer in-dropdown UI
(e.g. a custom date range picker) instead of directly selecting a value, pass a
panelOption prop and provide the panel content via the panel scoped slot.
The slot receives closeMenu (close the whole dropdown, e.g. after applying) and
showOptions (return to the option list). The panelOption scoped slot customizes
the trailing row itself, and panelOptionSelected marks it as the active selection.
The component emits panelOpened / panelClosed as the panel is shown and hidden.
`
		}
	}
}
