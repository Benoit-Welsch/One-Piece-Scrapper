# One-Piece-Scrapper
A application to download file from https://www.stream-vf.co/

# How to use 
Download one-piece episode from 390 to 399
```javascript
const ddl = require("./ddl");

for (let i = 0; i < 10; i++) {
  let url = "https://www.stream-vf.co/anime/one-piece-vostfr/episode-" + (390 + i)
  ddl(url)
}
```

# Console preview
![image](https://user-images.githubusercontent.com/56845767/115087642-cea1c980-9f0e-11eb-8b7d-e6a87907330d.png)

# To Do
- Scrap name and episode number from url
- Prevent rewrite
- Handle Error
