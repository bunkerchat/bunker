var BunkerMedia = require('./BunkerMedia');

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
			text = this.parseLinks(text);
		//}


		return (
			<div>
				<span dangerouslySetInnerHTML={{__html: text}}></span>
				<BunkerMedia text={this.props.text}/>
			</div>
		)
	},

	parseBoldAndItalics(text){
		// bold
		text = text.replace(/\*(.+?)\*/g,'<strong>$1</strong>');

		// italics
		text = text.replace(/\_(.+?)\_/g,'<em>$1</em>');

		return text;
	},

	parseLinks(text){
		return text.replace(/(https?:\/\/\S+)/gi, '<a href="$1">$1</a>');
	},


});

function replaceAll(str, find, replace) {
	return str.split(find).join(replace);
}

module.exports = BunkerMessage;