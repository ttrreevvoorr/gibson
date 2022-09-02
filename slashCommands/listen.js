const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const ytdl = require("ytdl-core")
const ytsr = require("ytsr")
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
    .setDescription("Shuffles the existing song queue")),

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
        console.log(AudioPlayerStatus.Idle)
        console.log(data)
        serverContruct = memory.getServerContruct(interaction.guild.id)
  
        serverContruct.songs.shift()
        serverContruct = memory.setServerQueue(interaction.guild.id, serverContruct.songs)
        return await play(serverContruct, interaction.guild, serverContruct.songs[0], memory)
      })

      serverContruct.player.on(AudioPlayerStatus.AutoPaused, () => {
        setTimeout(() => {
          serverContruct.player.unpause()
        }, 8500)
      })

      memory.setServerConnection(interaction.guild.id, serverContruct)
    }
    
    if (interaction.options.getSubcommand() === "pause") {
      if(serverContruct.player.pause()){
        const embed = new MessageEmbed()
        embed.setTitle("Pausing song.")
        embed.setColor("#00a663")
        embed.addField(`Requested by:`, `${interaction.member.nickname || interaction.member.user.username}`)
        serverContruct.textChannel.send({embeds: [embed]})
        
        return interaction.editReply("Gibson audio player has been paused.")
      }
      else {
        return interaction.editReply("This party doesn't stop!")
      }
    }
    else if (interaction.options.getSubcommand() === "stop") {
      serverContruct.songs = []
      interaction.editReply("Gibson audio player has halted.")

      const embed = new MessageEmbed()
      embed.setTitle("Stopping Gibson player.")
      embed.setColor("#00a663")
      embed.addField(`Requested by:`, `${interaction.member.nickname || interaction.member.user.username}`)
      serverContruct.textChannel.send({embeds: [embed]})
      
      serverContruct.player.stop()
      serverContruct.connection.destroy()
      serverContruct = {}
      serverContruct = memory.setServerConnection(interaction.guild.id, {songs:[]}, true)
      return
    }
    else if (interaction.options.getSubcommand() === "unpause") {
      const embed = new MessageEmbed()
      embed.setTitle(`Resuming: ${serverContruct.songs[0].title}`)
      embed.setColor("#00a663")
      embed.addField(`Requested by:`, `${interaction.member.nickname || interaction.member.user.username}`)
      serverContruct.textChannel.send({embeds: [embed]})

      interaction.editReply("Gibson audio player is resuming...")
      return serverContruct.player.unpause()
    }
    else if (interaction.options.getSubcommand() === "skip") {
      serverContruct.player.pause()
      interaction.editReply("Gibson audio player is skipping")

      const embed = new MessageEmbed()
      embed.setTitle(`Skipping ${serverContruct.songs[0].title}`)
      embed.setColor("#00a663")
      embed.setFooter(`Requested by: ${interaction.member.nickname || interaction.member.user.username}`)
      serverContruct.textChannel.send({embeds: [embed]})

      serverContruct.songs.shift()

      serverContruct = memory.setServerQueue(interaction.guild.id, serverContruct.songs)
      return await play(serverContruct, interaction.guild, serverContruct.songs[0], memory)
    }
    else if (interaction.options.getSubcommand() === "shuffle"){
      interaction.editReply("Gibson audio player is shuffling")

      const embed = new MessageEmbed()
      embed.setTitle(`Shuffling`)
      embed.setColor("#00a663")
      embed.setFooter(`Requested by: ${interaction.member.nickname || interaction.member.user.username}`)
      serverContruct.textChannel.send({embeds: [embed]})
      
      const shuffleArr = serverContruct.songs
      for (let i = shuffleArr.length - 1; i > 0; i--) {
        // Generate random number
         const j = Math.floor(Math.random() * (i + 1))
 
         const temp = shuffleArr[i]
         shuffleArr[i] = shuffleArr[j]
         shuffleArr[j] = temp
      }

      serverContruct.songs = shuffleArr

      serverContruct = memory.setServerQueue(interaction.guild.id, shuffleArr)
      return
    }

    const songURL = interaction.options.getString("song")

    let song,
      songInfo,
      youtubeURL = "",
      soundcloudURL = "",
      requested = interaction.member.nickname || interaction.member.user.username
    
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
    
    await interaction.followUp({ content: `Processing **${song.title}**...`, ephemeral: true });

    if (youtubeURL || soundcloudURL) {
      if (serverContruct.songs.length) {

        serverContruct = memory.appendToServerQueue(interaction.guild.id, song)
        const embed = new MessageEmbed()
        embed.setTitle("Queued:")
        embed.setColor("#00a663")
        embed.addField(`${song.title}:`, `[${song.url}](${song.url})`)
        embed.setFooter(`Requested by: ${song.requested}`)
        return interaction.channel.send({embeds: [embed]})
      }
      console.log("No queue!")
      serverContruct = memory.appendToServerQueue(interaction.guild.id, song)

      try {
        await play(serverContruct, interaction.guild, song)
      }
      catch (err) {
        console.log(err)
        memory.setServerQueue(interaction.guild.id, [])
        // queue.delete(interaction.guild.id)
        serverContruct.connection.destroy()
        serverContruct = memory.setServerConnection(interaction.guild.id, {songs:[]}, true)
        return interaction.editReply(err)
      }
    }
  }
}


const play = async (serverContruct, guild, song) => {
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
    embed.addField(`${song.title}:`, `[${song.url}](${song.url})`)
    embed.addField(`Requested by:`, `${song.requested}`)
    serverContruct.textChannel.send({embeds: [embed]})
  }
  catch(err){
    console.error(err)
    serverContruct.textChannel.send(`There was an issue processing [${song.title}](${song.url})`)
    
    serverContruct.songs.shift()

    serverContruct = memory.setServerQueue(interaction.guild.id, serverContruct.songs)
    return await play(serverContruct, interaction.guild, serverContruct.songs[0], memory)
  }
}
