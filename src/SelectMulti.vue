<script lang="ts">
	// Original reference: https://github.com/microsoft/sonder-ui/tree/master/src/components/multiselect

	import Vue, { PropType, VueConstructor } from 'vue'

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
		notificationMessage: string
		open: boolean
		inputValue: string
	}

	interface ISelectMulti extends Vue {
		$refs: {
			inputRef: HTMLInputElement
			listboxRef: HTMLElement
			activeOptionRef: HTMLElement
			selectedOptionPill: HTMLElement
		}
	}

	/**
	 * Component to select multiple options from a dropdown, developed with accessibility & usability as the primary focus
	 */
	// `PURE` designation to enable tree-shaking
	export default /*#__PURE__*/(Vue as VueConstructor<ISelectMulti>).extend({
		name: 'SelectMulti',
		model: {
			prop: 'values',
			event: 'change'
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
			loading: {
				type: Boolean,
				default: false
			},
			options: {
				type: Array as PropType<SelectOption[]>,
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
			/**
             * Determines whether or not typing in the input will filter the provided options.
			 * Should be set to false if you are making API calls to fetch options.
			 */
            internalSearch: {
                type: Boolean,
                required: false,
                default: true
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
				required: false,
				default: null
			},
			displayPillsBelowInput: {
				type: Boolean,
				default: false
			},
			/**
			 * By default, the list will be empty when either no options are passed in,
			 * or a user has typed a string that doesn't match any of the options.
			 * If you'd like to display a messsage instead when that occurs, pass it in here
			 */
			noResultsMessage: {
				type: String,
				default: ''
			},
			/** Generally, there's no need to set this via a prop - it will be set automatically when using v-model */
			values: {
				type: Array as PropType<SelectOption[]>,
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
				notificationMessage: '',
				open: false,
				inputValue: ''
			} as ComponentData
        },
        watch: {
            loading(newLoadingState, oldLoadingState): void {
                // In cases where we move from a loading state, to a resolved state...
                if (newLoadingState === false && oldLoadingState === true) {
                    //... we want to open the options to show the newly fetched items.
                    this.updateMenuState(true)
                }
            }
        },
		computed: {
			activeId(): string {
				return this.open ? `${this.htmlId}-${this.activeIndex}` : ''
			},
			filteredOptions(): SelectOption[] {
				return this.internalSearch ? filterOptions(this.options, this.inputValue, [], this.optionLabelForSearching) : this.options
			},
			selectedOptions: {
				get(): SelectOption[] {
					return this.values
				},
				set(values: SelectOption[]) {
					// Used just for v-model, no need to subscribe to handle event
					this.$emit('change', values)
				}
			},
			displayNoResultsMessage(): boolean {
				return this.noResultsMessage && (!this.filteredOptions || this.filteredOptions.length === 0)
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
					/**
					 * emits the current user-provided search string,
					 * primarily useful for making autocomplete calls
					 */
					this.$emit('searchChange', this.inputValue, this.filteredOptions)
				}

				this.determineMenuStateAndNotificationMessage()
			},
			determineMenuStateAndNotificationMessage() {
				let newMenuState = true
				this.notificationMessage = ''

				if (!this.filteredOptions.length) {
					// if there are no filteredOptions, the menu should only remain open when a custom `noResultsMessage` has been provided
					newMenuState = !!this.noResultsMessage
					this.notificationMessage = this.noResultsMessage || 'no results found'
				}

				if (this.open !== newMenuState) {
					this.updateMenuState(newMenuState, false)
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
			onOptionMouseDown(event: MouseEvent) {
				this.ignoreBlur = true
				this.callFocus = true
				event.stopPropagation()
			},
			onMenuMouseDown(event: MouseEvent) {
				event.preventDefault()
			},
			removeOption(index: number) {
				/**
				 * emits the most recently removed value,
				 * *generally not necessary*, if state can be handled w/ v-model alone
				 */
				this.notificationMessage = 'removed'
				this.$emit('remove', this.selectedOptions[index])
				this.selectedOptions = [...this.selectedOptions.filter((_, i) => i !== index)]

				setTimeout(() => { this.notificationMessage = '' }, 50)
			},
			removeOptionAndHandleFocusShift(index: number) {
				this.removeOption(index)
				this.$nextTick(() => {
					if (this.selectedOptions.length === 0) {
						this.$refs.inputRef.focus()
					} else {
						this.$refs.selectedOptionPill[0].focus()
					}
				})
			},
			selectOption(option: SelectOption) {
				/**
				 * emits the most recently selected value
				 * *generally not necessary*, if state can be handled w/ v-model alone
				 */
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
	<div class="vue-accessible-select-multi" :class="{ disabled, open }">
		<label :id="htmlId" class="combo-label" :class="{ 'sr-only': !labelIsVisible }">
			{{ label }}
		</label>
		<ul :id="`${htmlId}-selected`" class="selected-options" :class="{ 'below-input': displayPillsBelowInput }">
			<template v-for="(option, index) in selectedOptions" >
				<li v-if="option.value" :key="option.value" >
					<button
						ref="selectedOptionPill"
						class="selected-option-pill"
						:disabled="disabled"
						:aria-label="`remove ${option.label}`"
						type="button"
						:aria-describedby="`${htmlId}-selected-option-pills`"
						@click="removeOptionAndHandleFocusShift(index)"
					>
						<!-- @slot Display the currently selected options via custom template code -->
						<slot name="selectedOption" :option="option">
							{{  option.label }}
						</slot>
					</button>
				</li>
			</template>
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
				:disabled="disabled"
				role="combobox"
				type="text"
				:value="inputValue"
				:placeholder="placeholder"
				@blur="onInputBlur"
				@click="updateMenuState(true)"
				@input="onInput"
				@keydown="onInputKeyDown"
			/>

			<div role="status" aria-live="polite" class="sr-only">
				<span v-if="notificationMessage">{{ notificationMessage }}</span>
			</div>
			<div
				:id="`${htmlId}-listbox`"
				ref="listboxRef"
				class="combo-menu"
				role="listbox"
				aria-multiselectable="true"
				@mousedown="onMenuMouseDown"
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
					<!-- @slot Display individual options via custom template code -->
					<slot name="option" :option="option">
						{{  option.label }}
					</slot>
				</div>
				<div v-if="displayNoResultsMessage" class="option-no-results">
					<span>{{ noResultsMessage }}</span>
				</div>
			</div>
			<div class="combo-input-icon-block">
				<template v-if="!loading">
					<slot name="input-icon">
						<svg class="combo-plus-icon" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
							<line x1="5" y1="0" x2="5" y2="10" stroke="currentColor" stroke-width="2" />
							<line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" stroke-width="2" />
						</svg>
					</slot>
				</template>
				<template v-else>
					<svg class="combo-spinner-icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M4.44747 0C1.24747 0.887906 -0.651555 4.29399 0.205883 7.6077L1.36471 7.28616C0.678756 4.63519 2.19797 1.91032 4.75798 1.2L4.44747 0Z" fill="currentColor"/>
						<path d="M10.6353 4.71384C11.3212 7.36481 9.80202 10.0897 7.24202 10.8L7.55253 12C10.7525 11.1121 12.6516 7.70601 11.7941 4.39231L10.6353 4.71384Z" fill="currentColor"/>
					</svg>
				</template>
			</div>
		</div>
	</div>
</template>
