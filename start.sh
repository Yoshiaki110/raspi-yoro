sudo pigpiod
cd /home/pi/raspi-yoro
sleep 1s
gpio -g write 8 1
while :
do
  date >> start.log
  ifconfig wlan0 >> start.log
  ifconfig wlan0 | grep inet[^6]
  if [ $? -ne 0 ]; then
    sleep 1s
    gpio -g write 8 0  # ネットが繋がっていないと効かない
    sleep 1s
    gpio -g write 8 1
  else
    break
  fi
done

mkfifo fifo
sudo python servo.py > servopy.log &
node servo.js > servojs.log &
sudo node ble.js > ble.log  &
