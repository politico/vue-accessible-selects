import { mount, Wrapper } from '@vue/test-utils'

import { SelectOption } from '../src/types'

import SelectMulti from '../src/SelectMulti.vue'
import { 
	simpleOptions,
	optionsWithCustomLabelAndUniqueIdFields
} from './sampleData'

describe('SelectMulti', () => {
	let wrapper: Wrapper<Vue>
	let options: SelectOption[]

	function mountSelectMulti(selectMultiTemplate: string) {
		return mount({
			data() { return { selectedOptions: [], options }},
			template: `<div>${selectMultiTemplate}</div>`,
			components: { SelectMulti },
			methods: {
				setOptions(newOptions) { this['options'] = newOptions }
			}
		})
	}

	function testBehaviorForSelectingMultipleOptions(originalOptions: SelectOption[], testBehaviorForEventEmitsAndVModel?: () => void) {
		describe('when the second option is clicked & then the third option is clicked', () => {
			beforeEach(async () => {
				const listbox = wrapper.find("div[role=listbox]")
				const divOptions = listbox.findAll('div[role=option]')
				
				await divOptions.at(1).trigger('click')
				await divOptions.at(2).trigger('click')
			})

			it('displays the correctly selected pills', async () => {
				const selectedOptionsText = wrapper.find('.selected-options').text()

				expect(selectedOptionsText).toContain('Item Two')
				expect(selectedOptionsText).toContain('Item Three')
			})

			it('marks the options in the dropdown as selected, with the correct class & aria attribute', async () => {
				const listbox = wrapper.find("div[role=listbox]")
				const selectedDivOptions = listbox.findAll('div.option-selected[role=option][aria-selected=true]')

				expect(selectedDivOptions.at(0).text()).toEqual('Item Two')
				expect(selectedDivOptions.at(1).text()).toEqual('Item Three')
			})

			testBehaviorForEventEmitsAndVModel?.()

			describe('(testing finding items by value, rather than reference) ' + 
				'then something occurs in the parent such that the options array is updated to be a new instance (of the same original array)', () => {
				beforeEach(() => {
					wrapper.vm['setOptions'](originalOptions.map(option => ({ ...option })))
				})

				it('continues to display the correctly selected pills', () => {
					const selectedOptionsText = wrapper.find('.selected-options').text()

					expect(selectedOptionsText).toContain('Item Two')
					expect(selectedOptionsText).toContain('Item Three')
				})

				it('still marks the options in the dropdown as selected, with the correct class & aria attribute', () => {
					const listbox = wrapper.find("div[role=listbox]")
					const selectedDivOptions = listbox.findAll('div.option-selected[role=option][aria-selected=true]')

					expect(selectedDivOptions.at(0).text()).toEqual('Item Two')
					expect(selectedDivOptions.at(1).text()).toEqual('Item Three')
				})
			})
		})
	}

	describe('given simple options', () => {
		beforeEach(() => options = simpleOptions )

		describe('and a simple SelectMulti initialized with options, v-model, and a label', () => {
			beforeEach(() => {
				wrapper = mountSelectMulti(`
					<SelectMulti 
						:options="options"
						v-model="selectedOptions"
						label="Sample SelectSingle"
					/>
				`)
			})

			it('contains all 3 given options in the dropdown', () => {
				const listboxText = wrapper.find("div[role=listbox]").text()
	
				expect(listboxText).toContain('Item One')
				expect(listboxText).toContain('Item Two')
				expect(listboxText).toContain('Item Three')
			})
	
			testBehaviorForSelectingMultipleOptions(simpleOptions, () => {
				it('emits the full selected item each time an item is selected, using the `select` event', async () => {
					const selectMulti = wrapper.findComponent(SelectMulti)

					expect(selectMulti.emitted().select.length).toEqual(2)
					expect(selectMulti.emitted().select[0]).toEqual([{ label: 'Item Two', value: 'two' }])
					expect(selectMulti.emitted().select[1]).toEqual([{ label: 'Item Three', value: 'three' }])
				})

				it('emits the current list of all selected options each time the selected options are updated, using the `change` event to work w/ v-model', async () => {
					const selectMulti = wrapper.findComponent(SelectMulti)

					expect(selectMulti.emitted().change.length).toEqual(2)
					expect(selectMulti.emitted().change[0]).toEqual([[{ label: 'Item Two', value: 'two' }]])
					expect(selectMulti.emitted().change[1]).toEqual([[{ label: 'Item Two', value: 'two' },{ label: 'Item Three', value: 'three' }]])
				})

				it('sets the parent component data property correctly, given v-model usage', async () => {
					expect(wrapper.vm['selectedOptions']).toEqual([{ label: 'Item Two', value: 'two' },{ label: 'Item Three', value: 'three' }])
				})
			})
		})
	})

	describe('given options w/ custom label & uniqueId fields', () => {
		beforeEach(() => options = optionsWithCustomLabelAndUniqueIdFields )
		
		describe('with a SelectMulti initialized with labelField & uniqueIdField props', () => {
			beforeEach(() => {
				wrapper = mountSelectMulti(`
					<SelectMulti 
						:options="options"
						v-model="selectedOptions"
						label="Sample SelectSingle"
						labelField="customLabel"
						uniqueIdField="customUniqueId"
					/>
				`)
			})

			it('displays the correct label for each option in the dropdown', () => {
				const listbox = wrapper.find("div[role=listbox]")
				const optionDivs = listbox.findAll("div[role=option]")
	
				expect(optionDivs.at(0).text()).toEqual('Item One')
				expect(optionDivs.at(1).text()).toEqual('Item Two')
				expect(optionDivs.at(2).text()).toEqual('Item Three')
			})

			testBehaviorForSelectingMultipleOptions(optionsWithCustomLabelAndUniqueIdFields, () => {
				it('emits the full selected item each time an item is selected, using the `select` event', async () => {
					const selectMulti = wrapper.findComponent(SelectMulti)

					expect(selectMulti.emitted().select.length).toEqual(2)
					expect(selectMulti.emitted().select[0]).toEqual([{ customLabel: 'Item Two', customUniqueId: 'two' }])
					expect(selectMulti.emitted().select[1]).toEqual([{ customLabel: 'Item Three', customUniqueId: 'three' }])
				})

				it('emits the current list of all selected options each time the selected options are updated, using the `change` event to work w/ v-model', async () => {
					const selectMulti = wrapper.findComponent(SelectMulti)

					expect(selectMulti.emitted().change.length).toEqual(2)
					expect(selectMulti.emitted().change[0]).toEqual([[{ customLabel: 'Item Two', customUniqueId: 'two' }]])
					expect(selectMulti.emitted().change[1]).toEqual([[{ customLabel: 'Item Two', customUniqueId: 'two' },{ customLabel: 'Item Three', customUniqueId: 'three' }]])
				})

				it('sets the parent component data property correctly, given v-model usage', async () => {
					expect(wrapper.vm['selectedOptions']).toEqual([{ customLabel: 'Item Two', customUniqueId: 'two' },{ customLabel: 'Item Three', customUniqueId: 'three' }])
				})
			})
		})
	})
})
