import type { Meta, StoryObj } from '@storybook/vue3'

import { SelectSearchSingle } from '../src'

import { SelectOption } from '../src/types'
import { longDefaultListOfOptions } from './storybookUtilities'
import { Ref, ref } from 'vue'


const meta: Meta<typeof SelectSearchSingle> = {
	title: 'SelectSearchSingle',
	component: SelectSearchSingle
}

export default meta

type Story = StoryObj<typeof SelectSearchSingle>

export const Primary: Story = {
	render: args => ({
		components: { SelectSearchSingle },
		setup() {
			const currentValue: Ref<SelectOption | null> = ref({
				value: 'option-two',
				label: 'Option Two'
			})

			const clearValue = () => {
				currentValue.value = null
			}

			const updateValue = (value) => {
				currentValue.value = value
			}

			return { args, currentValue, clearValue, updateValue }
		},
		template: `
		<div class="wrapper">
			<SelectSearchSingle
				v-model:value="currentValue"
				v-bind="args"
				@searchChange="clearValue"
				@update:value="updateValue"
			/>
		</div>`
	}),
	args: {
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
}


export const WithCustomOptionsTemplate: Story = {
	render: args => ({
		components: { SelectSearchSingle },
		setup() {
			const currentValue: Ref<SelectOption | null> = ref(null)


			const getLabelForSearching = (option: SelectOption): string =>  {
				if (!option) {
					return ''
				}
				// @ts-ignore
				return `label: ${option?.[args.labelField]}, with value: ${option?.[args.uniqueIdField]}`
			}

			const clearValue = () => {
				currentValue.value = null
			}

			const updateValue = (value) => {
				currentValue.value = value
			}

			return { args: {
				...args,
				optionLabelForSearching: getLabelForSearching
			}, currentValue, getLabelForSearching, updateValue, clearValue }
		},
		template: `
		<div class="wrapper">
		<SelectSearchSingle
			v-model:value="currentValue"
			v-bind="args"
			@searchChange="clearValue"
			@update:value="updateValue"
		>
				<template v-slot:option="{ option }" >
					<strong>label: {{ option.label }}</strong>, <em>with value: {{ option.value }}</em>
				</template>
		</SelectSearchSingle>
	</div>`
	}),
	args: {
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
}





