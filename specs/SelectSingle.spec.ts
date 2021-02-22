import { mount, Wrapper } from '@vue/test-utils'

import { SelectOption } from '../src/types'

import SelectSingle from '../src/SelectSingle.vue'
import { 
	simpleOptions,
	optionsWithCustomLabelAndUniqueIdFields
} from './sampleData'

describe('SelectSingle', () => {
	let wrapper: Wrapper<Vue>
	let options: SelectOption[]

	function mountSelectSingle(selectSingleTemplate: string) {
		return mount({
			data() { return { selectedOption: {}, options }},
			template: `<div>${selectSingleTemplate}</div>`,
			components: { SelectSingle },
			methods: {
				setOptions(newOptions) { this['options'] = newOptions }
			}
		})
	}

	function testBehaviorForSelectingOption(originalOptions: SelectOption[], testBehaviorForEventEmitsAndVModel?: () => void) {
		describe('when the second option is clicked', () => {
			beforeEach(async () => {
				const listbox = wrapper.find("div[role=listbox]")
				await listbox.findAll('div[role=option]').at(1).trigger('click')
			})

			it('sets the new displayed value of the select appropriately', async () => {
				expect(wrapper.find('div[role=combobox]').text()).toEqual('Item Two')
			})

			it('marks the correct option in the dropdown as selected, with the correct class & aria attribute', async () => {
				const listbox = wrapper.find("div[role=listbox]")
				const selectedDivOptions = listbox.findAll('div.option-selected[role=option][aria-selected=true]')
				const selectedDivOptionText = selectedDivOptions.at(0).text()
				
				expect(selectedDivOptions.length).toEqual(1)
				expect(selectedDivOptionText).toEqual('Item Two')
			})

			testBehaviorForEventEmitsAndVModel?.()

			describe('(testing finding items by value, rather than reference) ' + 
				'then something occurs in the parent such that the options array is updated to be a new instance (of the same original array)', () => {
				beforeEach(() => {
					wrapper.vm['setOptions'](originalOptions.map(option => ({ ...option })))
				})

				it('continues to set the displayed value of the select appropriately', () => {
					expect(wrapper.find('div[role=combobox]').text()).toEqual('Item Two')
				})

				it('still marks the correct option in the dropdown as selected, with the correct class & aria attribute', () => {
					const listbox = wrapper.find("div[role=listbox]")
					const selectedDivOptions = listbox.findAll('div.option-selected[role=option][aria-selected=true]')
					
					expect(selectedDivOptions.length).toEqual(1)
					expect(selectedDivOptions.at(0).text()).toEqual('Item Two')
				})
			})
		})
	}

	describe('given simple options', () => {
		beforeEach(() => options = simpleOptions )

		describe('with a simple SelectSingle initialized with options, v-model, and a label', () => {
			beforeEach(() => {
				wrapper = mountSelectSingle(`
					<SelectSingle
						:options="options"
						v-model="selectedOption"
						label="Sample SelectSingle"
					/>
				`)
			})

			it('contains all 3 given options in the dropdown', () => {
				const listbox = wrapper.find("div[role=listbox]")
				const divOptions = listbox.findAll('div[role=option]')
	
				expect(divOptions.at(0).text()).toEqual('Item One')
				expect(divOptions.at(1).text()).toEqual('Item Two')
				expect(divOptions.at(2).text()).toEqual('Item Three')
			})
	
			testBehaviorForSelectingOption(simpleOptions, () => {
				it('emits the full selected item exactly once', async () => {
					const selectSingle = wrapper.findComponent(SelectSingle)
	
					expect(selectSingle.emitted().select.length).toEqual(1)
					expect(selectSingle.emitted().select[0]).toEqual([{ label: 'Item Two', value: 'two' }])
				})
	
				it('sets the parent component data property correctly, given v-model usage', async () => {
					expect(wrapper.vm['selectedOption']).toEqual({ label: 'Item Two', value: 'two' })
				})
			})
		})
	})

	describe('given options w/ custom label & uniqueId fields', () => {
		beforeEach(() => options = optionsWithCustomLabelAndUniqueIdFields)
		
		describe('with a SelectSingle initialized with labelField & uniqueIdField props', () => {
			beforeEach(() => { 
				wrapper = mountSelectSingle(`
					<SelectSingle 
						:options="options"
						v-model="selectedOption"
						label="Sample SelectSingle"
						labelField="customLabel"
						uniqueIdField="customUniqueId"
					/>
				`)

			})

			it('contains all 3 given options in the dropdown', () => {
				const listbox = wrapper.find("div[role=listbox]")
				const divOptions = listbox.findAll('div[role=option]')
	
				expect(divOptions.at(0).text()).toEqual('Item One')
				expect(divOptions.at(1).text()).toEqual('Item Two')
				expect(divOptions.at(2).text()).toEqual('Item Three')
			})

			testBehaviorForSelectingOption(optionsWithCustomLabelAndUniqueIdFields, () => {
				it('emits the full selected item exactly once', async () => {
					const selectSingle = wrapper.findComponent(SelectSingle)
	
					expect(selectSingle.emitted().select.length).toEqual(1)
					expect(selectSingle.emitted().select[0]).toEqual([{ customLabel: 'Item Two', customUniqueId: 'two' }])
				})
	
				it('sets the parent component data property correctly, given v-model usage', async () => {
					expect(wrapper.vm['selectedOption']).toEqual({ customLabel: 'Item Two', customUniqueId: 'two' })
				})
			})
		})
	})
})
