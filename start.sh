sudo pigpiod
cd raspi-yoro
mkfifo fifo
sudo servo.py &
node servo.js &
sudo node ble.js &
