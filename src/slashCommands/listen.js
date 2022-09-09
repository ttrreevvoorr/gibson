require('dotenv').config()
const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const ytdl = require("ytdl-core")
const ytsr = require("ytsr")

const spotifyToYT = require("../utils/spotifyToYT.js")

const scdl = require("soundcloud-downloader").default
const scClientId = process.env.SOUNDCLOUD_ID

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice")

// const player = createAudioPlayer()
const queue = new Map()

module.exports = {
  data: new SlashCommandBuilder()
  .setName("listen")
  .setDescription("Plays a song or adds it to queue")
  .addSubcommand(subcommand =>
    subcommand
    .setName("play")
    .setDescription("Plays a song in the voice channel you're in")
    .addStringOption(option => option.setName("song").setDescription("Song artist and title, or a YouTube or Soundcloud URL").setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
    .setName("pause")
    .setDescription("Pauses the current track"))
  .addSubcommand(subcommand =>
    subcommand
    .setName("remove")
    .setDescription("Removes a song by its placement in queue")
    .addStringOption(option => option.setName("songid").setDescription("Use /listen queue to find the songId you want to remove from queue").setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
    .setName("skip")
    .setDescription("Skips the song playing"))
  .addSubcommand(subcommand =>
    subcommand
    .setName("unpause")
    .setDescription("Resumes the audio player"))
  .addSubcommand(subcommand =>
    subcommand
    .setName("stop")
    .setDescription("Halts the player and deletes the queue"))
  .addSubcommand(subcommand =>
    subcommand
    .setName("shuffle")
    .setDescription("Shuffles the existing song queue"))
  .addSubcommand(subcommand =>
    subcommand
    .setName("queue")
    .setDescription("Returns the current song queue")),

  async execute(interaction, memory) {
    await interaction.deferReply({ ephemeral: true })
    const voiceChannel = interaction.member.voice.channel
    if(!voiceChannel){
      return interaction.editReply({content: "You need to be in a voice channel to play music!", ephemeral: true})
    }
    const permissions = voiceChannel.permissionsFor(interaction.client.user)
    if(!permissions.has("CONNECT") || !permissions.has("SPEAK")){
      return interaction.editReply({content: "I need the permissions to join and speak in your voice channel!", ephemeral: true})
    }

    // Prepare connection
    let serverContruct = memory.getServerContruct(interaction.guild.id)

    serverContruct.textChannel = interaction.channel

    if(!serverContruct.voiceChannel || !serverContruct.player){
      let connection = joinVoiceChannel({
        channelId:      interaction.member.voice.channel.id,
        guildId:        interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      })
      serverContruct.player = createAudioPlayer()
      serverContruct.connection = connection
      serverContruct.connection.subscribe(serverContruct.player)
      serverContruct = {
        ...serverContruct,
        voiceChannel: voiceChannel,
        songs: [],
        volume: 5,
        playing: true
      }

      serverContruct.player.on('error', async error => {
        console.error(`Error: ${error} with resource`)
        if(!serverContruct.player.unpause()){
          return await play(serverContruct, interaction.guild, serverContruct.songs[0], memory)
        }
      })

      serverContruct.player.on(AudioPlayerStatus.Idle, async (data) => {
        serverContruct = memory.getServerContruct(interaction.guild.id)

        serverContruct.songs.shift()
        serverContruct = memory.setServerQueue(interaction.guild.id, serverContruct.songs)

        if(!serverContruct.songs.length){
          serverContruct.player.stop()
          serverContruct.connection.destroy()
          serverContruct = {}
          return serverContruct = memory.setServerConnection(interaction.guild.id, {songs:[]}, true)
        }
        return await play(serverContruct, interaction.guild, serverContruct.songs[0], memory)
      })

      serverContruct.player.on(AudioPlayerStatus.AutoPaused, () => {
        embed.setTitle("Something went wrong")
        embed.setColor("#FF0000")
        embed.addFields({
          name: `Gibson failed to operate accordinfly`, 
          value: `Please try again shortly.`
        })
        return interaction.channel.send({embeds: [embed]})
      })

      memory.setServerConnection(interaction.guild.id, serverContruct)
    }
    
    const embed = new MessageEmbed()
    let currentSong,
      song,
      songInfo,
      songList,
      playlistInfo = {},
      youtubeURL = "",
      soundcloudURL = "",
      requested = interaction.member.nickname || interaction.member.user.username,
      queueList = []
      
    switch(interaction.options.getSubcommand()){
      // PAUSE
      case "pause":
        if(serverContruct.player.pause()){
          embed.setTitle("Pausing song.")
          embed.setColor("#00a663")
          embed.addFields({
            name: `Requested by:`, 
            value: `${interaction.member.nickname || interaction.member.user.username}`
          })
          serverContruct.textChannel.send({embeds: [embed]})
          return interaction.editReply("Gibson audio player has been paused.")
        }
        else {
          return interaction.editReply("This party doesn't stop!")
        }
      break;
      
      // PLAY
      case "play":
        const songURL = interaction.options.getString("song")

        if(!songURL){
          return interaction.editReply("There was no song identified in your command. Please try again.")
        }

        if(songURL.includes("youtube.com") || songURL.includes("youtu.be")){
          youtubeURL = songURL
          songInfo = await ytdl.getInfo(youtubeURL)
          song = {
            title: songInfo.videoDetails.title,
            url:   songInfo.videoDetails.video_url,
            type:  "youtube",
            requested
          }
        }
        else if(songURL.includes("soundcloud.com") || songURL.includes("soundcloud.app")){
          soundcloudURL = songURL
          songInfo = await scdl.getInfo(soundcloudURL, scClientId)
          song = {
            title: songInfo.title,
            url:   songInfo.permalink_url,
            type:  "soundcloud",
            requested
          }
        }
        else if (songURL.includes("spotify")) {
          spotifyPlaylist = true
          playlistInfo = await spotifyToYT.playListGet(songURL)

          song = playlistInfo.songs.map(song => {
            return {
              title: song.title,
              url: song.url,
              type: "youtube",
              requested
            }
          })
        }
        else {
          const searchResults = await ytsr(songURL, {limit: 10});
          if(searchResults.items[0]){
            youtubeURL = searchResults.items[0].url
            songInfo = await ytdl.getInfo(youtubeURL)
            song = {
              title: songInfo.videoDetails.title,
              url:   songInfo.videoDetails.video_url,
              type:  "youtube",
              requested
            }
          } 
          else {
            return interaction.editReply({
              content: `Could not identify a song in YouTube titled ${songURL}`,
              ephemeral: true
            })
          }
        }

        if(Array.isArray(song)){
          const currentQueueLength = serverContruct.songs.length
          let content = "Processing:"

          song.map(s => {
            content += `\n- ${s.title}`
            serverContruct = memory.appendToServerQueue(interaction.guild.id, s)
          })
          await interaction.followUp({content, ephemeral: true})

          embed.setTitle("Queued:")
          embed.setColor("#00a663")
          embed.addFields({
            name: `${playlistInfo.info.name}:`, 
            value: `${playlistInfo.info.external_urls.spotify}`
          })
          embed.setFooter({text:`Requested by: ${song[0].requested}`})
          
          if(currentQueueLength){
            return interaction.channel.send({embeds: [embed]})
          }
        }
        else {
          await interaction.followUp({ content: `Processing **${song.title}**...`, ephemeral: true })
        
          if (youtubeURL || soundcloudURL) {
            if (serverContruct.songs.length) {

              serverContruct = memory.appendToServerQueue(interaction.guild.id, song)
              embed.setTitle("Queued:")
              embed.setColor("#00a663")
              embed.addFields({
                name: `${song.title}:`, 
                value: `[${song.url}](${song.url})`
              })
              embed.setFooter({text:`Requested by: ${song.requested}`})
              console.log(`${interaction.guild.id || guild.id}: Queued ${song.title}`)
              return interaction.channel.send({embeds: [embed]})
            }
            serverContruct = memory.appendToServerQueue(interaction.guild.id, song)
          }
        }

        try {
          await play(serverContruct, interaction.guild, song[0] || song, memory)
        }
        catch (err) {
          return interaction.editReply(err)
        }

      break;

      // QUEUE
      case "queue": 
        interaction.editReply("Gibson audio player returning queue")
        embed.setTitle(`Song Queue:`)
        embed.setColor("#c5d9ff")
        embed.setFooter({
          text: `Requested by: ${interaction.member.nickname || interaction.member.user.username}`
        })
        currentSong = serverContruct.songs[0]
        queueList = serverContruct.songs
        queueList.shift()

        songList = ''
        embed.addFields({
          name: `Currently playing: ${currentSong.title}`,
          value: `Requested by ${currentSong.requested}`
        })

        queueList.map((song,i) => {
          if(songList.length<1000){
            songList += `\n${[i+2]} - ${song.title}`
          }
        })
        embed.addFields({
          name: `Next up:`,
          value: songList
        })

        serverContruct.textChannel.send({embeds: [embed]})
        return serverContruct = memory.setServerQueue(interaction.guild.id, [currentSong, ...serverContruct.songs])
      break;

      // REMOVE
      case "remove": 
        interaction.editReply("Removing song from queue...")
        const songInt = parseInt(interaction.options.getString("songid"))-1

        if(!songInt || typeof songInt !== 'number' || songInt <= 0){
          return interaction.editReply("Gibson audio player can not remove that songId")
        }
        
        queueList = serverContruct.songs
        const removedSong = queueList.splice(songInt,1)[0]
        console.log(queueList)
        console.log(removedSong)
        embed.setTitle(`Removing ${removedSong.title} from queue:`)
        embed.setColor("#0b5e70")
        embed.setFooter({
          text: `Requested by: ${interaction.member.nickname || interaction.member.user.username}`
        })
        
        serverContruct = memory.setServerQueue(interaction.guild.id, queueList)
        return serverContruct.textChannel.send({embeds: [embed]})

      break;

      // UNPAUSE
      case "unpause": 
        embed.setTitle(`Resuming: ${serverContruct.songs[0].title}`)
        embed.setColor("#00a663")
        embed.addFields({
          name: `Requested by:`, 
          value: `${interaction.member.nickname || interaction.member.user.username}`
        })
        serverContruct.textChannel.send({embeds: [embed]})

        interaction.editReply("Gibson audio player is resuming...")
        return serverContruct.player.unpause()
      break;

      // SHUFFLE
      case "shuffle": 
        interaction.editReply("Gibson audio player is shuffling")

        embed.setTitle(`Shuffling ${serverContruct.songs.length} songs`)
        embed.setColor("#00a663")
        embed.setFooter({
          text: `Requested by: ${interaction.member.nickname || interaction.member.user.username}`
        })
        currentSong = serverContruct.songs[0]
        const shuffleArr = serverContruct.songs
        shuffleArr.shift()

        for (let i = shuffleArr.length - 1; i > 0; i--) {
          // Generate random number
          const j = Math.floor(Math.random() * (i + 1))
 
          const temp = shuffleArr[i]
          shuffleArr[i] = shuffleArr[j]
          shuffleArr[j] = temp
        }
        
        serverContruct.songs = [currentSong, ...shuffleArr]

        embed.addFields({
          name: `Currently playing: ${currentSong.title}`,
          value: `Requested by ${currentSong.requested}`
        })
        songList = ''
        shuffleArr.map((song,i) => {
          if(songList.length<1000){
            songList += `\n${[i+2]} - ${song.title}`
          }
        })
        embed.addFields({
          name: `Next up:`,
          value: songList
        })
        serverContruct.textChannel.send({embeds: [embed]})

        return serverContruct = memory.setServerQueue(interaction.guild.id, serverContruct.songs)
      break;

      // SKIP
      case "skip": 
        serverContruct.player.pause()
        interaction.editReply("Gibson audio player is skipping")

        embed.setTitle(`Skipping ${serverContruct.songs[0].title}`)
        embed.setColor("#00a663")
        embed.setFooter({
          text: `Requested by: ${interaction.member.nickname || interaction.member.user.username}`
        })
        serverContruct.textChannel.send({embeds: [embed]})

        serverContruct.songs.shift()

        serverContruct = memory.setServerQueue(interaction.guild.id, serverContruct.songs)
        return await play(serverContruct, interaction.guild, serverContruct.songs[0], memory)
      break;

      // STOP
      case "stop": 
        serverContruct.songs = []
        interaction.editReply("Gibson audio player has halted.")

        embed.setTitle("Stopping Gibson player.")
        embed.setColor("#00a663")
        embed.addFields({
          name: `Requested by:`, 
          value: `${interaction.member.nickname || interaction.member.user.username}`
        })
        serverContruct.textChannel.send({embeds: [embed]})
        
        serverContruct.player.stop()
        serverContruct.connection.destroy()
        serverContruct = {}
        return serverContruct = memory.setServerConnection(interaction.guild.id, {songs:[]}, true)
      break;
    }


  }
}


const play = async (serverContruct, guild, song, memory) => {
  if (!song) {
    queue.delete(guild.id)
    return
  }
  if(!serverContruct.connection){
    serverContruct.connection.subscribe(serverContruct.player)
  }

  let resource
  if(song.type === "youtube"){
    resource = createAudioResource(await ytdl(song.url, { quality: 'highestaudio', highWaterMark: 1 << 25, filter: "audioonly"}))
  }
  else if(song.type === "soundcloud") {
    await scdl.download(song.url, scClientId).then(stream => resource = createAudioResource(stream))
  }
  try {
    await new Promise(done => setTimeout(done, 3550))
    serverContruct.player.play(resource) || serverContruct.player.unpause()

    const embed = new MessageEmbed()
    embed.setTitle("Started playing:")
    embed.setColor("#04ea8e")
    embed.addFields({
      name: `${song.title}:`, 
      value: `[${song.url}](${song.url})`
    },
    {
      name: `Requested by:`, 
      value: `${song.requested}`
    })
    console.log(`${guild.id}: Started playing ${song.title}`)
    serverContruct.textChannel.send({embeds: [embed]})
  }
  catch(err){
    serverContruct.textChannel.send(`There was an issue processing [${song.title}](${song.url})`)
    console.log(`${guild.id}: There was an issue processing [${song.title}](${song.url}:\n`,err)
    
    serverContruct.songs.shift()

    serverContruct = memory.setServerQueue(guild.id, serverContruct.songs)
    return await play(serverContruct, guild, serverContruct.songs[0], memory)
  }
}
