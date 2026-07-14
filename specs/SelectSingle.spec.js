import { mount } from '@vue/test-utils'

import SelectSingle from '../src/SelectSingle.vue'

describe('SelectSingle', () => {
	let wrapper

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
					return { value: {}, options }},
				template: '<div><SelectSingle :options="options" v-model:value="value" label="Sample SelectSingle" /></div>',
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

				expect(selectSingle.emitted()['update:value'].length).toEqual(1)
				expect(selectSingle.emitted()['update:value'][0]).toEqual([{ label: 'Item Two', value: 'two' }])
			})

			it('sets the parent component data property correctly, given v-model usage', async () => {
				expect(wrapper.vm['value']).toEqual({ label: 'Item Two', value: 'two' })
			})
		})
	})

	describe('given a panelOption', () => {
		beforeEach(() => {
			const options = [
				{ label: 'Item One', value: 'one' },
				{ label: 'Item Two', value: 'two' }
			]

			wrapper = mount({
				data() {
					return {
						value: {},
						options,
						panelApplied: false,
						panelOption: { label: 'Custom range', value: 'custom-range' }
					}
				},
				template: `<div>
					<SelectSingle
						:options="options"
						v-model:value="value"
						label="Sample SelectSingle"
						:panelOption="panelOption"
						:panelOptionSelected="panelApplied"
					>
						<template #panelOption="{ option }">
							<span class="test-panel-option">{{ option.label }} row</span>
						</template>
						<template #panel="{ closeMenu, showOptions }">
							<div class="test-panel">
								<button class="test-panel-back" @click="showOptions">Back</button>
								<button class="test-panel-apply" @click="panelApplied = true; closeMenu()">Apply</button>
							</div>
						</template>
					</SelectSingle>
				</div>`,
				components: { SelectSingle }
			})
		})

		const openDropdown = async () => {
			await wrapper.find('div[role=combobox]').trigger('mousedown')
		}

		it('appends the panel option row after the regular options', () => {
			const optionElements = wrapper.findAll('div[role=option]')

			expect(optionElements.length).toEqual(3)
			expect(optionElements.at(2).text()).toContain('Custom range row')
			expect(optionElements.at(2).classes()).toContain('combo-option-panel')
		})

		describe('when the panel option is clicked', () => {
			beforeEach(async () => {
				await openDropdown()
				await wrapper.find('.combo-option-panel').trigger('click')
			})

			it('shows the panel slot content in place of the options without closing the dropdown', () => {
				expect(wrapper.find('.test-panel').exists()).toBe(true)
				expect(wrapper.findAll('div[role=option]').length).toEqual(0)
				expect(wrapper.findComponent(SelectSingle).classes()).toContain('open')
			})

			it('emits panelOpened and does not emit update:value', () => {
				const selectSingle = wrapper.findComponent(SelectSingle)

				expect(selectSingle.emitted()['panelOpened'].length).toEqual(1)
				expect(selectSingle.emitted()['update:value']).toBeUndefined()
			})

			it('does not reference a non-rendered option via aria-activedescendant', () => {
				const combobox = wrapper.find('div[role=combobox]')

				expect(combobox.attributes('aria-activedescendant')).toEqual('')
			})

			it('does not close when the combobox loses focus to the panel content', async () => {
				await wrapper.find('div[role=combobox]').trigger('blur')

				expect(wrapper.find('.test-panel').exists()).toBe(true)
				expect(wrapper.findComponent(SelectSingle).classes()).toContain('open')
			})

			it('returns to the option list via the showOptions slot prop', async () => {
				await wrapper.find('.test-panel-back').trigger('click')

				expect(wrapper.find('.test-panel').exists()).toBe(false)
				expect(wrapper.findAll('div[role=option]').length).toEqual(3)
				expect(wrapper.findComponent(SelectSingle).classes()).toContain('open')
			})

			it('closes the dropdown via the closeMenu slot prop and emits panelClosed', async () => {
				await wrapper.find('.test-panel-apply').trigger('click')

				const selectSingle = wrapper.findComponent(SelectSingle)
				expect(selectSingle.classes()).not.toContain('open')
				expect(selectSingle.emitted()['panelClosed'].length).toEqual(1)
			})

			it('closes the dropdown on an outside mousedown', async () => {
				document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
				await wrapper.vm.$nextTick()

				expect(wrapper.findComponent(SelectSingle).classes()).not.toContain('open')
				expect(wrapper.find('.test-panel').exists()).toBe(false)
			})
		})

		it('marks the panel option row as selected via panelOptionSelected', async () => {
			await openDropdown()
			await wrapper.find('.combo-option-panel').trigger('click')
			await wrapper.find('.test-panel-apply').trigger('click')
			await openDropdown()

			const panelRow = wrapper.find('.combo-option-panel')
			expect(panelRow.classes()).toContain('option-selected')
			expect(panelRow.attributes('aria-selected')).toEqual('true')
		})

		it('opens the panel with the keyboard (End then Enter)', async () => {
			const combobox = wrapper.find('div[role=combobox]')

			await combobox.trigger('keydown', { key: 'Enter' }) // open dropdown
			await combobox.trigger('keydown', { key: 'End' }) // move to the panel row
			await combobox.trigger('keydown', { key: 'Enter' }) // activate it

			expect(wrapper.find('.test-panel').exists()).toBe(true)
			expect(wrapper.findComponent(SelectSingle).classes()).toContain('open')
		})

		it('regular option selection still works alongside the panel option', async () => {
			await openDropdown()
			await wrapper.findAll('div[role=option]').at(1).trigger('click')

			expect(wrapper.vm['value']).toEqual({ label: 'Item Two', value: 'two' })
			expect(wrapper.findComponent(SelectSingle).classes()).not.toContain('open')
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
						return { value: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model:value="value" label="Sample SelectSingle" :prependLabel="true"/>
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
						return { value: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model:value="value" label="Sample SelectSingle" :prependLabel="true"/>
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
						return { value: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model:value="value" label="Sample SelectSingle" 
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
						return { value: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model:value="value" label="Sample SelectSingle"/>
								</div>`,
					components: { SelectSingle }
				})
				const listbox = myWrapper.find("div[role=listbox]")
				await listbox.trigger('click')
				await listbox.findAll('div[role=option]').at(1).trigger('click')
				expect(myWrapper.find('div[role=combobox]').text()).toContain('Item Two')
			})
			it("doesn't have tabindex when hasFocusWhenDisabled=false and is disabled", async () => {
				const myWrapper = mount({
					data() { 
						return { value: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model:value="value" label="Sample SelectSingle" 
										 placeholder="Select an option" :hasFocusWhenDisabled="false" :disabled="true"/>
								</div>`,
					components: { SelectSingle }
				})

				expect(myWrapper.find(".combo-input[tabindex='0']").exists()).toBe(false)
			})

			it("has tabindex when hasFocusWhenDisabled=true and isn't disabled", async () => {
				const myWrapper = mount({
					data() { 
						return { value: {}, options }},
					template: `<div>
									<SelectSingle :options="options" v-model:value="value" label="Sample SelectSingle" 
										 placeholder="Select an option"/>
								</div>`,
					components: { SelectSingle }
				})

				expect(myWrapper.find(".combo-input[tabindex='0']").exists()).toBe(true)
			})
		})
	})

	describe('given a null value', () => {
		beforeEach(() => {
			const options = [
				{ label: 'Item One', value: 'one' },
				{ label: 'Item Two', value: 'two' }
			]

			wrapper = mount({
				data() {
					return { value: null, options }
				},
				template:
					'<div><SelectSingle :options="options" :value="value" label="Sample SelectSingle" /></div>',
				components: { SelectSingle }
			})
		})

		it('opens without error when value is null', async () => {
			await wrapper.find('div[role=combobox]').trigger('mousedown')
			expect(wrapper.find('div[role=listbox]').exists()).toBe(true)
		})
	})
})