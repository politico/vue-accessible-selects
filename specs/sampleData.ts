import { SelectOption } from '../src/types'

export const simpleOptions: SelectOption[] = [
    { label: 'Item One', value: 'one' },
    { label: 'Item Two', value: 'two' },
    { label: 'Item Three', value: 'three' }
]

export const optionsWithCustomLabelAndUniqueIdFields: SelectOption[] = [
    { 
        customLabel: 'Item One',
        customUniqueId: 'one'
    },
    { 
        customLabel: 'Item Two',
        customUniqueId: 'two' 
    },
    { 
        customLabel: 'Item Three',
        customUniqueId: 'three'
    }
]