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

	describe('given simple options', () => {
		beforeEach(() => options = simpleOptions )

		describe('and a simple SelectMulti initialized with options, v-model, and a label', () => {
			beforeEach(() => {
				wrapper = mount({
					data() { return { selectedOptions: [], options }},
					template: '<div><SelectMulti :options="options" v-model="selectedOptions" label="Sample SelectMulti" /></div>',
					components: { SelectMulti }
				})
			})

			it('contains all 3 given options in the dropdown', () => {
				const listboxText = wrapper.find("div[role=listbox]").text()
	
				expect(listboxText).toContain('Item One')
				expect(listboxText).toContain('Item Two')
				expect(listboxText).toContain('Item Three')
			})
	
			describe('when the second option is clicked & then the third option is clicked', () => {
				beforeEach(async () => {
					const listbox = wrapper.find("div[role=listbox]")
					await listbox.findAll('div[role=option]').at(1).trigger('click')
					await listbox.findAll('div[role=option]').at(2).trigger('click')
				})
	
				it('adds those options to the list of selected options', async () => {
					const selectedOptionsText = wrapper.find('.selected-options').text()
					expect(selectedOptionsText).toContain('Item Two')
					expect(selectedOptionsText).toContain('Item Three')
				})
	
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
				wrapper = mount({
					data() { return { selectedOptions: [], options }},
					template: `
						<div>
							<SelectMulti 
								:options="options"
								v-model="selectedOptions"
								label="Sample SelectSingle"
								labelField="customLabel"
								uniqueIdField="customUniqueId"
							/>
						</div>
					`,
					components: { SelectMulti }
				})
			})

			it('displays the correct label for each option in the dropdown', () => {
				const listbox = wrapper.find("div[role=listbox]")
				const optionDivs = listbox.findAll("div[role=option]")
	
				expect(optionDivs.at(0).text()).toEqual('Item One')
				expect(optionDivs.at(1).text()).toEqual('Item Two')
				expect(optionDivs.at(2).text()).toEqual('Item Three')
			})

			describe('when the second option is clicked & then the third option is clicked', () => {
				beforeEach(async () => {
					const listbox = wrapper.find("div[role=listbox]")
					await listbox.findAll('div[role=option]').at(1).trigger('click')
					await listbox.findAll('div[role=option]').at(2).trigger('click')
				})

				it('adds those options to the list of selected options', async () => {
					const selectedOptionsText = wrapper.find('.selected-options').text()
					expect(selectedOptionsText).toContain('Item Two')
					expect(selectedOptionsText).toContain('Item Three')
				})
	
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
