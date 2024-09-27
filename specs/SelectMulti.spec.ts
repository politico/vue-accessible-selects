import { mount, Wrapper } from '@vue/test-utils'

import SelectMulti from '../src/SelectMulti.vue'

const options = [
	{ label: 'Item One', value: 'one' },
	{ label: 'Item Two', value: 'two' },
	{ label: 'Item Three', value: 'three' }
]

describe('SelectMulti', () => {
	let wrapper: Wrapper<Vue>

	describe('given simple options', () => {
		beforeEach(() => {
			// TODO: Share sample data between spec files & Storybook stories


			wrapper = mount({
				data() { 
					return { selectedOptions: [], options }},
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
		describe('label functionality', () => {
			it('adds the aria-labelledby attribute to the listbox', () => {
				wrapper = mount({
					data() { 
						return { selectedOptions: [], options }},
					template: '<div><SelectMulti :options="options" v-model="selectedOptions" label="Sample SelectMulti" /></div>',
					components: { SelectMulti }
				})
				const selectMulti = wrapper.findComponent(SelectMulti)
				const input = selectMulti.find('input')
				expect(Object.keys(input.attributes())).toContain('aria-labelledby')
			})
		})

		describe('iconIsClickable works', () => {
			it('when iconIsClickable false its not clickable and wrapper is a div', () => {
				
				wrapper = mount({
					data() { 
						return { selectedOptions: [], options }},
					template: '<div><SelectMulti :options="options" v-model="selectedOptions" label="Sample SelectMulti" /></div>',
					components: { SelectMulti }
				})

				const selectMulti = wrapper.findComponent(SelectMulti)

				const inputIconBlock = selectMulti.find('.combo-input-icon-block')

				expect(inputIconBlock.element.tagName === 'DIV').toBeTruthy()
				expect(inputIconBlock.classes('not-clickable')).toBe(true)
			})

			it('when iconIsClickable true its clickable and wrapper is a button', () => {
				
				wrapper = mount({
					data() { 
						return { selectedOptions: [], options }},
					template: '<div><SelectMulti :options="options" v-model="selectedOptions" :iconIsClickable="true" label="Sample SelectMulti" /></div>',
					components: { SelectMulti }
				})

				const selectMulti = wrapper.findComponent(SelectMulti)

				const inputIconBlock = selectMulti.find('.combo-input-icon-block')

				expect(inputIconBlock.element.tagName === 'BUTTON').toBeTruthy()
				expect(inputIconBlock.classes('not-clickable')).toBe(false)
			})
		})
	})
})
