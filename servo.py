#!/usr/bin/python
# coding: UTF-8

import pigpio

# setup
pi = pigpio.pi()
pi.set_mode(17, pigpio.INPUT)
pi.set_pull_up_down(17, pigpio.PUD_UP)
pi.set_mode(8, pigpio.OUTPUT)

def cb_interrupt(gpio, level, tick):
    print (gpio, level, tick)

cb = pi.callback(17, pigpio.FALLING_EDGE, cb_interrupt)

# 
f = open('fifo')
line = f.readline() # 1行を文字列として読み込む(改行文字も含まれる)
i = 0
while line:
    i = i + 1
    try:
        n = int(line[:-1])
        val = (2500-500) / 180.0 * n + 500
        print str(i) + " " + line[:-1] + " " + str(val)
    except:
        pass
    line = f.readline()
f.close
