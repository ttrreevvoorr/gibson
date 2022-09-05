const fetch = require('isomorphic-unfetch')
const { getData, getPreview, getTracks, getDetails } = require('spotify-url-info')(fetch)

const spotifyURI = require("spotify-uri");
// const yt = require("youtube-sr").default;
const ytsr = require("ytsr")
const supportedTypes = ["playlist", "track"];
const spotifySearch = require("@ksolo/spotify-search");

module.exports = {
  /**
   * Set credentials for method 'trackSearch'
   * @param {String} clientID Client ID of Spotify App
   * @param {String} secretKey Secret Key of Spotify App
   * @returns Void
   */
  setCredentials: async (clientID, secretKey) => {
    spotifySearch.setCredentials(clientID, secretKey);
    return;
  },
  /**
   * Returns a YouTube URL to play music with the "play" property of your preferred music npm.
   * @param {String} url Spotify URL
   * @returns YouTube Info
   * @example
   * const Discord = require("discord.js") //Define Discord
   * const client = new Discord.Client() //Define client
   * const Distube = require("distube") //Define Distube
   * client.distube = new Distube(client, { searchSongs: 10 }) //Define Distube Client
   * const spotifyToYT = require("spotify-to-yt") //Define package
   * const settings = {
   *    prefix: "!", //Define bot prefix
   *    token: "Discord Bot Token" //Define bot token
   * }
   *
   * client.on('message', async message => { //Create message event
   *    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g) //Define args
   *    const command = args.shift().toLowerCase() //Define command
   *
   *    if (command === "play") { //Create new command
   *      const track = args.join(" ") //Define URL
   *      const result = await spotifyToYT.trackGet(track) //Obtain YouTube link of Spotify
   *      client.distube.play(message, result.url).catch(e => console.error(e)) //Play music with message parameter and result constant
   *    }
   * })
   */
  trackGet: async (url) => {
    if (!url) throw new Error("You did not specify the URL of Spotify!");
    await validateURL(url);
    let data = await getData(url);
    if (data.type === "track") {
      let query = `${data.name} ${data.artists.map((x) => x.name).join(" ")}`;
      let search = await ytsr(query, { limit: 1 });
      if (!search) throw new Error("I found no results on YouTube.");
      return {
        url: search[0].url,
        info: search,
      };
    } else throw new Error("The URL type is invalid!");
  },
  /**
   * Returns an Array of YouTube music URL's to play a playlist with your preferred music npm.
   * @param {String} url Spotify URL
   * @returns Array with YouTube URL's
   * @example
   * const Discord = require("discord.js") //Define Discord
   * const client = new Discord.Client() //Define client
   * const Distube = require("distube") //Define Distube
   * client.distube = new Distube(client, { searchSongs: 10 }) //Define Distube Client
   * const spotifyToYT = require("spotify-to-yt") //Define package
   * const settings = {
   *    prefix: "!", //Define bot prefix
   *    token: "Discord Bot Token" //Define bot token
   * }
   *
   * client.on('message', async message => { //Create message event
   *    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g) //Define args
   *    const command = args.shift().toLowerCase() //Define command
   *
   *    if (command === "playlist") { //Create new command
   *      const playlist = args.join(" ") //Define URL
   *      const result = await spotifyToYT.playListGet(playlist) //Obtain YouTube link of Spotify
   *      client.distube.playCustomresult(message, result.songs, { name: result.info.name, thumbnail: result.info.images[0].url, url: result.info.externals_url.spotify }).catch(e => console.error(e)) //Play playlist with message parameter, and get YouTube links of Spotify in Array
   *    }
   * })
   */
  playListGet: async (url) => {
    console.log(url)
    if (!url) throw new Error("You did not specify the URL of Spotify!");
    await validateURL(url);
    let data = await getData(url);
    let tracks = await getTracks(url);
    console.log(data)
    try {
      if (data.type !== "playlist") throw new Error("The URL is invalid!");
      var songs = [];
      for (const song of tracks) {
        let search = await ytsr(
          `${song.name} ${song.artists.map((x) => x.name).join(" ")}`,
          { limit: 1 }
        );
        console.log("\n\n",search)
        songs.push({title:song.name,url:search.items[0].url});
      }
      var infoPlayList = await getData(url);
      return {
        songs: songs,
        info: infoPlayList,
      };
    } catch (e) {
      throw new Error(
        "An error occurred while trying to get information from the specified playlist.\n" +
          e
      );
    }
  },
  /**
   * Returns a String, if it is a playlist or a track
   * @param {String} url
   * @returns String
   * @example
   * const Discord = require("discord.js") //Define Discord
   * const client = new Discord.Client() //Define client
   * const Distube = require("distube") //Define Distube
   * client.distube = new Distube(client, { searchSongs: 10 }) //Define Distube Client
   * const spotifyToYT = require("spotify-to-yt") //Define package
   * const settings = {
   *    prefix: "!", //Define bot prefix
   *    token: "Discord Bot Token" //Define bot token
   * }
   *
   * client.on('message', async message => { //Create message event
   *    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g) //Define args
   *    const command = args.shift().toLowerCase() //Define command
   *
   *    if (command === "spotifyvalidator") { //Create new command
   *      const result = await spotifyToYT.isTrackOrPlaylist(args.join(" ")) //Verify Spotify URL
   *      message.channel.send("The link is: " result) //Send message
   *    }
   * })
   */
  isTrackOrPlaylist: async (url) => {
    if (!url) throw new Error("You did not specify the URL of Spotify!");
    await validateURL(url);
    let data = await getData(url);
    return data.type;
  },
  /**
   * Validate a URL from Spotify and return a Boolean as the result
   * @param {String} url Spotify URL
   * @returns Boolean
   * @example
   * const Discord = require("discord.js") //Define Discord
   * const client = new Discord.Client() //Define client
   * const Distube = require("distube") //Define Distube
   * client.distube = new Distube(client, { searchSongs: 10 }) //Define Distube Client
   * const spotifyToYT = require("spotify-to-yt") //Define package
   * const settings = {
   *    prefix: "!", //Define bot prefix
   *    token: "Discord Bot Token" //Define bot token
   * }
   *
   * client.on('message', async message => { //Create message event
   *    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g) //Define args
   *    const command = args.shift().toLowerCase() //Define command
   *
   *    if (command === "validatelink") { //Create new command
   *      const result = await spotifyToYT.validateURL(args.join(" ")) //Validate Spotify URL
   *      if (result === false) return message.channel.send("The link is invalid!") //If the link is not valid, we make a conditional and put what we want it to return
   *    }
   * })
   */
  validateURL: async (url) => {
    console.log(url)
    if (!url) throw new Error("You did not specify the URL of Spotify!");
    if (typeof url !== "string") return false;
    let regexp =
      /(https?:\/\/open.spotify.com\/(playlist|track)\/[a-zA-Z0-9]+|spotify:(playlist|track):[a-zA-Z0-9])/g;
    if (regexp.test(url)) {
      let parsedURL = {};
      try {
        parsedURL = spotifyURI.parse(url);
        if (!supportedTypes.includes(parsedURL.type)) return false;
        if (!parsedURL) return false;
        return true;
      } catch (e) {
        return false;
      }
    } else return false;
  },
  /**
   * Search for tracks on Spotify, where it returns a URL
   * @param {String} search Term of search
   * @returns String
   * @example
   * const Discord = require("discord.js") //Define Discord
   * const client = new Discord.Client() //Define client
   * const Distube = require("distube") //Define Distube
   * client.distube = new Distube(client, { searchSongs: 10 }) //Define Distube Client
   * const spotifyToYT = require("spotify-to-yt") //Define package
   * const settings = {
   *    prefix: "!", //Define bot prefix
   *    token: "Discord Bot Token", //Define bot token
   *    clientID: "Client Spotify App ID", //Define Spotify Client ID, obtain of 'https://developer.spotify.com/dashboard/'
   *    secretKey: "Secret Key Spotify App" //Define Secret Key, obtain of 'https://developer.spotify.com/dashboard/'
   * }
   * spotifyToYT.setCredentials(settings.clientID, settings.secretKey) //Set credentials for method 'trackSearch'
   *
   * client.on('message', async message => { //Create message event
   *    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g) //Define args
   *    const command = args.shift().toLowerCase() //Define command
   *
   *    if (command === "spotify-search") { //Create new command
   *      const result = await spotifyToYT.trackSearch(args.join(" ")).catch(e => message.channel.send("No results")) //Declare result, with trackSearch property, and catch for errors
   *      message.channel.send(result.url) //Send message with URL of Spotify
   *    }
   * })
   */
  trackSearch: async (search) => {
    if (!search)
      throw new Error("You did not specify term of search on Spotify!");
    let term = await spotifySearch.search(search);
    let result;
    try {
      result = term;
    } catch (e) {
      result = undefined;
    }
    return {
      url: result.tracks.items[0].external_urls.spotify,
      info: result,
    };
  },
};

async function validateURL(url) {
  if (!url) throw new Error("You did not specify the URL of Spotify!");
  if (typeof url !== "string") throw new Error("This link is invalid!");
  let regexp =
    /(https?:\/\/open.spotify.com\/(playlist|track)\/[a-zA-Z0-9]+|spotify:(playlist|track):[a-zA-Z0-9])/g;
  if (regexp.test(url)) {
    let parsedURL = {};
    try {
      parsedURL = spotifyURI.parse(url);
      if (!supportedTypes.includes(parsedURL.type))
        throw new Error(
          "The specified URL is not of a valid type. Valid types: " +
            supportedTypes.join(", ")
        );
      if (!parsedURL)
        throw new Error(
          "An error occurred while trying to get information from the specified URL, verify that you have all the fields. If you're still having trouble, please report the bug on our Discord"
        );
      return true;
    } catch (e) {
      throw new Error("The link you entered is invalid!");
    }
  } else throw new Error("This link is invalid!");
}