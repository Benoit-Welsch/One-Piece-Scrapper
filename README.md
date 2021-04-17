# One-Piece-Scrapper
A application to download file from https://www.stream-vf.co/

# How to use 
Download one-piece episode from 470 to 481
```javascript
const Episode = require('./episode');
const Manager = require('./manager');

const manager = new Manager();

for (let i = 0; i < 12; i++) {
  manager.push(new Episode("https://www.stream-vf.co/anime/one-piece-vostfr/episode-" + (470 + i)));
  //episode.ddl('./output/');
}

manager.download();
```

# Console preview
![image](https://user-images.githubusercontent.com/56845767/115112963-29c3d280-9f88-11eb-9c22-bc6409cc5992.png)

# To Do
- Prevent rewrite
- Handle Error
