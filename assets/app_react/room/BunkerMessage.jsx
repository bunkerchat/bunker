var BunkerMedia = require('./BunkerMedia.jsx');

var BunkerMessage = React.createClass({

	render(){
		var text = this.props.message.text;

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
				<BunkerMedia message={this.props.message}/>
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
	}


});

module.exports = BunkerMessage;