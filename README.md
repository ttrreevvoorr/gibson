# gibson
An unintrusive bot that adds missing functionality to your Discord server


## Commands:

### audioAdd
- `/audioAdd` `triggers:` `mp3:`

Adds a playable MP3 to the bot which plays when one of `triggers` is mentioned in any text channel by a user in voice chat with Gibson.

| param        | Description             | Example      |
|--------------|-------------------------|--------------|
| triggers     | comma separated strings | donation     |
| mp3          | A url to an MP3 or WAV  | https://...  |



### addCommand
- `/addCommand` `triggers:` `reaction:`

Allows Gibson to respond with predetermined text to any triggers

| param        | Description             | Example           |
|--------------|-------------------------|-------------------|
| triggers     | comma separated strings | sleepytime        |
| reaction     | A url to an MP3 or WAV  | it's slepy time!  |

```
/addCommand triggers:minecraft reaction:0.0.0.0
```
Now when typing !minecraft in any text channel, Gibson should send a message containing "0.0.0.0"



### addCommand
- `/addCommand` `triggers:` `reaction:`

Allows Gibson to respond with predetermined text to any triggers

| param        | Description             | Example           |
|--------------|-------------------------|-------------------|
| triggers     | comma separated strings | sleepytime        |
| reaction     | A url to an MP3 or WAV  | it's slepy time!  |

```
/addCommand triggers:minecraft reaction:0.0.0.0
```
Now when typing !minecraft in any text channel, Gibson should send a message containing "0.0.0.0"




## TODO

- Create a class for the audio player functionality. Important for leaving and joining and etc.
- /addpermission ??
- /addrole (gives urself a role? needs to be set up tho)

