import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import { transaction } from 'mobx';
import YouTube from '../../../node_modules/react-youtube'
let _ = require('underscore');
let $ = require('jquery');

import AppStore from '../../data/AppStore';
let store = AppStore.getState();

@observer 
class Main extends React.Component<any, any>{

	constructor(props) {
		super(props);
		require('./Main.scss');
	}

	componentDidMount() {
		this.getRSS();
	}

	getRSS() {
		let data;				
		let videoIds = []
		$.ajax({
			url: 'https://www.reddit.com/r/videos/.json?limit=50',
			dataType: 'json',
			success: (json) => {
				data = json.data.children;
				for (let i = 0; i < data.length; i++) {

					let videoId = this.getVideoId(data[i].data.url);
					if (videoId) { videoIds.push(videoId); }
				}

				videoIds = _.shuffle(videoIds);
				console.log(videoIds);

				transaction(() => {
					store.redditVideos = videoIds;
					store.currentVideoId = videoIds[0];
				});
			},
			error: (error) => {
				return error;
			}
		});
	}

	getVideoId(url) {
		if (url.includes("youtu")) {
			let videoId = url.split('v=')[1];
			if (!videoId) { 
				videoId = url.split('.be/')[1] 
			} 

			var ampersandPosition = videoId && videoId.includes('&') ? videoId.indexOf('&') : -1;
			if (ampersandPosition != -1) {
				let id = videoId.substring(0, ampersandPosition);
				return id;
			} else { 
				return videoId 
			}
		}
	}

	handleVideoChange(next) {
		if (next) {
			transaction(() => {
				store.currentIndex = store.currentIndex + 1;
				store.currentVideoId = store.redditVideos[store.currentIndex];
			});
		} else {
			transaction(() => {
				store.currentIndex = store.currentIndex - 1;
				store.currentVideoId = store.redditVideos[store.currentIndex];
			});
		}
		console.log(store.currentVideoId);
	}

	onStateChange(event) {
		if (event.data == 0) {
			this.handleVideoChange(true);
		}
	}

	renderLeftArrow() {
		return <svg className="arrow" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="64px" height="64px" viewBox="0 0 32 32"><path d="M9.346,16L21.7,3.646l0.707,0.707L10.76,16l11.646,11.646L21.7,28.354L9.346,16z"></path></svg>
	}

	renderRightArrow() {
		return <svg className="arrow" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="64px" height="64px" viewBox="0 0 32 32"><path d="M22.654,16L10.3,28.354l-0.707-0.707L21.24,16L9.593,4.354L10.3,3.646L22.654,16z"></path></svg>
	}

	render() {
		let iframeWidth = $('.player').width() - 100;
		let iframeHeight = iframeWidth * 0.666;
		let opts = {
			width: iframeWidth,
			height: iframeHeight,
			playerVars: {
				autoplay: 0
			}
		}

		return (
			<div className="main">
				<h1 className="title">zoneout</h1>
				<div className="wrapper">
					<div className="button">
						{store.currentIndex > 0 ? 
							<div className="prev" onClick={() => {this.handleVideoChange(false)}}>{this.renderLeftArrow()}</div> : 
							null}
					</div>
					<div className="player">
						{store.redditVideos.length > 0 ? 
							<YouTube 
								videoId={store.currentVideoId } 
								opts={opts}
								onStateChange={this.onStateChange.bind(this)} /> :
							<span>Loading videos...</span> }
					</div>
					<div className="button">
						{store.currentIndex < store.redditVideos.length - 1 ? 
							<div className="next" onClick={() => {this.handleVideoChange(true)}}>{this.renderRightArrow()}</div> : 
							null}
					</div>
				</div>
			</div>
		)
	}
}

export default Main;