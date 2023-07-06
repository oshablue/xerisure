# xerisure #

water miser planned style of water control, also planning gateway style implementation
with nodes etc., currently xbee style radios

#nodejs
#expressjs
#socket.io
#serialport
#xbee-api (or custom api)
#mongoose

### Dev / Deploy ###

Node: currently v8.11.3

### Startup ###

#### Now using pm2 ####

(it's running so, some useful commands)

`pm2 log www --lines 30`

`pm2 restart www`

`pm2 restart www && pm2 log www`


#### Or ####

Start with:

`DEBUG=xerisure:* npm run devstart`

## Refs ##

### Options / Future / Growth / Alternates ###

See also

  - xbmq-js
  - node-red-contrib-xbee (node)

### Backups for keeping local ###

`tar -czvf xerisure-2023-07-Jul-04.tar.gz --exclude=./xerisure/node_modules ./xerisure`
