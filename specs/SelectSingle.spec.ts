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
				expect(wrapper.vm['selectedOption']).toEqual({ label: 'Item Two', value: 'two' })
			})
		})
	})

	describe('options', () => {
		describe('prependLabel', () => {
			const options = [
				{ label: 'Item One', value: 'one' },
				{ label: 'Item Two', value: 'two' },
				{ label: 'Item Three', value: 'three' }
			]
			it('prepends the field label to the displayed option when attribute is set to true', async () => {
				const myWrapper = mount({
					data() { 
						return { selectedOption: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model="selectedOption" label="Sample SelectSingle" :prependLabel="true"/>
								</div>`,
					components: { SelectSingle }
				})
				const listbox = myWrapper.find("div[role=listbox]")
				await listbox.trigger('click')
				await listbox.findAll('div[role=option]').at(1).trigger('click')
				expect(myWrapper.find('div[role=combobox]').text()).toContain('Sample SelectSingle: Item Two')
			})
			it('does not prepend the label to items in the list while the dropdown is open', async () => {
				const myWrapper = mount({
					data() { 
						return { selectedOption: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model="selectedOption" label="Sample SelectSingle" :prependLabel="true"/>
								</div>`,
					components: { SelectSingle }
				})
				const listbox = myWrapper.find("div[role=listbox]")
				const firstOption = listbox.findAll('div[role=option]').at(1);
				expect(firstOption.text()).toContain('Item Two')
			})
			it('does not prepend the field label to the placeholder text', async () => {
				const myWrapper = mount({
					data() { 
						return { selectedOption: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model="selectedOption" label="Sample SelectSingle" 
										:prependLabel="true" placeholder="Select an option"/>
								</div>`,
					components: { SelectSingle }
				})
				const placeholder = myWrapper.find(".combo-placeholder")
				expect(placeholder.text()).toContain('Select an option')
			})
			it('does not prepend the field label when attribute is not set', async () => {
				const myWrapper = mount({
					data() { 
						return { selectedOption: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model="selectedOption" label="Sample SelectSingle"/>
								</div>`,
					components: { SelectSingle }
				})
				const listbox = myWrapper.find("div[role=listbox]")
				await listbox.trigger('click')
				await listbox.findAll('div[role=option]').at(1).trigger('click')
				expect(myWrapper.find('div[role=combobox]').text()).toContain('Item Two')
			})
		})
	})
})