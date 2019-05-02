import React from 'react';
import { StyleSheet, ScrollView, FlatList, View, Image, Text, TouchableOpacity } from 'react-native';
import { Font, LinearGradient } from 'expo';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const client = new ApolloClient({
  uri: 'https://rqvj0qw34.sse.codesandbox.io/',
})

export default class App extends React.Component {
  state = { fontLoaded: false, currentScrollPos: 0 };

  async componentDidMount() {
    await Font.loadAsync({
      'gibson-regular': require('./assets/gibson-regular.ttf'),
      'gibson-bold': require('./assets/gibson-bold.ttf')
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <Query
          query={gql`
              {
                playlist {
                  name
                  creator
                  followers
                  albumArt
                  songs {
                    key
                    title
                    artist
                    album
                  }
                }
              }
            `}
        >
          {({ loading, error, data }) => {
            if (loading || error) return <View />
            return <View>
              <ScrollView contentContainerStyle={styles.container} onScroll={(event) => {
                console.log(event.nativeEvent.contentOffset.y);
                this.setState({ currentScrollPos: event.nativeEvent.contentOffset.y })
              }}>
                <LinearGradient colors={['#3f6b6b', '#121212']} style={styles.header} />
                {this.state.fontLoaded ? (
                  <FlatList style={styles.list}
                    data={data.playlist.songs}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.playlistItem}>
                        <Text style={styles.playlistItemTitle}>{item.title}</Text>
                        <Text style={styles.playlistItemMeta}>{`${item.artist} • ${item.album}`}</Text>
                      </TouchableOpacity>
                    )}
                  />) : null}
              </ScrollView>
              {this.state.fontLoaded ? (
                <View style={{ ...styles.playlistDetails, height: this.calculatePlaylistHeight() }} pointerEvents="none">
                  <Image style={this.calculateArtSize()} source={{ uri: data.playlist.albumArt }} />

                  {this.state.currentScrollPos < 103 ? <Text style={styles.playlistTitle}>{data.playlist.name}</Text> : null}
                  {this.state.currentScrollPos < 53 ? <Text style={styles.playlistSubtitle}>{`BY ${data.playlist.creator} • ${data.playlist.followers} FOLLOWERS`}</Text> : null}
                </View>) : null}
              {this.state.fontLoaded ? (<TouchableOpacity style={{ ...styles.playlistButton, top: this.calculateButtonPos() }}><Text style={styles.playlistButtonText}>SHUFFLE PLAY</Text></TouchableOpacity>) : null}
            </View>
          }}
        </Query>
      </ApolloProvider>
    );
  }

  calculatePlaylistHeight = () => {
    if (this.state.currentScrollPos > 173) {
      const height = 160 - (this.state.currentScrollPos - 172);
      return height >= 0 ? height : 0;
    }
    return 510;
  }

  calculateButtonPos = () => {
    return this.state.currentScrollPos < 376 ? 420 - this.state.currentScrollPos : 44;
  }

  calculateArtSize = () => {
    return {
      width: (185 - (this.state.currentScrollPos / 10)),
      height: (185 - (this.state.currentScrollPos / 10)),
      opacity: (1 - (this.state.currentScrollPos / 350))
    };
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    height: 510
  },
  list: {
    width: '100%',
    backgroundColor: '#121212'
  },
  playlistDetails: {
    width: '100%',
    position: 'absolute',
    top: 90,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden'
  },
  playlistTitle: {
    fontFamily: 'gibson-bold',
    color: '#fff',
    fontSize: 30,
    marginTop: 50
  },
  playlistSubtitle: {
    fontFamily: 'gibson-regular',
    color: '#b9bdbe',
    fontSize: 12,
    marginTop: 15
  },
  playlistButton: {
    backgroundColor: '#2ab759',
    width: 230,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    position: 'absolute',
    left: 90
  },
  playlistButtonText: {
    fontFamily: 'gibson-bold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 2
  },
  playlistItem: {
    marginLeft: 25,
    marginBottom: 25,
    width: '90%'
  },
  playlistItemTitle: {
    fontFamily: 'gibson-bold',
    fontSize: 18,
    color: '#fff'
  },
  playlistItemMeta: {
    fontFamily: 'gibson-regular',
    color: '#b9bdbe',
    fontSize: 15
  }
});