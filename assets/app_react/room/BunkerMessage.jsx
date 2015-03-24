var BunkerMessage = React.createClass({

	render(){
		var text = this.props.text;

		//if (text.match(/&#10;/g)) {
		//
		//	text = this.createQuotedBlock(text);
		//}
		//else {
			text = this.parseBoldAndItalics(text);
			//text = this.parseEmoticons(text);
			//text = this.parseMedia(text);
		//}


		return (
			<span dangerouslySetInnerHTML={{__html: text}}></span>
		)
	},

	parseBoldAndItalics(text){
		// bold
		text = text.replace(/\*(.+?)\*/g,'<strong>$1</strong>');

		// italics
		text = text.replace(/\_(.+?)\_/g,'<em>$1</em>');

		return text;
	},

	media(text){

	}
});

function replaceAll(str, find, replace) {
	return str.split(find).join(replace);
}

module.exports = BunkerMessage;