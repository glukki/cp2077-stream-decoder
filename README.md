Cyberpunk 2077 characters stream decoder
=====

Problem
-----

Grab characters from a 9 hours long video.
- Stream + Demo: https://www.twitch.tv/videos/302423092
- Demo only: https://www.youtube.com/watch?v=vjF9GgrY9c0
- Game website: https://www.cyberpunk.net

Approach
-----
- [x] download video
      `youtube-dl https://www.twitch.tv/videos/302423092`
- [X] take screenshot from video every 15 seconds
      `ffmpeg -i video.mp4 -vf fps=1/15 ./screenshots/%06d.png`
- [x] slice screenshot on images of separate characters
- [x] compute difference between 2 characters
- [ ] build characters images dictionary
- [ ] convert screenshots to text
- [ ] combine text from screenshots into one stream
