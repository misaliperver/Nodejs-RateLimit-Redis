const redis = require('ioredis');
const express = require('express');
const app = express();
const port = process.env.PORT || 3002;


const client = redis.createClient({
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || 'localhost',
});

client.on('connect', function () { console.log('connected'); });

const limitControl = async function (ip) {
    let res = undefined;

    try {
      res = await client.incr(ip);
      if (res == 1) client.expire(ip, 10);
    } catch (err) {
      throw err;
    }

    console.log(`${ip} has value: ${res} ${new Date()}`);

    if (res > 10) return true;
    
}

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/test', async (req, res) => {
   
    let isOvered = await limitControl(req.ip);

    if (isOvered) {
        return res.status(429).send('Too many requests!');
    }

    res.send("Hello Tester!");
  });


app.listen(port, () => console.log(`Service start from ${port}`));