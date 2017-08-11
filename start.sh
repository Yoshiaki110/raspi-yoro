sudo pigpiod
cd /home/pi/raspi-yoro
mkfifo fifo
sudo python servo.py &
node servo.js &
sudo node ble.js &
