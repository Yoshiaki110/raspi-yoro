#!/usr/bin/python
# coding: UTF-8

import time
import threading
import pigpio

# setup
pi = pigpio.pi()
pi.set_mode(17, pigpio.INPUT)
pi.set_pull_up_down(17, pigpio.PUD_UP)
pi.set_mode(8, pigpio.OUTPUT)

###d_pos = 0
###c_pos = 0
d_pos = 180
c_pos = 180
e_mode = False
l_time = 0

def cb_interrupt(gpio, level, tick):
    global l_time
    if time.time() - l_time > 0.3:
        global e_mode
        print (gpio, level, tick)
        if e_mode:
            global c_pos
            #print("True", gpio, level, tick)
            print("緊急モード解除")
            e_mode = False
            ###c_pos = 0
            c_pos = 180
            pi.write(8, 1)
        else:
            #print("False", gpio, level, tick)
            print("緊急モード")
            e_mode = True
            ####setPos(0)
            setPos(180)
            pi.write(8, 0)
        l_time = time.time()

cb = pi.callback(17, pigpio.FALLING_EDGE, cb_interrupt)

def setPos(pos):
    if pos <= 180:          # あまり傾けない
        val = (2500-500) / 180.0 * pos + 500
        #print(str(pos) + " " + str(val))
        pi.set_servo_pulsewidth(7, val)

class TestThread(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.setDaemon(True)
 
    def run(self):
        while True:
            global d_pos
            global c_pos
            global e_mode
            time.sleep(0.02)
            if e_mode:
                pi.write(8, 0)
                time.sleep(0.5)
                pi.write(8, 1)
                time.sleep(0.5)
                continue
            pi.write(8, 1)
            if d_pos == c_pos:
                continue
            elif d_pos > c_pos:
                c_pos += 1
            else:
                c_pos -= 1
            #print('== read ==', d_pos)
            setPos(c_pos)

th = TestThread()
th.start()

# 
while True:
    print('接続待ち')
    f = open('fifo')
    print('接続しました')
    line = f.readline() # 1行を文字列として読み込む(改行文字も含まれる)
    i = 0
    while line:
        i = i + 1
        try:
            global d_pos
            d_pos = int(line[:-1])
            print('-- read --', d_pos)
        except:
            pass
        line = f.readline()
    f.close
