var BunkerMedia = React.createClass({

	getInitialState: function() {
		return {visible: this.props.message.$visible};
	},

	toggle(){
		this.props.message.$visible = !this.props.message.$visible;
		this.setState({visible: this.props.message.$visible})
	},

	render() {
		var text = this.props.message.text;

		//make sure there is a link of some kind
		var match = text.match(/https?:\/\/\S+/gi);
		if (!match) return false;

		var content = this.images(text)
				|| this.imgur(text);

		var panelBody = (
			<div className="panel-body">
					{content}
			</div>
		);

		return (
			<div className="panel panel-default">
				<div className="panel-heading pointer" onClick={this.toggle}>
					{match[0]}
					<div className="pull-right">
						Click to 'open'
					</div>
				</div>
				{this.state.visible ? panelBody : false}
			</div>
		)
	},

	images(text) {
		var match = text.match(/(https?:\/\/\S+.(?:gif|png|jpg|jpeg))$/g);
		if (!match)return false;

		return <img src={match[0]}/>
	},

	imgur(text) {
		var match = text.match(/https?:\/\/\S+.(gifv|webm|mp4)$/i);
		if (!match)return false;

		var imgurLinkMpeg = match[0].replace('webm', 'mp4').replace('gifv', 'mp4');
		var imgurLinkWebm = match[0].replace('mp4', 'webm').replace('gifv', 'webm');

		return (
			<video className="imgur-gifv" preload="auto" autoPlay muted webkit-playsinline loop>
				<source type="video/webm" src={imgurLinkWebm} />
				<source type="video/mp4" src={imgurLinkMpeg} />
			</video>
		)
	}
});

module.exports = BunkerMedia;
