import { mount } from "@vue/test-utils"

import SelectMulti from "../src/SelectMulti.vue"
import { nextTick } from "vue"

describe("SelectMulti", () => {
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
        data() {
          return { values: [], options }
        },
        template:
          '<div><SelectMulti :options="options" v-model:values="values" label="Sample SelectMulti" /></div>',
        components: { SelectMulti },
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
        await listbox.findAll("div[role=option]").at(2).trigger("click")
      })

      it("adds those options to the list of selected options", async () => {
        // const selectedOptionsText = wrapper.classes('selected-options')
        const selectedOptionsText = wrapper.find(".selected-options").text()

        expect(selectedOptionsText).toContain("Item Two")
        expect(selectedOptionsText).toContain("Item Three")
      })

      it("emits the full selected item each time an item is selected, using the `select` event", async () => {
        const selectMulti = wrapper.findComponent(SelectMulti)

        expect(selectMulti.emitted().select.length).toEqual(2)
        expect(selectMulti.emitted().select[0]).toEqual([
          { label: "Item Two", value: "two" },
        ])
        expect(selectMulti.emitted().select[1]).toEqual([
          { label: "Item Three", value: "three" },
        ])
      })

      it("emits the current list of all selected options each time the selected options are updated, using the `change` event to work w/ v-model", async () => {
        const selectMulti = wrapper.findComponent(SelectMulti)

        expect(selectMulti.emitted()["update:values"].length).toEqual(2)
        expect(selectMulti.emitted()["update:values"][0]).toEqual([
          [{ label: "Item Two", value: "two" }],
        ])
        expect(selectMulti.emitted()["update:values"][1]).toEqual([
          [
            { label: "Item Two", value: "two" },
            { label: "Item Three", value: "three" },
          ],
        ])
      })

      it("sets the parent component data property correctly, given v-model usage", async () => {
        expect(wrapper.vm["values"]).toEqual([
          { label: "Item Two", value: "two" },
          { label: "Item Three", value: "three" },
        ])
      })
    })

    describe("label functionality", () => {
      it("adds the aria-labelledby attribute to the listbox", () => {
        const options = [
          { label: "Item One", value: "one" },
          { label: "Item Two", value: "two" },
          { label: "Item Three", value: "three" },
        ]
        wrapper = mount({
          data() {
            return { selectedOptions: [], options }
          },
          template:
            '<div><SelectMulti :options="options" v-model="selectedOptions" label="Sample SelectMulti" /></div>',
          components: { SelectMulti },
        })
        const selectMulti = wrapper.findComponent(SelectMulti)
        const input = selectMulti.find("input")
        expect(Object.keys(input.attributes())).toContain("aria-labelledby")
      })
    })
  })

	let apiWrapper;

  describe("given internalSearch = false", () => {
		beforeEach(() => {	
		//  TODO: Share sample data between spec files & Storybook stories
      const apiOptions = [
        {
          label: "Energy Efficiency and Renewable Energy Office",
          value: "Energy Efficiency and Renewable Energy Office",
        },
        {
          label: "Energy Policy and New Uses Office",
          value: "Energy Policy and New Uses Office",
        },
        {
          label: "Energy Information Administration",
          value: "Energy Information Administration",
        },
      ]

      apiWrapper = mount({
        data() {
          return { values: [], options: apiOptions }
        },
        template: `
          <div>
						<SelectMulti 
							:options="options"
							v-model:values="values"
							label="Sample SelectMulti"
							:internalSearch="false"
						/>
					</div>,
				`,
        components: { SelectMulti },
      })
		})

    it("should render not render selected options + internalSearch = false", async () => {
      const listboxText = apiWrapper.find("div[role=listbox]").text()
      expect(listboxText).toContain("Energy Efficiency and Renewable Energy Office")
      expect(listboxText).toContain("Energy Policy and New Uses Office")
      expect(listboxText).toContain("Energy Information Administration")

			const listbox = apiWrapper.find("div[role=listbox]")
			await listbox.findAll("div[role=option]").at(0).trigger("click")

			// the selected option should show under selected-options
			const selectedOptionsText = apiWrapper.find(".selected-options").text()

			// an unselected option should not be under selected-options
			expect(selectedOptionsText).toContain("Energy Efficiency and Renewable Energy Office")

			// the option should not show under selected-options
			expect(selectedOptionsText).not.toContain("Energy Policy and New Uses Office")

			// the selected option should not be in the dropdown
			const listBoxAfterClick = apiWrapper.find("div[role=listbox]").text()
			expect(listBoxAfterClick).not.toContain("Energy Efficiency and Renewable Energy Office")

			// select second option
			await listbox.findAll("div[role=option]").at(0).trigger("click")

			// it was added
			const selectedOptionsAfterSecondClick = apiWrapper.find(".selected-options").text()
			expect(selectedOptionsAfterSecondClick).toContain(
        "Energy Policy and New Uses Office"
      )

			// it doesn't show up under the options
			const listBoxAfterSecondClick = apiWrapper.find("div[role=listbox]").text()
			expect(listBoxAfterSecondClick).not.toContain("Energy Efficiency and Renewable Energy Office")
    })
  })
})
