sleep 10s
sudo pigpiod
cd /home/pi/raspi-yoro
mkfifo fifo
sudo python servo.py > servopy.log &
node servo.js > servojs.log &
sudo node ble.js > ble.log  &
