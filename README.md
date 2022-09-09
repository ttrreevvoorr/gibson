<p align="center">
    <img width="200" src="https://i.imgur.com/SOx6dR1.png" alt="gibson's avatar image">
</p>


# Gibson

An unintrusive bot that adds missing functionality to your Discord server.

This was originally written and created in August 2021. It has been 1 year since inception so I am making the source public. You may host this yourself, or run the version I have hosted:

<https://discord.com/oauth2/authorize?client_id=880346290490322975&permissions=37080919104&scope=bot+applications.commands>

<p align="center">
	<a target="_blank" href="https://discord.gg/XJ3D33zGTz"><img width="200" src="https://i.imgur.com/kQ481n2.png" alt="gibson's avatar image"></a>
</p>



## Table of contents
1. [Commands](#commands)
    - [/audioadd](#audioadd)
    - [/addCommand](#addcommand)
    - [/deleteCommand](#deletecommand)
    - [/editCommand](#editcommand)
    - [/dice](#dice)
    - [/remind](#remind)
    - [/listen](#listen)
      - [/listen play](#listenplay)
      - [/listen pause](#listenpause)
      - [/listen unpause](#listenunpause)
      - [/listen remove](#listenremove)
      - [/listen queue](#listenqueue)
      - [/listen skip](#listenskip)
      - [/listen shuffle](#listenshuffle)
    - [/poll](#poll)

## Commands:<a name="commands"></a>

### /audioAdd<a name="audioadd"></a>
`/audioAdd` `triggers:` `mp3:`

Gibson wil play an audio file in a voice channel if any of `triggers` is sent in any text channel by a user in voice chat with Gibson.

| param        | Description             | Example      |
|--------------|-------------------------|--------------|
| triggers     | A comma separated list of strings that will trigger the audio | donation,dono     |
| mp3          | A direct url to an MP3 or WAV  | https://...  |

Example: `/audioadd triggers:nope mp3:https://www.somewebsite.com/sound/nope.mp3`

---

### /addCommand<a name="addcommand"></a>
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

### /deleteCommand<a name="deletecommand"></a>
`/deltecommand` `trigger:`

Removes a bang command `!command` from Gibson, removing the existing predetermined response.

| param        | Description             | Example           |
|--------------|-------------------------|-------------------|
| trigger     | The trigger you want deleted | minecraft     |

Example: `/deletecommand triggers:minecraft`

Now when sending the message `!minecraft` or `!mc` in any text channel, Gibson will send respond with "0.0.0.0"

<img width="400" src="https://imgur.com/t0W5Xtd.png" alt="screenshot of gibson response to deleteing a command">

---


### /dice<a name="dice"></a>
`/dice` `number:`

Rolls a dice for you, with number being the max sides of the dice. Defaults to 6.

| param      | Description             | Example           |
|------------|-------------------------|-------------------|
| number     | Allows you to roll a dice with more or less than 6 sides. Default is 6. | 12     |

Example: `/dice number:12`

<img width="400" src="https://imgur.com/vpK7bVz.png" alt="screenshot of gibson saying, buttface6t4 rolled a 2 on a 12-sided dice!'">

---

### /help<a name="help"></a>
`/help` `command:`

Returns information about a command within Discord, similar to `man` or `manual`.

| param       | Description             | Example           |
|-------------|-------------------------|-------------------|
| command     | The command you need help with | poll     |

<img width="300" src="https://imgur.com/L9MIHMa.png" alt="screenshot of gibson help interface">

<img width="500" src="https://imgur.com/q0y9bCL.png" alt="screenshot of gibson's response to /help command:/poll">

---

### /remind<a name="remind"></a>
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

### /listen<a name="listen"></a>
- `/listen` `play` `song:` 
- `/listen` `pause` 
- `/listen` `unpause` 
- `/listen` `remove` `number:`
- `/listen` `skip` 
- `/listen` `stop` 
- `/listen` `shuffle` 

<img width="450" src="https://i.imgur.com/O1IOqpy.png" alt="screenshot of Gibson's autocomplete response list on /listen">


#### play<a name="listenplay"></a>

You must be in a voice channel to use this command. Gibson will join the channel you are in, find the song you requested it, and begin playing the song (via YouTube) in the voice channel. If a song is already being played, or there is a queue, the song is added to the end of the queue.

| param        | Description                  | Example           |
|--------------|------------------------------|-------------------|
| song         | The song you want to play, by song name and artist, Youtube url, Soundcloud url, or Spotify playlist url.    | Careless Whisper by George Michael |

Examples:
- `/listen play: Careless Whisper by Geoerge Michaels`
- `/listen play: https://www.youtube.com/watch?v=izGwDsrQ1eQ`
- `/listen play: https://soundcloud.com/goodsociety/lophiile-see-thru`
- `/listen play: https://open.spotify.com/playlist/5ZYRTvwmGrp5016IgpzdVP?si=c6e2e8b90bf9445d`

<img  width="400" src="https://imgur.com/TOkoQ9i.png" alt="screenshot of a Gibson's channel messages when playing music">

#### pause<a name="listenpause"></a>

Pauses Gibson. To resume, see `/listen unpause`

Useage:
```
/listen pause
```

#### unpause<a name="listenunpause"></a>

Resumes Gibson if paused. See `/listen pause`

Useage:
```
/listen unpause
```

#### remove<a name="listenremove"></a>

Allows you to remove a song from the queue using its number in queue. The queue numbers are returned with both `/listen queue` and `/listen shuffle`. Keep in mind that the queue numbers will change as you remove them and as songs play. To ensure you are removing the correct song, use `/listen queue` before using `/listen remove`

| param        | Description                  | Example           |
|--------------|------------------------------|-------------------|
| number       | The song number in queue that you want removed   | 4 |


Examples:
- `/listen remove: 8`

<img  width="300" src="https://i.imgur.com/9DjrIGR.png" alt="screenshot of a Gibson returning a queue, and a song removal message">

#### queue<a name="listenqueue"></a>

Returns the song currently playing along will all upcoming songs and their queue numbers.

Useage:
```
/listen queue
```

#### skip<a name="listenskip"></a>

Stops playing the current song, and begins playing the next song in queue.

Useage:
```
/listen skip
```

#### stop<a name="listenstop"></a>

Halts the Gibson audio player, removes all songs from queue, and leaves the voice channel.

Useage:
```
/listen stop
```

#### shuffle<a name="listenshuffle"></a>

Shuffles, or re-orders, all of the upcoming songs in queue. This returns queue numbers that can be used in `/listen remove number:#`

Useage:
```
/listen shuffle
```

<img width="300" src="https://i.imgur.com/rMG2oyK.png" alt="screenshot of Gibson's response to /listen shuffle, showing the resulting queue">

---


### /poll<a name="listenpoll"></a>

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

