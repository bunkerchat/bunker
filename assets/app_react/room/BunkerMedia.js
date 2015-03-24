var BunkerMedia = React.createClass({
	render() {
		var text = this.props.text;

		//make sure there is a link of some kind
		if (!/https?:\/\/\S+/gi.test(text)) return false;

		var content = this.images(text)
				|| this.imgur(text)
			;

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					"quote"
					<div className="pull-right">
						Click to 'open'
					</div>
				</div>
				<div className="panel-body">
				{content}
				</div>
			</div>
		)
	},

	images(text) {
		var match = text.match(/(https?:\/\/\S+.(?:gif|png|jpg|jpeg))$/g);
		if (!match)return false;

		return <img src={match[0]}/>
	},

	imgur(text) {
		var match = text.match(/https?:\/\/\S+.imgur.com\/\w*\.(gifv|webm|mp4)$/i);
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
