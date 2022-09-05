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
   */
  playListGet: async (url) => {
    if (!url) throw new Error("You did not specify the URL of Spotify!");
    await validateURL(url);
    let data = await getData(url);
    let tracks = await getTracks(url);
    try {
      if (data.type !== "playlist") throw new Error("The URL is invalid!");
      var songs = [];
      for (const song of tracks) {
        let search = await ytsr(
          `${song.name} ${song.artists.map((x) => x.name).join(" ")}`,
          { limit: 1 }
        );
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
   * Search for tracks on Spotify, where it returns a URL
   * @param {String} search Term of search
   * @returns String
   * @example
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
