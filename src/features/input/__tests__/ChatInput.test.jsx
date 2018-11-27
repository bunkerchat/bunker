import React from "react";
import ChatInput from "../ChatInput";
import { mount, shallow } from "enzyme";

describe("ChatInput", () => {
	test("can render", () => {
		const wrapper = shallow(<ChatInput />);
		expect(wrapper.exists()).toEqual(true);
	});

	describe("can send messages", () => {
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

	describe("can interact with emoticon picker", () => {
		test("can open picker with :", () => {
			const showEmoticonPicker = jest.fn();
			const wrapper = mount(<ChatInput showEmoticonPicker={showEmoticonPicker} />);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: ":" });
			expect(showEmoticonPicker).toHaveBeenCalled();
		});

		test("can close picker with another :", () => {
			const hideEmoticonPicker = jest.fn();
			const wrapper = mount(<ChatInput emoticonPickerVisible={true} hideEmoticonPicker={hideEmoticonPicker} />);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: ":" });
			expect(hideEmoticonPicker).toHaveBeenCalled();
		});

		test("can pick an emoticon with Enter", () => {
			const hideEmoticonPicker = jest.fn();
			const wrapper = mount(
				<ChatInput emoticonPickerVisible={true} selectedEmoticon="buddy" hideEmoticonPicker={hideEmoticonPicker} />
			);
			wrapper.setState({ text: "typing out :buddy" });

			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "Enter" });
			expect(hideEmoticonPicker).toHaveBeenCalled();
			expect(wrapper.state().text).toEqual("typing out :buddy:");
		});

		test("wont open picker if in the middle of typing an emoticon", () => {
			const showEmoticonPicker = jest.fn();
			const wrapper = mount(<ChatInput showEmoticonPicker={showEmoticonPicker} />);
			wrapper.setState({ text: "gonna make an emoticon :hellyeah" });

			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: ":" });
			expect(showEmoticonPicker).not.toHaveBeenCalled();
		});

		test("selects left with left arrow key", () => {
			const selectLeftEmoticonPicker = jest.fn();
			const wrapper = mount(
				<ChatInput emoticonPickerVisible={true} selectLeftEmoticonPicker={selectLeftEmoticonPicker} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "ArrowLeft" });
			expect(selectLeftEmoticonPicker).toHaveBeenCalled();
		});

		test("selects left with shift tab key", () => {
			const selectLeftEmoticonPicker = jest.fn();
			const wrapper = mount(
				<ChatInput emoticonPickerVisible={true} selectLeftEmoticonPicker={selectLeftEmoticonPicker} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "Tab", shiftKey: true });
			expect(selectLeftEmoticonPicker).toHaveBeenCalled();
		});

		test("selects right with right arrow key", () => {
			const selectRightEmoticonPicker = jest.fn();
			const wrapper = mount(
				<ChatInput emoticonPickerVisible={true} selectRightEmoticonPicker={selectRightEmoticonPicker} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "ArrowRight" });
			expect(selectRightEmoticonPicker).toHaveBeenCalled();
		});

		test("selects right with tab key", () => {
			const selectRightEmoticonPicker = jest.fn();
			const wrapper = mount(
				<ChatInput emoticonPickerVisible={true} selectRightEmoticonPicker={selectRightEmoticonPicker} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "Tab" });
			expect(selectRightEmoticonPicker).toHaveBeenCalled();
		});

		test("selects up with up arrow key", () => {
			const selectUpEmoticonPicker = jest.fn();
			const wrapper = mount(<ChatInput emoticonPickerVisible={true} selectUpEmoticonPicker={selectUpEmoticonPicker} />);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(selectUpEmoticonPicker).toHaveBeenCalled();
		});

		test("selects down with down arrow key", () => {
			const selectDownEmoticonPicker = jest.fn();
			const wrapper = mount(
				<ChatInput emoticonPickerVisible={true} selectDownEmoticonPicker={selectDownEmoticonPicker} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "ArrowDown" });
			expect(selectDownEmoticonPicker).toHaveBeenCalled();
		});
	});

	describe("editing", () => {
		const localMessages = [
			{ _id: "123", text: "hi there im hank hankerson" },
			{ _id: "456", text: "im a little tea pot" },
			{ _id: "789", text: "weeeeeee" }
		];

		it("selects up with up arrow", () => {
			const wrapper = mount(<ChatInput localMessages={localMessages} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowUp" });
			let state = wrapper.state();
			expect(state.editedMessage).toBeDefined();
			expect(state.editedMessage._id).toEqual("789");

			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(wrapper.state().editedMessage._id).toEqual("456");

			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(wrapper.state().editedMessage._id).toEqual("123");
		});

		it("select downs with down arrow", () => {
			const wrapper = mount(<ChatInput localMessages={localMessages} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowUp" });
			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(wrapper.state().editedMessage._id).toEqual("456");
			textarea.simulate("keydown", { key: "ArrowDown" });
			expect(wrapper.state().editedMessage._id).toEqual("789");
			textarea.simulate("keydown", { key: "ArrowDown" });
			expect(wrapper.state().editedMessage._id).toEqual("789"); // already at bottom
		});

		it("doesnt select down if at last message", () => {
			const wrapper = mount(<ChatInput localMessages={localMessages} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowDown" });
			let state = wrapper.state();
			expect(state.editedMessage).toEqual(null);
		});

		it("doesnt select up if at first message", () => {
			const wrapper = mount(<ChatInput localMessages={localMessages} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowUp" });
			textarea.simulate("keydown", { key: "ArrowUp" });
			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(wrapper.state().editedMessage._id).toEqual("123");
			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(wrapper.state().editedMessage._id).toEqual("123");
		});

		it("clears edited message with Escape", () => {
			const wrapper = mount(<ChatInput localMessages={localMessages} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(wrapper.state().editedMessage._id).toEqual("789");
			textarea.simulate("keydown", { key: "Escape" });
			expect(wrapper.state().editedMessage).toEqual(null);
		});
	});
});
