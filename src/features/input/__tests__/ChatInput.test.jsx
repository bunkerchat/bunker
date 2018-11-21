import React from "react";
import ChatInput from "../ChatInput";
import { mount, shallow } from "enzyme";

describe("ChatInput", () => {
	test("renders", () => {
		const wrapper = shallow(<ChatInput />);
		expect(wrapper.exists()).toEqual(true);
	});

	test("can send text", () => {
		const send = jest.fn();
		const wrapper = mount(<ChatInput roomId="abc123" send={send} />);
		wrapper.setState({ text: "really cool message" });

		const textarea = wrapper.find("textarea");
		expect(textarea.length).toEqual(1);

		textarea.simulate("keydown", { key: "Enter" });
		expect(send).toHaveBeenCalledWith("abc123", "really cool message");
	});
});
