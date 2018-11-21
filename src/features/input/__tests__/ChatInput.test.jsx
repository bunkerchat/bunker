import React from "react";
import ChatInput from "../ChatInput";
import { shallow } from "enzyme";

describe("ChatInput", () => {
	test("renders", () => {
		const wrapper = shallow(<ChatInput />);
		expect(wrapper.exists()).toEqual(true);
	});
});
