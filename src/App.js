import React from 'react';
import axios from "axios";
import {Container, Row, Col, Button, Form} from "react-bootstrap/";
  
const credentials = require('./credentials.json');

const SPOTIFY_CLIENT_ID = credentials.SPOTIFY_CLIENT_ID
const SPOTIFY_REDIRECT_URI = credentials.SPOTIFY_REDIRECT_URI
const SPOTIFY_AUTH_ENDPOINT = credentials.SPOTIFY_AUTH_ENDPOINT
const SPOTIFY_RESPONSE_TYPE = credentials.SPOTIFY_RESPONSE_TYPE
const SPOTIFY_API_ENDPOINT = credentials.SPOTIFY_API_ENDPOINT
const SPOTIFY_PLAYLIST_SCOPE = credentials.SPOTIFY_PLAYLIST_SCOPE

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            spotifytoken: "",
            toptracks: []
        }
        this.spotifyLogout = this.spotifyLogout.bind(this);
        this.getTopTracks = this.getTopTracks.bind(this);
    }

    componentDidMount() {
        const hash = window.location.hash
        let spotifytoken = window.localStorage.getItem("spotifytoken")

        if (!spotifytoken && hash) {
            spotifytoken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("spotifytoken", spotifytoken)
        }

        this.setState({spotifytoken: spotifytoken});
    }

    spotifyLogout() {
        this.setState({spotifytoken: ""})
        window.localStorage.removeItem("spotifytoken")
        window.location.href= SPOTIFY_REDIRECT_URI.replace('/callback', '');
    }

    getTopTracks = async(event) => {
        event.preventDefault()
        try {
            let {data} = await axios.get(`${SPOTIFY_API_ENDPOINT}/me/top/tracks`, {
                headers: {
                    Authorization: `Bearer ${this.state.spotifytoken}`
                },
                params: {
                    'limit': 50,
                    'time_range': 'long_term'
                }
            })
            // console.log(data.items)
            // data.items.map(song => {console.log(song.name)})
            this.setState({toptracks: data.items});
        } catch(error) {
            alert(`Could not get user's top tracks`)
            this.spotifyLogout();
        }
    }


    render() {
        const renderSpotifyLoginButton = () => {
            if(this.state.spotifytoken) {
                return (<Button className="spotify-button" onClick={this.spotifyLogout}>Logout of Spotify</Button>);
            }
            else {
                return (<Button className="spotify-button" onClick={() => window.location.href=`${SPOTIFY_AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&response_type=${SPOTIFY_RESPONSE_TYPE}&scope=${SPOTIFY_PLAYLIST_SCOPE}`}>Login to Spotify</Button>);
            }
        }

        const renderGetTopTracksButton = () => {
            if(this.state.spotifytoken) {
                return (<Button onClick={this.getTopTracks} className="spotify-button">Get Top Tracks</Button>);
            }
            else {
                return null;
            }
        }

        const renderTopTracks = () => {
            return (
                <Container>
                    {this.state.toptracks.map(song => (
                                <Row key={song.id}>
                                    <img src={song.album.images[0].url} width="10%"/>
                                </Row>
                    ))}
                </Container>
            );
        }

        return (
            <Container>
                {renderSpotifyLoginButton()}
                {renderGetTopTracksButton()}
                {renderTopTracks()}
            </Container>
        );
    }
}

export default App;
