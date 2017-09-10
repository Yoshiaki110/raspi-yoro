#!/usr/bin/python
# coding: UTF-8

import time
import threading
import pigpio
from config import REV

# setup
pi = pigpio.pi()
pi.set_mode(17, pigpio.INPUT)
pi.set_pull_up_down(17, pigpio.PUD_UP)
pi.set_mode(8, pigpio.OUTPUT)
pi.set_mode(9, pigpio.OUTPUT)
pi.set_mode(10, pigpio.OUTPUT)
pi.write(8, 0)      # ALL LED OFF
pi.write(9, 0)
pi.write(10, 0)

init_pos = 180
#init_pos = 0
#if REV:
#    init_pos = 180
d_pos = init_pos 
c_pos = init_pos
e_mode = False
l_time = 0

# ボタンの処理
def cb_interrupt(gpio, level, tick):
    global l_time
    if time.time() - l_time > 0.3:
        global e_mode
        print (gpio, level, tick)
        if e_mode:
            global c_pos
            #print("True", gpio, level, tick)
            print("待機モード解除", init_pos)
            e_mode = False
            c_pos = init_pos
            pi.write(8, 1)
        else:
            #print("False", gpio, level, tick)
            print("待機モード", init_pos)
            e_mode = True
            setPos(init_pos)
            time.sleep(0.3)
            setPos(init_pos)
            pi.write(8, 0)
        l_time = time.time()

cb = pi.callback(17, pigpio.FALLING_EDGE, cb_interrupt)

# サーボを動かす
def setPos(pos):
    if pos >= 50:          # あまり傾けない
        if REV:
            pos = abs(180 - pos)
        val = (2500-500) / 180.0 * pos + 500
        #print(str(pos) + " " + str(val))
        pi.set_servo_pulsewidth(7, val)

# サーボのメインスレッド
class ServoThread(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.setDaemon(True)
 
    def run(self):
        while True:
            global d_pos
            global c_pos
            global e_mode
            if e_mode:           # 待機モード
                pi.write(8, 0)   # ゆっくり点滅
                time.sleep(0.5)
                pi.write(8, 1)
                time.sleep(0.5)
                continue

            time.sleep(0.02)

            if d_pos == c_pos:   # 移動しない場合
                continue
            elif d_pos > c_pos:
                c_pos += 1
            else:
                c_pos -= 1
            #print('d', d_pos, 'c', c_pos)
            setPos(c_pos)        # 移動

sth = ServoThread()
sth.start()

class LedThread(threading.Thread):
    def __init__(self, pin):
        threading.Thread.__init__(self)
        self.setDaemon(True)
        self.pin = pin
        self.f = False
 
    def run(self):
        while True:
            if self.f:      # 一瞬点滅
                pi.write(self.pin, 0)
                print(self.pin, 'off')
                time.sleep(0.1)
                pi.write(self.pin, 1)
                print(self.pin, 'on')
                time.sleep(0.1)
                self.f = False
                continue
            time.sleep(0.1)

    def set(self):
        print('set', self.pin)
        self.f = True

bleLed = LedThread(9)
bleLed.start()
recvLed = LedThread(10)
recvLed.start()

# 
while True:
    print('接続待ち')
    pi.write(8, 0)      # LED OFF
    f = open('fifo')
    print('接続しました')
    pi.write(8, 1)      # LED ON
    line = f.readline() # 1行を文字列として読み込む(改行文字も含まれる)
    i = 0
    while line:
        i = i + 1
        try:
            pos = int(line[:-1])
            print('-- read --', pos)
            if pos == 200:
                bleLed.set()
            elif pos == 201:
                pi.write(9, 1)      # LED ON
            elif pos == 202:
                pi.write(9, 0)      # LED OFF
            elif pos == 300:
                print('recv 300')
                recvLed.set()
            elif pos == 301:
                pi.write(10, 1)     # LED ON
            elif pos == 302:
                pi.write(10, 0)     # LED OFF
            else:
                global d_pos
                d_pos = pos
                #print('-- read --', d_pos)
        except:
            pass        # 数値変換に失敗
        line = f.readline()
    f.close


'''
200 青LED点滅 BLEのデータ受信中
201 青LED ON  ble.js起動中
202 青LED OFF ble.js停止中

300 緑LED点滅 データ受信中
301 緑LED ON  servo.js起動中
302 緑LED OFF servo.js停止中

'''
