import React from "react";
import {ChatInput} from "../ChatInput";
import { mount, shallow } from "enzyme";
jest.useFakeTimers();

describe("ChatInput", () => {
	const defaultProps = {
		roomId: "123",
		text: "",
		editedMessage: null,
		emoticonPickerVisible: false,
		showEmoticonPicker: jest.fn(),
		hideEmoticonPicker: jest.fn(),
		updateText: jest.fn(),
		updateEditedMessage: jest.fn(),
		send: jest.fn()
	};

	test("can render", () => {
		const wrapper = shallow(<ChatInput {...defaultProps}/>);
		expect(wrapper.exists()).toEqual(true);
	});

	describe("can send messages", () => {
		test("can send text", () => {
			const send = jest.fn();
			const props = {
				...defaultProps,
				text: "really cool message",
				send
			};

			const wrapper = mount(<ChatInput {...props} />);
			const textarea = wrapper.find("textarea");
			expect(textarea.length).toEqual(1);

			textarea.simulate("keydown", { key: "Enter" });
			jest.runAllTimers();
			expect(send).toHaveBeenCalledWith("123", "really cool message");
		});
	});

	describe("can interact with emoticon picker", () => {
		test("can open picker with :", () => {
			const showEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				showEmoticonPicker
			};
			const wrapper = mount(<ChatInput {...props} />);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: ":" });
			expect(showEmoticonPicker).toHaveBeenCalled();
		});

		test("can close picker with another :", () => {
			const hideEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				emoticonPickerVisible: true,
				hideEmoticonPicker
			};
			const wrapper = mount(<ChatInput {...props} />);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: ":" });
			expect(hideEmoticonPicker).toHaveBeenCalled();
		});

		test("can pick an emoticon with Enter", () => {
			const hideEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				text: "typing out :buddy",
				emoticonPickerVisible: true,
				selectedEmotion: "buddy",
				hideEmoticonPicker
			};
			const wrapper = mount(
				<ChatInput {...props} />
			);

			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "Enter" });
			expect(hideEmoticonPicker).toHaveBeenCalled();
		});

		test("wont open picker if in the middle of typing an emoticon", () => {
			const showEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				text: "gonna make an emoticon :hellyeah",
				emoticonPickerVisible: true,
				selectedEmotion: "buddy",
				showEmoticonPicker
			};
			const wrapper = mount(
				<ChatInput {...props} />
			);

			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: ":" });
			expect(showEmoticonPicker).not.toHaveBeenCalled();
		});

		test("selects left with left arrow key", () => {
			const selectLeftEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				emoticonPickerVisible: true,
				selectLeftEmoticonPicker
			};
			const wrapper = mount(
				<ChatInput {...props} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "ArrowLeft" });
			expect(selectLeftEmoticonPicker).toHaveBeenCalled();
		});

		test("selects left with shift tab key", () => {
			const selectLeftEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				emoticonPickerVisible: true,
				selectLeftEmoticonPicker
			};
			const wrapper = mount(
				<ChatInput {...props} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "Tab", shiftKey: true });
			expect(selectLeftEmoticonPicker).toHaveBeenCalled();
		});

		test("selects right with right arrow key", () => {
			const selectRightEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				emoticonPickerVisible: true,
				selectRightEmoticonPicker
			};
			const wrapper = mount(
				<ChatInput {...props} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "ArrowRight" });
			expect(selectRightEmoticonPicker).toHaveBeenCalled();
		});

		test("selects right with tab key", () => {
			const selectRightEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				emoticonPickerVisible: true,
				selectRightEmoticonPicker
			};
			const wrapper = mount(
				<ChatInput {...props} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "Tab" });
			expect(selectRightEmoticonPicker).toHaveBeenCalled();
		});

		test("selects up with up arrow key", () => {
			const selectUpEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				emoticonPickerVisible: true,
				selectUpEmoticonPicker
			};
			const wrapper = mount(
				<ChatInput {...props} />
			);
			const textarea = wrapper.find("textarea");
			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(selectUpEmoticonPicker).toHaveBeenCalled();
		});

		test("selects down with down arrow key", () => {
			const selectDownEmoticonPicker = jest.fn();
			const props = {
				...defaultProps,
				emoticonPickerVisible: true,
				selectDownEmoticonPicker
			};
			const wrapper = mount(
				<ChatInput {...props} />
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
			const updateEditedMessage = jest.fn();
			const props = {
				...defaultProps,
				localMessages,
				updateEditedMessage
			};
			const wrapper = mount(<ChatInput {...props} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(updateEditedMessage).toHaveBeenCalledWith("123", localMessages[2]);
		});

		it("select downs with down arrow", () => {
			const updateEditedMessage = jest.fn();
			const props = {
				...defaultProps,
				localMessages,
				editedMessage: localMessages[0],
				updateEditedMessage
			};
			const wrapper = mount(<ChatInput {...props} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowDown" });
			expect(updateEditedMessage).toHaveBeenCalledWith("123", localMessages[1]);
		});

		it("doesnt select down if at last message", () => {
			const updateEditedMessage = jest.fn();
			const props = {
				...defaultProps,
				localMessages,
				editedMessage: localMessages[2],
				updateEditedMessage
			};
			const wrapper = mount(<ChatInput {...props} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowDown" });
			expect(updateEditedMessage).not.toHaveBeenCalled();
		});

		it("doesnt select up if at first message", () => {
			const updateEditedMessage = jest.fn();
			const props = {
				...defaultProps,
				localMessages,
				editedMessage: localMessages[0],
				updateEditedMessage
			};

			const wrapper = mount(<ChatInput {...props} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowUp" });
			expect(updateEditedMessage).not.toHaveBeenCalled();
		});

		it("clears edited message with Escape", () => {
			const updateEditedMessage = jest.fn();
			const props = {
				...defaultProps,
				localMessages,
				updateEditedMessage
			};
			const wrapper = mount(<ChatInput {...props} />);
			const textarea = wrapper.find("textarea");

			textarea.simulate("keydown", { key: "ArrowUp" });
			textarea.simulate("keydown", { key: "Escape" });
			expect(updateEditedMessage).toHaveBeenCalled();
		});
	});
});
