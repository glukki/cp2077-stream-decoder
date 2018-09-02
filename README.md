Cyberpunk 2077 characters stream decoder
=====

Problem
-----
Grab characters from a 9 hours long video.
Characters is some base64 encoded data.
They say it's a 1920*1080 PNG image.
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
- [x] build characters images dictionary
      `node buildDictionary.js ./screenshots/000020.png ./screenshots/000931.png ./screenshots/001234.png ./screenshots/001783.png ./screenshots/002060.png`
- [x] convert screenshots to text
      `node recogniseText.js ./screenshots/`
- [ ] combine text from screenshots into one stream
      `node index.js`
