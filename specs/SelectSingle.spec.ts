import { mount, Wrapper } from '@vue/test-utils'

import SelectSingle from '../src/SelectSingle.vue'

describe('SelectSingle', () => {
	let wrapper: Wrapper<Vue>

	describe('given simple options', () => {
		beforeEach(() => {
			// TODO: Share sample data between spec files & Storybook stories
			const options = [
				{ label: 'Item One', value: 'one' },
				{ label: 'Item Two', value: 'two' },
				{ label: 'Item Three', value: 'three' }
			]

			wrapper = mount({
				data() { 
					return { selectedOption: {}, options }},
				template: '<div><SelectSingle :options="options" v-model="selectedOption" label="Sample SelectSingle" /></div>',
				components: { SelectSingle }
			})
		})

		it('contains all 3 given options in the dropdown', () => {
			const listboxText = wrapper.find("div[role=listbox]").text()

			expect(listboxText).toContain('Item One')
			expect(listboxText).toContain('Item Two')
			expect(listboxText).toContain('Item Three')
		})

		describe('when the second option is clicked', () => {
			beforeEach(async () => {
				const listbox = wrapper.find("div[role=listbox]")
				await listbox.findAll('div[role=option]').at(1).trigger('click')
			})

			it('sets the new displayed value of the select appropriately', async () => {
				expect(wrapper.find('div[role=combobox]').text()).toContain('Item Two')
			})

			it('emits the full selected item exactly once', async () => {
				const selectSingle = wrapper.findComponent(SelectSingle)

				expect(selectSingle.emitted().select.length).toEqual(1)
				expect(selectSingle.emitted().select[0]).toEqual([{ label: 'Item Two', value: 'two' }])
			})

			it('sets the parent component data property correctly, given v-model usage', async () => {
				expect(wrapper.vm['selectedOption']).toEqual({ label: 'Force Spec Failure to verify on GH', value: 'two' })
			})
		})
	})
})
