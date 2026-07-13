import { SelectSearchSingle } from '../src'

import { SelectOption } from '../src/types'
import { longDefaultListOfOptions } from './storybookUtilities'

export default {
	title: 'SelectSearchSingle',
	component: SelectSearchSingle
}

// Storybook 7's Vue3 renderer no longer passes args to story components that
// use the legacy `props: Object.keys(argTypes)` pattern — args must be exposed
// via setup() and bound explicitly
const Template = (args) => ({
	components: { SelectSearchSingle },
	setup() {
		return { args }
	},
	data() {
		return {
			currentValue: {
				value: 'option-two',
				label: 'Option Two'
			}
		}
	},
	methods: {
		clearValue() {
			this.currentValue = null
		},
		updateValue(value) {
			this.currentValue = value
		}
	},
	template: `
	<div class="wrapper">
		<SelectSearchSingle
			v-bind="args"
			v-model:value="currentValue"
			@searchChange="clearValue"
			@update:value="updateValue"
		/>
	</div>`
})

export const Primary = Template.bind({})
Primary.args = {
	label: 'My SelectSearchSingle',
	options: longDefaultListOfOptions,
	labelField: 'label',
	labelIsVisible: true,
	loading: false,
	placeholder: 'All',
	disabled: false,
	noResultsMessage: '',
	uniqueIdField: 'value'
}

const WithCustomOptionsTemplate = (args) => ({
	components: { SelectSearchSingle },
	setup() {
		const getLabelForSearching = (option: SelectOption): string => {
			if (!option) {
				return ''
			}

			return `label: ${option[args.labelField || 'label']}, with value: ${option[args.uniqueIdField || 'value']}`
		}

		return { args, getLabelForSearching }
	},
	data() {
		return { currentValue: null }
	},
	methods: {
		clearValue() {
			this.currentValue = null
		},
		updateValue(value) {
			this.currentValue = value
		}
	},
	template: `
	<div class="wrapper">
		<SelectSearchSingle
			v-bind="args"
			v-model:value="currentValue"
			:optionLabelForSearching="getLabelForSearching"
			@searchChange="clearValue"
			@update:value="updateValue"
		>
			<template v-slot:option="{ option }" >
				<strong>label: {{ option[args.labelField || 'label'] }}</strong>, <em>with value: {{ option[args.uniqueIdField || 'value'] }}</em>
			</template>
		</SelectSearchSingle>
	</div>`
})

export const WithCustomOptions = WithCustomOptionsTemplate.bind({})
WithCustomOptions.args = {
	label: 'My SelectSearchSingle with custom options',
	options: longDefaultListOfOptions,
	ariaLabel: 'My SelectSearchSingle with custom options',
	uniqueIdField: 'value',
	labelField: 'label',
	labelIsVisible: true,
	loading: false,
	placeholder: 'All',
	disabled: false,
	noResultsMessage: 'no results were found'
}

WithCustomOptions.story = {
	parameters: {
		docs: {
			storyDescription: `
Sometimes, we need to display each option in the select with custom formatting,
or in a way different from the standard display of option.label. When this is the case,
an option scoped slot is provided for custom template code.
`
		}
	}
}
