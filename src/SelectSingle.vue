<script lang="ts">
	// Original reference: https://github.com/microsoft/sonder-ui/tree/master/src/components/select

	import { PropType, defineComponent, nextTick } from 'vue'

	import type { SelectOption } from './types'
	import {
		ensureElementInViewport,
		getActionFromKey,
		getIndexByLetter,
		isScrollable,
		maintainScrollVisibility,
		MenuActions,
		uniqueId
	} from './shared'

	export interface ComponentData {
		activeIndex: number
		htmlId: string
		ignoreBlur: boolean
		inputValue: string
		open: boolean
		searchString: string
		searchTimeout: number | null
		showPanel: boolean
	}

	export interface ISelectSingle {
		$refs?: {
			comboEl: HTMLElement
		}
	}

	/**
	 * Component to select a single option from a dropdown, developed with accessibility & usability as the primary focus
	 */
	// `PURE` designation to enable tree-shaking
	export default /*#__PURE__*/defineComponent({
		name: 'SelectSingle',
		extends: defineComponent<ISelectSingle>({}),
		model: {
			prop: 'value',
			event: 'select'
		},
		props: {
			ariaLabel: {
				type: String,
				default: ''
			},
			disabled: {
				type: Boolean,
				default: false
			},
			label: {
				type: String,
				required: true
			},
			/**
			 * Field name in the `options` array that should be used for displaying the label
			 * Values in this field do not need to be unique - they are used for display only
			 */
			labelField: {
				type: String,
				required: false,
				default: 'label'
			},
			labelIsVisible: {
				type: Boolean,
				default: true
			},
			/**
			 * Prepends the field label to the displayed option
			 */
			prependLabel: {
				type: Boolean,
				default: false
			},
			loading: {
				type: Boolean,
				default: false
			},
			options: {
				required: true,
				type: Array as PropType<SelectOption[]>
			},
			hasFocusWhenDisabled: {
				type: Boolean,
				default: true
			},
			/**
			 * When provided, an extra option row is appended after `options`.
			 * Activating it opens the `panel` slot content inside the dropdown
			 * (instead of selecting a value and closing), e.g. a date-range picker.
			 * Row content can be customized via the `panelOption` slot.
			 */
			panelOption: {
				type: Object as PropType<SelectOption | null>,
				required: false,
				default: null
			},
			/**
			 * Marks the panel option row as the current selection (e.g. when a
			 * custom range applied from the panel is the active filter)
			 */
			panelOptionSelected: {
				type: Boolean,
				default: false
			},
			placeholder: {
				type: String,
				default: ''
			},
			/** Generally, there's no need to set this via a prop - it will be set automatically when using v-model */
			value: {
				default: null,
				required: false,
				type: Object as PropType<SelectOption>
			},
		  	/**
			 * Field name in the `options` array that should be used as the **unique** identifier for each option
			 * Required in order to disambiguate between options, when indicating which options are selected, for example
			 *
			 * @example
			 * ```
			 * options = [{ label: 'One', id: 1 },{ label: 'Two', id: 2 }]
			 * ```
			 * ```
			 * <SelectSingle :options="options" uniqueIdField="id" />
			 * ```
			 */
			uniqueIdField: {
				type: String,
				required: false,
				default: 'value'
			}
			// Potential props:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
			// size
			// autofocus
			// required
		},
		data(): ComponentData {
			const activeIndex = this.value
				? this.options?.findIndex(currentOption => currentOption[this.uniqueIdField as keyof SelectOption] == this.value[this.uniqueIdField as keyof SelectOption])
				: 0

			return {
				activeIndex,
				htmlId: uniqueId(),
				ignoreBlur: false,
				open: false,
				searchString: '',
				searchTimeout: null,
				inputValue: '',
				showPanel: false
			}
		},
		computed: {
			activeDescendant(): string {
				// while the panel is shown, the option elements are not rendered,
				// so the combobox must not reference a non-existent option id
				if (this.showPanel) return ''

				return this.open && this.activeIndex >= 0 ? `${this.htmlId}-item-${this.activeIndex}` : ''
			},
			hasPanelOption(): boolean {
				return !!this.panelOption
			},
			isCurrentOptionDisabled(): boolean {
				return this.options?.[this.activeIndex]?.disabled || false
			},
			/** Index of the appended panel option row, one past the last regular option */
			panelOptionIndex(): number {
				return this.options?.length ?? 0
			},
			isDisabledOrLoading(): boolean {
				return this.disabled || this.loading
			},
			isPlaceholderShown(): boolean {
				return !!this.placeholder && !this.value?.value
			},
			selectedIndex(): number {
				return this.value
				? this.options?.findIndex(currentOption => currentOption.value == this.value.value)
				: 0
			}
		},
		watch: {
			selectedIndex(newValue: number) {
				this.activeIndex = newValue
			}
		},
		mounted() {
			// no-ops unless the panel is currently shown (see handleOutsideMousedown);
			// registered unconditionally so a panelOption set after mount still works
			document.addEventListener('mousedown', this.handleOutsideMousedown)
		},
		beforeUnmount() {
			document.removeEventListener('mousedown', this.handleOutsideMousedown)
		},
		updated() {
			if (this.open && this.$refs?.activeOptionRef?.[0 as keyof {}] && isScrollable(this.$refs.listboxEl as HTMLElement)) {
				maintainScrollVisibility(this.$refs.activeOptionRef[0 as keyof {}], this.$refs.listboxEl as HTMLElement)
			}
		},
		methods: {
			ariaLabelValue(value: SelectOption | null, labelField: keyof SelectOption) {
				if (this.ariaLabel.length > 0) {
					return this.ariaLabel || undefined
				}

				if (!value) {
					return undefined
				}

				return (
					value.screenReaderLabel ||
					(value[labelField as keyof SelectOption] as string) ||
					undefined
				)
			},
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

				// while the panel is shown, focus legitimately moves into the panel
				// content; closing is handled by handleOutsideMousedown instead
				if (this.showPanel) return

				if (this.open) {
					this.open = false
					// this.updateMenuState(false, false);
				}
			},
			handleClick() {
				this.open = !this.open
				if (!this.open) this.setPanelShown(false)
			},
			handleOutsideMousedown(event: MouseEvent) {
				if (!this.open || !this.showPanel) return
				if ((this.$el as HTMLElement).contains(event.target as Node)) return

				this.open = false
				this.setPanelShown(false)
			},
			updateMenuState(open: boolean, callFocus = true) {
				this.open = open
				if (!open) this.setPanelShown(false)
				callFocus && (this.$refs.comboEl as any).focus()
			},
			handleKeydown(event: KeyboardEvent) {
				const { key } = event
				const optionsCount = this.options?.length ?? 0
				const max = this.hasPanelOption ? optionsCount : optionsCount - 1

				const action = getActionFromKey(event, this.open, this.isCurrentOptionDisabled)

				// while the panel is shown the option list is not rendered, so only
				// closing the dropdown (Escape) is meaningful on the combobox itself
				if (this.showPanel && action !== MenuActions.Close) return

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
						if (this.hasPanelOption && this.activeIndex === this.panelOptionIndex) {
							return this.openPanel()
						}
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
							Math.max(0, getIndexByLetter(this.options, searchString, this.labelField))
						)
					}
					case MenuActions.Open:
						event.preventDefault()
						return this.updateMenuState(true)
				}
			},
			handleOptionClick(index: number) {
				this.selectOption(index)
				this.updateMenuState(false)
			},
			onOptionMouseDown(event: MouseEvent) {
				this.ignoreBlur = true
				event.stopPropagation()
			},
			onMenuMouseDown(event: MouseEvent) {
				// while the panel is shown its content (inputs, buttons) needs real
				// focus, so don't steal the mousedown like the option list does
				if (this.showPanel) return

				event.preventDefault()
			},
			onOptionChange(index: number) {
				this.activeIndex = index

				nextTick(() => {
					const elem = document.getElementById(`${this.htmlId}-item-${this.activeIndex}`)

					if (elem) {
						ensureElementInViewport(elem)
					}
				})
			},
			selectOption(index: number) {
				const selected = this.options?.[index]
				if (!selected) return

				this.inputValue = selected[this.labelField as keyof SelectOption] as string
				/**
				 * emit the most recently selected value,
				 * *generally not necessary*, if state can be handled w/ v-model alone
				 */
				this.$emit('update:value', selected)
			},
			/** Close the whole dropdown from inside the panel (`closeMenu` slot prop) */
			closeMenuFromPanel() {
				this.updateMenuState(false)
			},
			openPanel() {
				this.setPanelShown(true)
				this.activeIndex = this.panelOptionIndex
			},
			setPanelShown(shown: boolean) {
				if (this.showPanel === shown) return

				this.showPanel = shown
				this.$emit(shown ? 'panelOpened' : 'panelClosed')
			},
			/** Return from the panel to the option list (`showOptions` slot prop) */
			showOptionsList() {
				this.setPanelShown(false)
				this.updateMenuState(true)
			}
		}
	})
</script>
<template>
	<div class="vue-accessible-select-single" :class="{ disabled: isDisabledOrLoading, open }">
		<slot name="label">
			<label
				v-if="labelIsVisible"
				:id="`${htmlId}-label`"
				:for="htmlId"
				class="combo-label"
			>
				{{ label }}
			</label>
		</slot>
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
			:aria-label="ariaLabelValue(value, labelField as keyof SelectOption)"
			:aria-labelledby="labelIsVisible ? `${htmlId}-label` : undefined"
			class="combo-input"
			role="combobox"
			@blur="handleBlur"
			v-on="isDisabledOrLoading ? {} : { mousedown: handleClick, keydown: handleKeydown }"
			v-bind="isDisabledOrLoading && !hasFocusWhenDisabled ? {} : { tabindex: 0 }"
		>
			<span :id="`${htmlId}-value`" ref="valueEl">
				<!-- @slot Display the loading state via custom template code-->
				<slot v-if="loading" name="loadingState">
					Loading...
				</slot>
				<span v-else-if="isPlaceholderShown" class="combo-placeholder">{{ placeholder }}</span>
				<!-- @slot Display the currently selected option via custom template code -->
				<slot v-else-if="value" name="selectedOption" :option="value">
					{{ prependLabel ? label + ': ' + value[labelField as keyof SelectOption] : value[labelField as keyof SelectOption] }}
				</slot>
			</span>
		</div>
		<!-- tabindex -->
		<div
			:id="`${htmlId}-listbox`"
			ref="listboxEl"
			class="combo-menu"
			:role="showPanel ? undefined : 'listbox'"
			@mousedown="onMenuMouseDown"
		>
			<!-- @slot Arbitrary dropdown panel content (e.g. a date-range picker), shown in place of the option list after the panel option is activated -->
			<slot
				v-if="showPanel"
				name="panel"
				:closeMenu="closeMenuFromPanel"
				:showOptions="showOptionsList"
			/>
			<template v-else>
				<div
					v-for="(option, index) in options"
					:id="`${htmlId}-item-${index}`"
					:key="option[uniqueIdField as keyof SelectOption]?.toString()"
					class="combo-option"
					:class="{
						'option-selected': selectedIndex == index,
						'option-current': index == activeIndex,
						'option-disabled': option.disabled
					}"
					role="option"
					:aria-disabled="option.disabled"
					:aria-selected="index == selectedIndex ? 'true' : 'false'"
					:aria-label="index === selectedIndex ? `${option.label} selected` : ''"
					@click="handleOptionClick(index)"
					@mousedown="onOptionMouseDown"
				>
					<!-- @slot Display individual options via custom template code -->
					<slot name="option" :option="option">
						{{ option[labelField as keyof SelectOption] }}
					</slot>
					<span v-if="option.screenReaderLabel" class="sr-only">{{ option.screenReaderLabel }}</span>
				</div>
				<div
					v-if="hasPanelOption && panelOption"
					:id="`${htmlId}-item-${panelOptionIndex}`"
					class="combo-option combo-option-panel"
					:class="{
						'option-selected': panelOptionSelected,
						'option-current': activeIndex === panelOptionIndex
					}"
					role="option"
					:aria-selected="panelOptionSelected ? 'true' : 'false'"
					:aria-label="panelOption.screenReaderLabel || (panelOption[labelField as keyof SelectOption] as string)"
					@click="openPanel"
					@mousedown="onOptionMouseDown"
				>
					<!-- @slot Display the panel option row via custom template code -->
					<slot
						name="panelOption"
						:option="panelOption"
						:active="activeIndex === panelOptionIndex"
						:selected="panelOptionSelected"
					>
						{{ panelOption[labelField as keyof SelectOption] }}
					</slot>
				</div>
			</template>
		</div>
	</div>
</template>
