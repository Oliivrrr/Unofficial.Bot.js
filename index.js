const { Client, Events, GatewayIntentBits, ActivityType  } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


//var googleTranslateApi = require("@vitalets/google-translate-api")
//const translate = require('@vitalets/google-translate-api');

const WebSocket = require('ws');
const botinfo = require('./botinfo.json');

const wssv = new WebSocket.Server({
    port: botinfo.port
});

//const { translate } = require('free-translate');

var prefix = "?";

client.on("ready", () => {
  console.log("Bot Online!");
  client.user.setActivity(
    {
        name: `0 player(s) on BPU`,
        type: ActivityType.Watching
  });
});

client.on("messageCreate", (message) => {
  if (message.channelId == 973328392571215942 && !message.author.bot) {
    wssv.clients.forEach(function (sclient) {
      sclient.send(`discordmsg/${message.author.username}: ${message}`);
    });
  }
});

wssv.on('connection', function (socket) {
  // Some feedback on the console
  console.log("A client just connected");

  // Attach some behavior to the incoming socket
  socket.on('message', function (msg) {
      var splitText = msg.toString().split('/');
      if(splitText[0] != botinfo.pass)
        return;

      if(splitText[1] == "message"){
        wssv.clients.forEach(function (sclient) {
          jsonObject = JSON.parse(splitText[2]);

          const transObj = {
            author: jsonObject.author,
            originalmsg: jsonObject.originalmsg,
            languageCodes: jsonObject.languageCodes
          }

          transObj.languageCodes.forEach(async function(item, i) {


            translate(transObj.originalmsg, {to: item}).then(res => {
              sclient.send(`translation/${res.text}/${item}/${transObj.author}`);
            }).catch(err => {
                console.error(err);
            });




            /*const translatedText = await translate(transObj.originalmsg, { to: item });
            console.log(`translation/${translatedText}/${item}/${transObj.author}`);
            sclient.send(`translation/${translatedText}/${item}/${transObj.author}`);*/
          });
        });
      }
      if(splitText[1] == "playercount"){
        console.log("Received message from client: "  + msg);
        client.user.setActivity(
            {
                name: `${parseInt(msg.split('/')[2])} player(s) on BPU`,
                type: ActivityType.Watching
          });
      }
    });
  socket.on('close', function () {
      console.log('Client disconnected');
  })

});

client.login(botinfo.token);