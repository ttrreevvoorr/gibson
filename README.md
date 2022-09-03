<p align="center">
    <img width="200" src="https://i.imgur.com/SOx6dR1.png" alt="gibson's avatar image">
</p>


# Gibson

An unintrusive bot that adds missing functionality to your Discord server.

Any alterations or restributions of this project MUST follow the license and be provided not only for free, but with open source. If you can not adhere to the license, write your own bot.

This was originally written and created in August 2021. It has been 1 year since inception so I am making the source public.

You may host this yourself, or run the version I have hosted:

<https://discord.com/oauth2/authorize?client_id=880346290490322975&permissions=37080919104&scope=bot+applications.commands>


## Commands:

### /audioAdd
`/audioAdd` `triggers:` `mp3:`

Gibson wil play an audio file in a voice channel if any of `triggers` is sent in any text channel by a user in voice chat with Gibson.

| param        | Description             | Example      |
|--------------|-------------------------|--------------|
| triggers     | A comma separated list of strings that will trigger the audio | donation,dono     |
| mp3          | A direct url to an MP3 or WAV  | https://...  |

Example: `/audioadd triggers:nope mp3:https://www.somewebsite.com/sound/nope.mp3`

---

### /addCommand
`/addCommand` `triggers:` `reaction:`

Adds a bang command `!command` to Gibson, allowing predetermined responses.

| param        | Description             | Example           |
|--------------|-------------------------|-------------------|
| triggers     | A comma separated list of strings that will trigger the response | mc,minecraft     |
| reaction     | A url to an MP3 or WAV  | 0.0.0.0  |

Example: `/addCommand triggers:mc,minecraft reaction:**This is the minecraft server ip:** 0.0.0.0`

Now when sending the message `!minecraft` or `!mc` in any text channel, Gibson will send respond with "0.0.0.0"

<img width="450" src="https://imgur.com/HaRC2Vg.png" alt="screenshot of gibson's response to creating a command, and response to the command itself">

---

### /deletecommand
`/deletecommand` `trigger:`

Removes a bang command `!command` from Gibson, removing the existing predetermined response.

| param        | Description             | Example           |
|--------------|-------------------------|-------------------|
| trigger     | The trigger you want deleted | minecraft     |

Example: `/deletecommand triggers:minecraft`

Now when sending the message `!minecraft` or `!mc` in any text channel, Gibson will send respond with "0.0.0.0"

<img width="400" src="https://imgur.com/t0W5Xtd.png" alt="screenshot of gibson response to deleteing a command">

---


### /dice
`/dice` `number:`

Rolls a dice for you, with number being the max sides of the dice. Defaults to 6.

| param      | Description             | Example           |
|------------|-------------------------|-------------------|
| number     | Allows you to roll a dice with more or less than 6 sides. Default is 6. | 12     |

Example: `/dice number:12`

<img width="400" src="https://imgur.com/vpK7bVz.png" alt="screenshot of gibson saying, buttface6t4 rolled a 2 on a 12-sided dice!'">

---

### /help
`/help` `command:`

Returns information about a command within Discord, similar to `man` or `manual`.

| param       | Description             | Example           |
|-------------|-------------------------|-------------------|
| command     | The command you need help with | poll     |

<img width="300" src="https://imgur.com/L9MIHMa.png" alt="screenshot of gibson help interface">

<img width="500" src="https://imgur.com/q0y9bCL.png" alt="screenshot of gibson's response to /help command:/poll">

---

### /remind
`/remind` `channel:` `about:` `in:`

Gibson will send a predetermined message (about) in a specific channel in X seconds/hours/minutes/days.

| param        | Description                  | Example           |
|--------------|------------------------------|-------------------|
| channel      | where the msg should be sent | #general          |
| about        | The 'reminder' to be setn    | Last call to RSVP |
| in           | A url to an MP3 or WAV       | it's slepy time!  |

Example: `/remind channel:#general about:Don't forget, last call to RSVP for Street Fighter tournament is this Friday! in:72 hours`

<img width="500" src="https://imgur.com/Co6i2ps.png" alt="screenshot of gibson reminding a channel">

---

### /listen
- `/listen` `play:` 
- `/listen` `pause` 
- `/listen` `unpause` 
- `/listen` `skip` 
- `/listen` `stop` 
- `/listen` `shuffle` 

These commands allow Gibson to play music in voice channels. The above commands should be self explanitory, so only **/listen play** will be described below:

| param        | Description                  | Example           |
|--------------|------------------------------|-------------------|
| play         | The song you want to play    | Careless Whisper by Geoerge Michaels |


Examples:
- `/listen play: Careless Whisper by Geoerge Michaels`
- `/listen play: https://www.youtube.com/watch?v=izGwDsrQ1eQ`
- `/listen play: https://soundcloud.com/goodsociety/lophiile-see-thru`

<img  width="400" src="https://imgur.com/TOkoQ9i.png" alt="screenshot of a gibson playing music">

---


### /poll
`/poll` `question:` `choices:` `expires:`

Gibson will send a predetermined message (about) in a specific channel in X seconds/hours/minutes/days.

| Param     | Description                    | Example                         |
|-----------|--------------------------------|---------------------------------|
| question  | The question to be polled,     | `Which do you prefer?`          |
| choices   | The options being provided     | `breakfast,lunch,dinner,desert` |
| expires   | When the poll expires, seconds, defaults to 30s | 600      |

Examples: 
- `/poll question:Which do you prefer? choices:breakfast,lunch,dinner,desert expires:600`
- `/poll question:What do we play tonight? choices:chess,checkers,uno,monopoly`

<img width="500" src="https://imgur.com/nl7Dmh7.png" alt="screenshot of a poll">

