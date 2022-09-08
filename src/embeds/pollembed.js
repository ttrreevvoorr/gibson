const { CommandInteractionOptionResolver } = require("discord.js")
const { MessageEmbed } = require("discord.js")

const defEmojiList = [
  "\u0031\u20E3",
  "\u0032\u20E3",
  "\u0033\u20E3",
  "\u0034\u20E3",
  "\u0035\u20E3",
  "\u0036\u20E3",
  "\u0037\u20E3",
  "\u0038\u20E3",
  "\u0039\u20E3",
  "\uD83D\uDD1F"
]

const pollEmbed = async (interaction, title, options, timeout = 30, emojiList = defEmojiList.slice(), forceEndPollEmoji = "\u2705") => {
  if (!interaction && !interaction.channel) return interaction.editReply("Channel is inaccessible.")
  if (!title) return interaction.editReply("Poll title is not given.")
  if (!title.length > 256) return interaction.editReply("Poll title can't be longer than 256 characters.")
  if (!options) return interaction.editReply("Poll options were not given.")
  if (options.length < 2) return interaction.editReply("Please provide more than one choice.")
  if (options.length > emojiList.length) return interaction.editReply(`Please provide ${emojiList.length} or less choices.`)

  let text = ``
  
  const emojiInfo = {}
  let totalVotes = 0

  for (const option of options) {
    const emoji = emojiList.splice(0, 1)
    emojiInfo[emoji] = { option: option, votes: 0 }
    text += `${emoji} : \`${option}\`\n\n`
  }
  text += `*To vote, react using the correspoding emoji. Voting will end in **${timeout} seconds**.\nPoll creater can end the poll with ${forceEndPollEmoji}.*`
  const usedEmojis = Object.keys(emojiInfo)
  // emojiInfo[forceEndPollEmoji] = {option: "end", votes: 0}

  usedEmojis.push(forceEndPollEmoji)

  interaction.channel.send({embeds:[embedBuilder(title, interaction.member.user.username).setDescription(text)]}).then(message =>{
    const filter = (reaction, user) => {
      return usedEmojis.includes(reaction.emoji.name) && !user.bot
    }
    
    const reactionCollector = message.createReactionCollector({ filter, time: timeout * 1000 })

    for (const emoji of usedEmojis) message.react(emoji)
    
    const voterInfo = new Map()
  
    reactionCollector.on("collect", (reaction, user) => {  
      if (usedEmojis.includes(reaction.emoji.name)) {
        if (reaction.emoji.name === forceEndPollEmoji && user.id === interaction.member.user.id) {
          return reactionCollector.stop()
        }
        if (!voterInfo.has(user.id)) {
          voterInfo.set(user.id, { emoji: reaction.emoji.name })
        }
  
        const votedEmoji = voterInfo.get(user.id).emoji
        if (votedEmoji !== reaction.emoji.name) {
          const lastVote = message.reactions.cache.get(votedEmoji)
          lastVote.count -= 1
          lastVote.users.remove(user.id)
          emojiInfo[votedEmoji].votes -= 1
          totalVotes -= 1
          voterInfo.set(user.id, { emoji: reaction.emoji.name })
        }
        if(reaction.emoji.name){
          emojiInfo[reaction.emoji.name] ? emojiInfo[reaction.emoji.name].votes += 1 : emojiInfo[reaction.emoji.name].votes = 1
        }
        totalVotes += 1
      }
    })
  
    reactionCollector.on("dispose", (reaction, user) => {
      if (usedEmojis.includes(reaction.emoji.name)) {
        voterInfo.delete(user.id)
        emojiInfo[reaction.emoji.name].votes -= 1
      }
    })
  
    reactionCollector.on("end", () => {
      text = `${timeout} seconds are up! The poll has ended.\n Results are in:\n\n`
      
      for (const emoji in emojiInfo) {
        let percent = Math.floor(((emojiInfo[emoji].votes / totalVotes) * 100)) || 0
        text += `**${emojiInfo[emoji].option}**: \`${percent}%\`\n` 
        let i = 0
        while(i <= percent / 5) {
          text += `❚`
          i+=1
        };
        text += ` \`${emojiInfo[emoji].votes} votes\`\n\n`
      }
      try {
        message.delete()
        return interaction.followUp({embeds:[embedBuilder(title, interaction.member.user.username).setDescription(text)]})
      }
      catch(err){
        console.log("error",err)
      }
    })

  })
}

const embedBuilder = (title, author) => {
  return new MessageEmbed()
    .setTitle(`:ballot_box: POLL: ${title}`)
    .setColor("#8f7ee5")
    .setFooter(`Poll created by ${author}`)
}

module.exports = pollEmbed