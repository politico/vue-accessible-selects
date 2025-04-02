<!-- eslint-disable vue/one-component-per-file -->
<script lang="ts">
// Original reference: https://github.com/microsoft/sonder-ui/tree/master/src/components/select

import { defineComponent, nextTick, PropType } from 'vue'

import {
	ensureElementInViewport,
	filterOptions,
	getActionFromKey,
	isScrollable,
	maintainScrollVisibility,
	MenuActions,
	uniqueId
} from './shared'
import { SelectOption } from './types'

export interface ISelectSearchSingle {
	$refs?: {
		inputRef: HTMLInputElement
		activeOptionRef: HTMLElement
		listboxEl: HTMLElement
	}
}

export interface SelectFilterOption extends SelectOption {
	highlightedLabel?: string
}

/**
 * Component to select a single option from a dropdown, developed with accessibility & usability as the primary focus
 */
// `PURE` designation to enable tree-shaking
export default defineComponent({
	name: 'SelectSearchSingle',
	extends: defineComponent<ISelectSearchSingle>({}),
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
			type: String as PropType<keyof SelectOption>,
			default: 'label'
		},
		labelIsVisible: {
			type: Boolean,
			default: true
		},
		/** Generally, there's no need to set this via a prop - it will be set automatically when using v-model */
		value: {
			default: null,
			type: Object as PropType<SelectOption>
		},
		loading: {
			type: Boolean,
			default: false
		},
		options: {
			required: true,
			type: Array as PropType<SelectOption[]>
		},
		loadingPlaceholder: {
			type: String,
			default: 'Loading...'
		},
		placeholder: {
			type: String,
			default: ''
		},
		noResultsMessage: {
			type: String,
			default: 'No results found'
		},
		/**
		 * Determines whether or not typing in the input will filter the provided options.
		 * Should be set to false if you are making API calls to fetch options.
		 */
		internalSearch: {
			type: Boolean,
			default: true
		},
		uniqueIdField: {
			type: String as PropType<keyof SelectOption>,
			default: 'value'
		},
		/**
		 * When using a slot to display each option in the select,
		 * you'll want to pass in a way for the select to *search* for those options as a user types,
		 * in order to accurately filter the available options
		 * @example
		 * ```
		 * :optionLabelForSearching="a => a.label + '-' + a.value"
		 * ```
		 */
		optionLabelForSearching: {
			type: Function as PropType<(option: SelectOption) => string>,
			default: null
		}
	},
	data() {
		return {
			activeIndex: -1,
			htmlId: uniqueId(),
			notificationMessage: '',
			ignoreBlur: false,
			open: false,
			searchTimeout: null,
			inputValue: ''
		}
	},
	computed: {
		activeDescendant(): string {
			return this.open && this.activeIndex >= 0
				? `${this.htmlId}-item-${this.activeIndex}`
				: ''
		},
		ariaLabelValue() {
			return this.ariaLabel.length > 0
				? this.ariaLabel
				: this.value?.screenReaderLabel ||
						(this.value?.[this.labelField as keyof SelectOption] as string) ||
						this.label
		},
		placeholderText(): string {
			return this.loading ? this.loadingPlaceholder : this.placeholder
		},
		isCurrentOptionDisabled(): boolean {
			return this.filteredOptions[this.activeIndex]?.disabled || false
		},
		isDisabledOrLoading(): boolean {
			return this.disabled || this.loading
		},
		isPlaceholderShown(): boolean {
			return !!this.placeholder && !this.value?.value
		},
		filteredOptions(): SelectFilterOption[] {
			const filtered = this.internalSearch
				? filterOptions(
						this.options,
						this.inputValue,
						this.labelField,
						[],
						this.optionLabelForSearching
				  )
				: this.options

			const highlighted = this.inputValue.length
				? filtered.map(option => ({
						...option,
						highlightedLabel: this.highlightInputValue(this.optionLabelForSearching ? this.optionLabelForSearching(option) : option[this.labelField] as string)
				  }))
				: filtered

			

			return highlighted
		},
		displayedInputValue() {
			if (this.inputValue.length) {
				return this.inputValue
			}

			const label = this.optionLabelForSearching ? this.optionLabelForSearching(this.value) : this.value?.[this.labelField] as string
			
			return label ?? this.inputValue
		},
		displayNoResultsMessage(): boolean {
			return (
				(!!this.noResultsMessage || !!this.hasNoResultsSlot) &&
				(!this.filteredOptions || this.filteredOptions.length === 0)
			)
		},
		hasNoResultsSlot(): boolean {
			return !!this.$slots['no-results']
		},
		selectedIndex(): number {
			return this.value
				? this.options?.findIndex(
						currentOption => currentOption.value == this.value.value
				  )
				: -1
		}
	},
	watch: {
		selectedIndex(newValue: number) {
			this.activeIndex = newValue
		}
	},
	updated() {
		if (
			this.open &&
			this.$refs?.activeOptionRef?.[0 as keyof {}] &&
			isScrollable(this.$refs.listboxEl as HTMLElement)
		) {
			maintainScrollVisibility(
				this.$refs.activeOptionRef[0 as keyof {}],
				this.$refs.listboxEl as HTMLElement
			)
		}
	},
	mounted() {
		const activeIndex = this.value
			? this.options?.findIndex(
					currentOption =>
						currentOption[this.uniqueIdField] == this.value[this.uniqueIdField]
			  )
			: -1

		this.activeIndex = activeIndex
	},
	methods: {
		highlightInputValue(label: string) {
			const searchLabel = label.trim().toLowerCase()
			const matchIndex = searchLabel.indexOf(this.inputValue.trim().toLowerCase())

			const startString = label.slice(0, matchIndex)
			const matchString = `<b>${label.slice(
				matchIndex,
				matchIndex + this.inputValue.length
			)}</b>`
			const endString = label.slice(matchIndex + this.inputValue.length, label.length)

			return startString + matchString + endString
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
			}
		},
		handleClick() {
			if (this.selectedIndex !== -1) {
				return
			}

			this.open = !this.open
		},
		updateMenuState(open: boolean) {
			this.open = open

			this.$refs.inputRef?.focus()
		},
		handleKeydown(event: KeyboardEvent) {
			const max = this.filteredOptions.length - 1
			const action = getActionFromKey(event, this.open)

			switch (action) {
				case MenuActions.Next:
				case MenuActions.Last:
				case MenuActions.First:
				case MenuActions.Previous:
					event.preventDefault()
					return this.onOptionChange(this.getUpdatedIndex(this.activeIndex, max, action))
				case MenuActions.CloseSelect:
					event.preventDefault()
					this.selectOption(this.activeIndex)
					this.updateMenuState(false)
					break

				case MenuActions.Close:
					event.stopPropagation()
					event.preventDefault()
					return this.updateMenuState(false)
				case MenuActions.Open:
					if (this.selectedIndex !== -1) {
						this.clearSelected()
						break
					}

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
			if (index === -1) {
				return
			}

			const selected = this.filteredOptions[index]

			if (selected.disabled) {
				return
			}

			this.inputValue = selected[this.labelField as keyof SelectOption] as string
			/**
			 * emit the most recently selected value,
			 * *generally not necessary*, if state can be handled w/ v-model alone
			 */
			this.$emit('update:value', selected)
		},
		onInput() {
			const curValue = this.$refs.inputRef.value

			if (this.inputValue !== curValue) {
				this.inputValue = curValue
				this.activeIndex = -1

				/**
				 * emits the current user-provided search string,
				 * primarily useful for making autocomplete calls
				 */
				this.$emit('searchChange', this.inputValue)
			}

			this.determineMenuStateAndNotificationMessage()
		},
		determineMenuStateAndNotificationMessage() {
			let newMenuState = true
			this.notificationMessage = ''

			if (!this.filteredOptions.length) {
				// if there are no filteredOptions, the menu should only remain open when we need to display no results message
				newMenuState = !!this.displayNoResultsMessage
				this.notificationMessage = this.noResultsMessage || 'no results found'
			} else {
				this.notificationMessage = `Found ${this.filteredOptions.length} results for ${this.inputValue}`
			}

			if (this.open !== newMenuState) {
				this.updateMenuState(newMenuState)
			}
		},
		clearSelected() {
			this.inputValue = ''

			this.notificationMessage = 'Selected value is cleared'

			this.updateMenuState(true)

			this.$emit('update:value')
			this.$emit('reset:value')

			setTimeout(() => (this.notificationMessage = ''), 50)
		}
	}
})
</script>
<template>
	<div
		class="vue-accessible-select-search-single"
		:class="{ disabled: isDisabledOrLoading, open }"
	>
		<slot name="label">
			<label v-if="labelIsVisible" :id="`${htmlId}-label`" class="combo-label">
				{{ label }}
			</label>
		</slot>
		<div role="status" aria-live="polite" class="sr-only">
			<span v-if="notificationMessage">{{ notificationMessage }}</span>
		</div>
		<div class="combobox-wrapper">
			<input
				ref="inputRef"
				aria-autocomplete="list"
				:aria-controls="`${htmlId}-listbox`"
				:aria-expanded="`${open}`"
				aria-haspopup="listbox"
				aria-roledescription="Extended select list box"
				class="combo-input"
				:disabled="disabled"
				role="combobox"
				type="text"
				:value="displayedInputValue"
				:placeholder="placeholderText"
				:aria-placeholder="placeholderText"
				:aria-activedescendant="activeDescendant"
				:aria-disabled="isDisabledOrLoading"
				:aria-label="ariaLabelValue"
				tabindex="0"
				@blur="handleBlur"
				@input="onInput"
				v-on="
					isDisabledOrLoading ? {} : { mousedown: handleClick, keydown: handleKeydown }
				"
			/>
			<!-- tabindex -->
			<div v-if="selectedIndex === -1" class="combo-menu-wrapper">
				<div class="combo-menu-wrapper__scroller">
					<div
						:id="`${htmlId}-listbox`"
						ref="listboxEl"
						class="listbox-menu"
						role="listbox"
						@mousedown="onMenuMouseDown"
					>
						<template v-for="(option, index) in filteredOptions">
							<div
								v-if="option[uniqueIdField]"
								:id="`${htmlId}-item-${index}`"
								:key="option[uniqueIdField]?.toString()"
								ref="activeOptionRef"
								class="combo-option"
								:class="{
									'option-current': index == activeIndex,
									'option-disabled': option.disabled
								}"
								role="option"
								:aria-disabled="option.disabled"
								:aria-selected="index == selectedIndex ? 'true' : 'false'"
								:aria-label="index === selectedIndex ? `${option[labelField]} selected` : ''"
								@click="handleOptionClick(index)"
								@mousedown="onOptionMouseDown"
							>
								<!-- @slot Display individual options via custom template code -->
								<slot name="option" :option="option">
									<span v-html="option.highlightedLabel ?? option[labelField]" />
									<span v-if="option.screenReaderLabel" class="sr-only">{{
										option.screenReaderLabel
									}}</span>
								</slot>
							</div>
						</template>
						<slot v-if="displayNoResultsMessage" name="no-results">
							<div class="option-no-results">
								<span>{{ noResultsMessage }}</span>
							</div>
						</slot>
					</div>
				</div>
			</div>

			<div :class="['combo-input-icon-block', loading && 'is-loading']">
				<template v-if="!loading">
					<button
						v-if="selectedIndex !== -1"
						class="combo-input-clear"
						aria-label="Clear selected"
						@click="clearSelected"
					>
						<svg
							class="icon"
							height="20px"
							role="presentation"
							version="1.1"
							viewBox="0 0 20 20"
							width="20px"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
								<g fill="currentColor">
									<polygon
										points="17.5,16.6 10.9,10 17.5,3.4 16.6,2.5 10,9.1 3.4,2.5 2.5,3.4 9.1,10 2.5,16.6 3.4,17.5 10,10.9 16.6,17.5 "
									></polygon>
								</g>
							</g>
						</svg>
					</button>
					<span v-else class="combo-input-arrow-block" />
				</template>
				<template v-else>
					<svg
						class="combo-spinner-icon"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4.44747 0C1.24747 0.887906 -0.651555 4.29399 0.205883 7.6077L1.36471 7.28616C0.678756 4.63519 2.19797 1.91032 4.75798 1.2L4.44747 0Z"
							fill="currentColor"
						/>
						<path
							d="M10.6353 4.71384C11.3212 7.36481 9.80202 10.0897 7.24202 10.8L7.55253 12C10.7525 11.1121 12.6516 7.70601 11.7941 4.39231L10.6353 4.71384Z"
							fill="currentColor"
						/>
					</svg>
				</template>
			</div>
		</div>
	</div>
</template>
