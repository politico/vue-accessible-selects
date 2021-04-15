/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT license. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SelectOption } from './types'

const enum Keys {
	Backspace = 'Backspace',
	Clear = 'Clear',
	Down = 'ArrowDown',
	End = 'End',
	Enter = 'Enter',
	Escape = 'Escape',
	Home = 'Home',
	Left = 'ArrowLeft',
	PageDown = 'PageDown',
	PageUp = 'PageUp',
	Right = 'ArrowRight',
	Space = ' ',
	Tab = 'Tab',
	Up = 'ArrowUp'
}

export const enum MenuActions {
	Close,
	CloseSelect,
	First,
	Last,
	Next,
	Open,
	PageDown,
	PageUp,
	Previous,
	Select,
	Space,
	Type
}

// filter an array of options against an input string
// returns an array of options that begin with the filter string, case-independent
export function filterOptions(
	options: SelectOption[] = [],
	filter: string,
	labelField: string,
	exclude: SelectOption[] = [],
	optionLabelForSearching: null | ((option: SelectOption) => string) = null
): SelectOption[] {
	return options.filter(option => {
		// NOTE: Changed from original implementation on sonder-ui:
		// we want to match any instance of the current user string,
		// rather than *only* when the user's string is at the beginning of an option
		const label = optionLabelForSearching ? optionLabelForSearching(option) : option[labelField]
		const matches = label?.toLowerCase().includes(filter.toLowerCase())

		return matches && exclude.indexOf(option) < 0
	})
}

// unused
// // User-defined Type Guard: https://stackoverflow.com/a/46700791/4167438
// function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
// 	return value !== null && value !== undefined
// }

// unused
// // return an array of exact option name matches from a comma-separated string
// export function findMatches(options: SelectOption[], search: string): SelectOption[] {
// 	const labels = search.split(',')
// 	return labels
// 		.map(label => {
// 			const match = options.filter(
// 				option => label.trim().toLowerCase() === option.label.toLowerCase()
// 			)
// 			return match.length > 0 ? match[0] : null
// 		})
// 		.filter(notEmpty)
// }

// return combobox action from key press
export function getActionFromKey(
	event: KeyboardEvent,
	menuOpen: boolean,
	isCurrentOptionDisabled: boolean
): MenuActions | undefined {
	const { key, altKey, ctrlKey, metaKey } = event
	const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'] // all keys that will open the combo

	// handle opening when closed
	if (!menuOpen && openKeys.includes(key)) {
		return MenuActions.Open
	}

	// handle typing characters when open or closed
	if (
		key === Keys.Backspace ||
		key === Keys.Clear ||
		(key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)
	) {
		return MenuActions.Type
	}

	// handle keys when open
	if (menuOpen) {
		if (key === Keys.Down && !altKey) {
			return MenuActions.Next
		} else if (key === Keys.Up && altKey) {
			return MenuActions.CloseSelect
		} else if (key === Keys.Up) {
			return MenuActions.Previous
		} else if (key === Keys.Home) {
			return MenuActions.First
		} else if (key === Keys.End) {
			return MenuActions.Last
		} else if (key === Keys.PageUp) {
			return MenuActions.PageUp
		} else if (key === Keys.PageDown) {
			return MenuActions.PageDown
		} else if (key === Keys.Escape) {
			return MenuActions.Close
		} else if (key === Keys.Enter) {
			return isCurrentOptionDisabled ? undefined : MenuActions.CloseSelect
		} else if (key === Keys.Space) {
			return isCurrentOptionDisabled ? undefined : MenuActions.Space
		}
	}
}

// return the index of an option from an array of options, based on a search string
// if the filter is multiple iterations of the same letter (e.g "aaa"), then cycle through first-letter matches
export function getIndexByLetter(
	options: SelectOption[],
	filter: string,
	labelField: string,
	startIndex = 0,
): number {
	const orderedOptions = [...options.slice(startIndex), ...options.slice(0, startIndex)]
	const firstMatch = filterOptions(orderedOptions, filter, labelField)[0]
	const allSameLetter = (array: string[]) => array.every(letter => letter === array[0])

	// first check if there is an exact match for the typed string
	if (firstMatch) {
		return options.indexOf(firstMatch)
	}

	// if the same letter is being repeated, cycle through first-letter matches
	else if (allSameLetter(filter.split(''))) {
		const matches = filterOptions(orderedOptions, filter[0], labelField)
		return options.indexOf(matches[0])
	}

	// if no matches, return -1
	else {
		return -1
	}
}

// get updated option index
export function getUpdatedIndex(
	current: number,
	max: number,
	action: MenuActions
): number {
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
}

// check if an element is currently scrollable
export function isScrollable(element: HTMLElement): boolean {
	return element && element.clientHeight < element.scrollHeight
}

// ensure given child element is within the parent's visible scroll area
export function maintainScrollVisibility(
	activeElement: HTMLElement,
	scrollParent: HTMLElement
) {
	const { offsetHeight, offsetTop } = activeElement
	const { bottom, top } = activeElement.getBoundingClientRect()
	const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent

	const isAboveParent = offsetTop < scrollTop
	const isBelowParent = offsetTop + offsetHeight > scrollTop + parentOffsetHeight
	const isBelowScreen = bottom > document.documentElement.clientHeight
	const isAboveScreen = top < 0

	if (isBelowScreen) {
		return activeElement.scrollIntoView(false)
	}

	if (isAboveScreen) {
		return activeElement.scrollIntoView(true)
	}

	if (isBelowParent) {
		return (scrollParent.scrollTop = offsetTop + offsetHeight - parentOffsetHeight)
	}

	if (isAboveParent) {
		return (scrollParent.scrollTop = offsetTop)
	}
}

// generate unique ID, the quick 'n dirty way
let idIndex = 0
export function uniqueId() {
	return `sui-${++idIndex}`
}
