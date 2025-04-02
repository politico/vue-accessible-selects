import { mount } from "@vue/test-utils"

import SelectSearchSingle from "../src/SelectSearchSingle.vue"

describe("SelectSearchSingle", () => {
  let wrapper

  describe("given simple options", () => {
    beforeEach(() => {
      // TODO: Share sample data between spec files & Storybook stories
      const options = [
        { label: "Item One", value: "one" },
        { label: "Item Two", value: "two" },
        { label: "Item Three", value: "three" },
      ]

      wrapper = mount({
        components: { SelectSearchSingle },
        data() {
          return { value: null, options }
        },
        template:
          '<div><SelectSearchSingle :options="options" v-model:value="value" label="Sample SelectSearchSingle" /></div>'
      })
    })

    it("contains all 3 given options in the dropdown", () => {
      const listboxText = wrapper.find("div[role=listbox]").text()

      expect(listboxText).toContain("Item One")
      expect(listboxText).toContain("Item Two")
      expect(listboxText).toContain("Item Three")
    })

    describe("when the second option is clicked & then the third option is clicked", () => {
      beforeEach(async () => {
        const listbox = wrapper.find("div[role=listbox]")
        await listbox.findAll("div[role=option]").at(1).trigger("click")
      })

    it('sets the new displayed value of the select appropriately', async () => {
      expect(wrapper.find('input').element.value).toContain('Item Two')
    })

    it('emits the full selected item exactly once', async () => {
      const selectSearchSingle = wrapper.findComponent(SelectSearchSingle)

      expect(selectSearchSingle.emitted()['update:value'].length).toEqual(1)
      expect(selectSearchSingle.emitted()['update:value'][0]).toEqual([{ label: 'Item Two', value: 'two' }])
    })


    it('sets the parent component data property correctly, given v-model usage', async () => {
      expect(wrapper.vm['value']).toEqual({ label: 'Item Two', value: 'two' })
    })
  })

    describe("label functionality", () => {
    beforeEach(() => {
      const options = [
        { label: "Item One", value: "one" },
        { label: "Item Two", value: "two" },
        { label: "Item Three", value: "three" },
      ]

      wrapper = mount({
        components: { SelectSearchSingle },
        data() {
          return { selectedOption: null, options }
        },
        template:
          '<div><SelectSearchSingle :options="options" v-model:value="selectedOption" label="Sample SelectSearchSingle" /></div>'
      })
    })
	
      it("adds the aria-roledescription attribute to the input", () => {
        const input = wrapper.find("input")
        expect(Object.keys(input.attributes())).toContain("aria-roledescription")
      })
    })
  })
})
