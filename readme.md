# xerisure #

water miser planned style of water control, also planning gateway style implementation
with nodes etc., currently xbee style radios

#nodejs
#expressjs
#socket.io
#serialport
#xbee-api (or custom api)
#mongoose

6-28-25
Latest:
bootstrap 4.6.0



### TODO Biggies

Deployment / Public Repo:

- Extract / purge like dB credentials or just include as examples


Code:

- Prune log events
- Automatic watering scheduling
- Haha of course implement the feedback from sensors (need to install the physical HW!)


### TODO Smallies

- Radio pin number indicator when DIO changed should also show On/Off cross-referenced to the watering circuit model instance
- NEXT: Why on startup sometimes serial port isn't picked up? And is path reparsed each time on reload? Or only on app launch?
- Page to show dB contents
- Indicate bigger is serial port not connected - and maybe allow population anyway


### Dev / Deploy / Versions ###


=== 6-7-25 ===

Node Engine: 24.1.0
npm 11.3.0
nvm 0.38.0 
Ubuntu 22.04 LTS

Switching from MongoDB to Sqlite because hardware has no AVX instruction, thus newer MongoDBs cannot run (core dump) and oldest non-AVX version is 4.4 and 4.4 or less will only run on 20.04 or less.

Thus re-writing this and abstracting to sequelize to convert the mongoose schemas to general schemas that can then be connected to whatever back end.

Used npm tools to update all packages to latest version and thus also updating some serial port interfacing as well.




=== Prior ===

Node Engine: currently v8.11.3


#### Node SerialPort ####

Initially was latest 6 version. Was ok - maybe some shortcomings / out-of-date and then docs now only 7x online.

^7 and ^8 worked fine functional as is

And then ^9 get: 
prebuild-install warn install No prebuilt binaries found (target=8.11.3 runtime=node arch=x64 libc= platform=linux)
and don't want to mess with rebuild these days if can avoid it.

So for now, will keep with 8.11.3 & etc. as above



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


## Gotchas ##

### Sleep / USB Device / Serial Port Path ###

We have cron like:

```
$ sudo crontab -l
# Addition: for xerisure / system sleep wake:
#   8pm (h=20) until 4:30 am = 8.5 hours x 3600 sec/hr = 30,600 
0 20 * * * /usr/sbin/rtcwake -m mem -s 30600 >> /home/nodeuser/SuspendResume.log 2>&1
```
and on wake it seems that what was once /dev/ttyUSB0 now somehow becomes /dev/ttyUSB1. Interesting.

```
$ usbreset 0403:6015
```
works to reset this device and re-enums to ...USB0 - and possibly for other serial errors too it might help.

But, need to adjust permissions on eg /usr/bin/usbreset or work out a script or whatever.

See:
https://askubuntu.com/questions/1044988/usb-ports-not-working-after-resume-from-sleep-on-ubuntu-18-04

for other ideas and methods.

Currently we have in www just select the first ttyUSB# in the list - and after wake need a function to check and re-instantiate the serialport instance.


## Reminders

To see validation errors on seeding for example:
```
npx sequelize-cli db:seed:all --debug
```


## Meta Reminders - GPG

To sign using VSCode remote, needed:
```
GPG_TTY=$(tty)
export GPG_TTY 
```

to allow the passphrase entry in the terminal.
(https://stackoverflow.com/questions/39494631/gpg-failed-to-sign-the-data-fatal-failed-to-write-commit-object-git-2-10-0)[]