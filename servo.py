#!/usr/bin/python
# coding: UTF-8

import pigpio

# setup
pi = pigpio.pi()
pi.set_mode(17, pigpio.INPUT)
pi.set_pull_up_down(17, pigpio.PUD_UP)
pi.set_mode(8, pigpio.OUTPUT)

e_mode = False
def cb_interrupt(gpio, level, tick):
    global e_mode
    print (gpio, level, tick)
    if e_mode:
        print ("True", gpio, level, tick)
        e_mode = False
        pi.write(8,1)
    else:
        print ("False", gpio, level, tick)
        e_mode = True
        pi.write(8,0)

cb = pi.callback(17, pigpio.FALLING_EDGE, cb_interrupt)

# 
print('接続待ち')
f = open('fifo')
print('接続しました')
line = f.readline() # 1行を文字列として読み込む(改行文字も含まれる)
i = 0
while line:
    i = i + 1
    try:
        n = int(line[:-1])
        val = (2400-500) / 180.0 * n + 500
        print str(i) + " " + line[:-1] + " " + str(val)
        pi.set_servo_pulsewidth(7, val)
    except:
        pass
    line = f.readline()
f.close
