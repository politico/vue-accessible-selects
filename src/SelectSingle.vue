<script lang="ts">
	// Original reference: https://github.com/microsoft/sonder-ui/tree/master/src/components/select

	import Vue, { PropType, VueConstructor } from 'vue'

	import { SelectOption } from './types'
	import { getActionFromKey, getIndexByLetter, MenuActions, uniqueId } from './shared'

	interface ComponentData {
		activeIndex: number
		htmlId: string
		ignoreBlur: boolean
		inputValue: string
		open: boolean
		searchString: string
		searchTimeout: number | null
	}

	interface ISelectSingle extends Vue {
		$refs: {
			comboEl: HTMLElement
		}
	}

	/**
	 * Component to select a single option from a dropdown, developed with accessibility & usability as the primary focus
	 */
	// `PURE` designation to enable tree-shaking
	export default /*#__PURE__*/(Vue as VueConstructor<ISelectSingle>).extend({
		name: 'SelectSingle',
		model: {
			prop: 'value',
			event: 'select'
		},
		props: {
			disabled: {
				type: Boolean,
				default: false
			},
			label: {
				type: String,
				required: true
			},
			labelIsVisible: {
				type: Boolean,
				default: true
			},
			loading: {
				type: Boolean,
				default: false
			},
			options: {
				required: true,
				type: Array as PropType<SelectOption[]>
			},
			/** Generally, there's no need to set this via a prop - it will be set automatically when using v-model */
			value: {
				default: null,
				required: false,
				type: Object as PropType<SelectOption>
			}
			// Potential props:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
			// size
			// autofocus
			// required
		},
		data(): ComponentData {
			const activeIndex = this.value
				? this.options.findIndex(currentOption => currentOption.value == this.value.value)
				: 0
			return {
				activeIndex,
				htmlId: uniqueId(),
				ignoreBlur: false,
				open: false,
				searchString: '',
				searchTimeout: null,
				inputValue: ''
			}
		},
		computed: {
			activeDescendant(): string {
				return `${this.htmlId}-item-${this.activeIndex}`
			},
			isDisabledOrLoading(): boolean {
				return this.disabled || this.loading
			},
			selectedIndex(): number {
				return this.value
				? this.options.findIndex(currentOption => currentOption.value == this.value.value)
				: 0
			}
		},
		watch: {
			selectedIndex(newValue: number) {
				this.activeIndex = newValue
			}
		},
		methods: {
			getIndexByLetter,
			getSearchString(char: string) {
				const multimatchTimeout = 500

				// reset typing timeout and start new timeout
				// this allows us to make multiple-letter matches, like a native select
				if (typeof this.searchTimeout === 'number') {
					window.clearTimeout(this.searchTimeout)
				}

				this.searchTimeout = window.setTimeout(() => {
					this.searchString = ''
				}, multimatchTimeout)

				// add most recent letter to saved search string
				this.searchString += char
				return this.searchString
			},
			getUpdatedIndex(current: number, max: number, action: MenuActions) {
				switch (action) {
					case MenuActions.First:
						return 0
					case MenuActions.Last:
						return max
					case MenuActions.Previous:
						return Math.max(0, current - 1)
					case MenuActions.Next:
						return Math.min(max, current + 1)
					default:
						return current
				}
			},
			handleBlur() {
				if (this.ignoreBlur) {
					this.ignoreBlur = false
					return
				}

				if (this.open) {
					this.open = false
					// this.updateMenuState(false, false);
				}
			},
			handleClick() {
				this.open = !this.open
			},
			updateMenuState(open: boolean, callFocus = true) {
				this.open = open
				callFocus && this.$refs.comboEl.focus()
			},
			handleKeydown(event: KeyboardEvent) {
				const { key } = event
				const max = this.options.length - 1

				const action = getActionFromKey(event, this.open)

				switch (action) {
					case MenuActions.Next:
					case MenuActions.Last:
					case MenuActions.First:
					case MenuActions.Previous:
						event.preventDefault()
						return this.onOptionChange(
							this.getUpdatedIndex(this.activeIndex, max, action)
						)
					case MenuActions.CloseSelect:
					case MenuActions.Space:
						event.preventDefault()
						this.selectOption(this.activeIndex)
						this.updateMenuState(false, false)
						break
					case MenuActions.Close:
						this.activeIndex = this.selectedIndex
						this.updateMenuState(false, false)
						break
					case MenuActions.Type: {
						this.updateMenuState(true)
						const searchString = this.getSearchString(key)
						return this.onOptionChange(
							Math.max(0, this.getIndexByLetter(this.options, searchString))
						)
					}
					case MenuActions.Open:
						event.preventDefault()
						return this.updateMenuState(true)
				}
			},
			handleOptionClick(event: MouseEvent, index: number) {
				this.selectOption(index)
				this.updateMenuState(false)
			},
			onOptionMouseDown(event: MouseEvent) {
				this.ignoreBlur = true
				event.stopPropagation()
			},
			onMenuMouseDown(event: MouseEvent) {
				event.preventDefault()
			},
			onOptionChange(index: number) {
				this.activeIndex = index
			},
			selectOption(index: number) {
				const selected = this.options[index]
				this.inputValue = selected.label
				/**
				 * emit the most recently selected value,
				 * *generally not necessary*, if state can be handled w/ v-model alone
				 */
				this.$emit('select', selected)
			}
		}
	})
</script>
<template>
	<div class="vue-accessible-select-single" :class="{ disabled: isDisabledOrLoading, open }">
		<label
			:id="`${htmlId}-label`"
			class="combo-label"
			:class="{ 'sr-only': !labelIsVisible }"
		>
			{{ label }}
			<span class="sr-only"> {{ value.label }}</span>
		</label>
		<!-- aria-expanded is `open ? 'true' : 'false'` rather than `open` because the latter results in no attribute -->
		<div
			:id="htmlId"
			ref="comboEl"
			:aria-activedescendant="activeDescendant"
			aria-autocomplete="none"
			:aria-controls="`${htmlId}-listbox`"
			:aria-disabled="isDisabledOrLoading"
			:aria-expanded="open ? 'true' : 'false'"
			aria-haspopup="listbox"
			:aria-labelledby="`${htmlId}-label`"
			class="combo-input"
			role="combobox"
			tabindex="0"
			@blur="handleBlur"
			v-on="isDisabledOrLoading ? {} : { mousedown: handleClick, keydown: handleKeydown }"
		>
			<span :id="`${htmlId}-value`" ref="valueEl">
				<!-- @slot Display the loading state via custom template code-->
				<slot v-if="loading" name="loadingState">
					Loading...
				</slot>
				<!-- @slot Display the currently selected option via custom template code -->
				<slot v-else name="selectedOption" :option="value">
					{{ value.label }}
				</slot>
			</span>
		</div>
		<!-- tabindex -->
		<div
			:id="`${htmlId}-listbox`"
			ref="listboxEl"
			class="combo-menu"
			role="listbox"
			@mousedown="onMenuMouseDown"
		>
			<div
				v-for="(option, index) in options"
				:id="`${htmlId}-item-${index}`"
				:key="option.value.toString()"
				class="combo-option"
				:class="{
					'option-selected': selectedIndex == index,
					'option-current': index == activeIndex
				}"
				role="option"
				:aria-selected="index == selectedIndex ? 'true' : 'false'"
				@click="handleOptionClick($event, index)"
				@mousedown="onOptionMouseDown"
			>
				<!-- @slot Display individual options via custom template code -->
				<slot name="option" :option="option">
					{{ option.label }}
				</slot>
			</div>
		</div>
	</div>
</template>
