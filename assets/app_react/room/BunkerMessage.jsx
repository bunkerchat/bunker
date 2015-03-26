var EmoticonStore = require('./../stores/emoticonStore');
var BunkerMedia = require('./BunkerMedia.jsx');

var BunkerMessage = React.createClass({

	render() {
		var text = this.props.message.text;

		//if (text.match(/&#10;/g)) {
		//
		//	text = this.createQuotedBlock(text);
		//}
		//else {
		text = this.parseBoldAndItalics(text);
		text = this.parseEmoticons(text);
		text = this.parseLinks(text);
		//}


		return (
			<div>
				<span dangerouslySetInnerHTML={{__html: text}}></span>
				<BunkerMedia message={this.props.message}/>
			</div>
		)
	},

	parseBoldAndItalics(text) {
		if (!text)return;

		// bold
		text = text.replace(/(?:\s+|^)\*([\w\n]*?)\*(?:\s+|$)/g, ' <strong>$1</strong> ');

		// italics
		text = text.replace(/(?:\s+|^)_([\w\n]+?)_(?:\s+|$)/g, ' <em>$1</em> ');

		return text;
	},

	parseEmoticons(text) {
		var regex = /:(.+?):/g.exec(text);
		if (!regex) return text;

		var emoticon = EmoticonStore.hash[regex[1]];
		if (!emoticon)return text;

		return text.replace(/:(.+?):/g, `<img class="emoticon" title=":$1:" src="/assets/images/emoticons/${emoticon.file}">`);
	},

	parseLinks(text) {
		if (!text) return;
		return text.replace(/(https?:\/\/\S+)/gi, '<a href="$1">$1</a>');
	}


});

module.exports = BunkerMessage;