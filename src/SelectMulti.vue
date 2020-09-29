<script lang="ts">
	// Original reference: https://github.com/microsoft/sonder-ui/tree/master/src/components/multiselect

	import Vue, { VueConstructor } from 'vue'

	import { SelectOption } from './types'
	import {
		getActionFromKey,
		getUpdatedIndex,
		filterOptions,
		isScrollable,
		maintainScrollVisibility,
		MenuActions,
		uniqueId
	} from './shared'

	interface ComponentData {
		activeIndex: number
		callFocus: boolean
		htmlId: string
		ignoreBlur: boolean
		open: boolean
		inputValue: string
	}

	interface ISelectMulti extends Vue {
		$refs: {
			inputRef: HTMLInputElement
			listboxRef: HTMLElement
			activeOptionRef: HTMLElement
		}
	}

	// `PURE` designation to enable tree-shaking
	export default /*#__PURE__*/(Vue as VueConstructor<ISelectMulti>).extend({
		name: 'SelectMulti',
		model: {
			prop: 'values',
			event: 'change'
		},
		props: {
			label: {
				type: String,
				required: true
			},
			options: {
				type: Array as () => SelectOption[],
				required: true
			},
			labelIsVisible: {
				type: Boolean,
				required: false,
				default: true
			},
			placeholder: {
				type: String,
				required: false,
				default: () => null
			},
			displayPillsBelowInput: {
				type: Boolean,
				default: false
			},
			// No need to set via a prop; can just use v-model
			values: {
				type: Array as () => SelectOption[],
				required: false,
				default: () => []
			}
		},
		data() {
			return {
				activeIndex: 0,
				callFocus: false,
				htmlId: uniqueId(),
				ignoreBlur: false,
				open: false,
				inputValue: ''
			} as ComponentData
		},
		computed: {
			activeId(): string {
				return this.open ? `${this.htmlId}-${this.activeIndex}` : ''
			},
			filteredOptions(): SelectOption[] {
				return filterOptions(this.options, this.inputValue)
			},
			selectedOptions: {
				get(): SelectOption[] {
					return this.values
				},
				set(values: SelectOption[]) {
					this.$emit('change', values)
				}
			}
		},
		updated() {
			if (this.callFocus === true) {
				this.$refs.inputRef.focus()
				this.callFocus = false
			}

			if (this.open && isScrollable(this.$refs.listboxRef)) {
				maintainScrollVisibility(this.$refs.activeOptionRef[0], this.$refs.listboxRef)
			}
		},
		methods: {
			onInput() {
				const curValue = this.$refs.inputRef.value

				if (this.inputValue !== curValue) {
					this.inputValue = curValue
					this.activeIndex = 0
					this.$emit('searchChange', this.inputValue)
				}

				const menuState = this.filteredOptions.length > 0
				if (this.open !== menuState) {
					this.updateMenuState(menuState, false)
				}
			},

			onInputKeyDown(event: KeyboardEvent) {
				const max = this.filteredOptions.length - 1

				const action = getActionFromKey(event, this.open)

				switch (action) {
					case MenuActions.Next:
					case MenuActions.Last:
					case MenuActions.First:
					case MenuActions.Previous:
						event.preventDefault()
						return this.onOptionChange(getUpdatedIndex(this.activeIndex, max, action))
					case MenuActions.CloseSelect:
						event.preventDefault()
						return this.updateOption(this.activeIndex)
					case MenuActions.Close:
						event.preventDefault()
						return this.updateMenuState(false)
					case MenuActions.Open:
						return this.updateMenuState(true)
				}
			},

			onInputBlur() {
				if (this.ignoreBlur) {
					this.ignoreBlur = false
					return
				}

				this.updateMenuState(false, false)
			},

			onOptionChange(index: number) {
				this.activeIndex = index
			},

			onOptionClick(index: number) {
				this.onOptionChange(index)
				this.updateOption(index)
			},

			onOptionMouseDown() {
				this.ignoreBlur = true
				this.callFocus = true
			},

			removeOption(index: number) {
				this.$emit('remove', this.selectedOptions[index])
				this.selectedOptions = [...this.selectedOptions.filter((_, i) => i !== index)]
			},

			selectOption(option: SelectOption) {
				this.$emit('select', option)
				this.selectedOptions = [...this.selectedOptions, option]
			},

			updateOption(index: number) {
				const option = this.filteredOptions[index]
				const optionIndex = this.selectedOptions.indexOf(option)
				const isSelected = optionIndex > -1

				if (isSelected) {
					this.removeOption(optionIndex)
					this.inputValue = ''
				} else {
					this.selectOption(option)
					this.inputValue = ''
					this.activeIndex = this.filteredOptions.indexOf(option)
				}
			},

			updateMenuState(open: boolean, callFocus = true) {
				this.open = open
				this.callFocus = callFocus
			}
		}
	})
</script>

<template>
	<div class="vue-accessible-select-multi" :class="{ open }">
		<label :id="htmlId" class="combo-label" :class="{ 'sr-only': !labelIsVisible }">
			{{ label }}
		</label>
		<ul :id="`${htmlId}-selected`" class="selected-options" :class="{ 'below-input': displayPillsBelowInput }">
			<span :id="`${htmlId}-selected-option-pills`" style="display: none;">remove</span>
			<li v-for="(option, index) in selectedOptions" :key="option.value">
				<button
					class="selected-option-pill"
					type="button"
					:aria-describedby="`${htmlId}-selected-option-pills`"
					@click="removeOption(index)"
				>
					{{ option.label }}
				</button>
			</li>
		</ul>
		<div class="combo-wrapper">
			<input
				ref="inputRef"
				:aria-activedescendant="activeId"
				aria-autocomplete="list"
				:aria-controls="`${htmlId}-listbox`"
				:aria-expanded="`${open}`"
				aria-haspopup="listbox"
				:aria-labelledby="`${htmlId} ${htmlId}-selected`"
				class="combo-input"
				role="combobox"
				type="text"
				:value="inputValue"
				:placeholder="placeholder"
				@blur="onInputBlur"
				@click="updateMenuState(true)"
				@input="onInput"
				@keydown="onInputKeyDown"
			/>

			<div
				:id="`${htmlId}-listbox`"
				ref="listboxRef"
				class="combo-menu"
				role="listbox"
				aria-multiselectable="true"
			>
				<div
					v-for="(option, index) in filteredOptions"
					:id="`${htmlId}-${index}`"
					:key="option.value"
					:ref="activeIndex === index ? 'activeOptionRef' : null"
					:class="{
						'option-current': activeIndex === index,
						'option-selected': selectedOptions.indexOf(option) > -1,
						'combo-option': true
					}"
					:aria-selected="selectedOptions.indexOf(option) > -1 ? 'true' : false"
					role="option"
					@click="onOptionClick(index)"
					@mousedown="onOptionMouseDown"
				>
					{{ option.label }}
				</div>
			</div>
		</div>
	</div>
</template>
