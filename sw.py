#!/usr/bin/python
# coding: UTF-8

import os
import time
import pigpio

# setup
pi = pigpio.pi()
pi.set_mode(17, pigpio.INPUT)
pi.set_pull_up_down(17, pigpio.PUD_UP)
pi.set_mode(8, pigpio.OUTPUT)

if pi.read(17):
  print("sw off")
  try:
    os.remove('button_on')
  except OSError:
    pass
else:
  print("sw on")
  open('button_on', 'a').close()
  for i in range(10):
    pi.write(8, 1)
    time.sleep(0.1)
    pi.write(8, 0)
    time.sleep(0.1)

