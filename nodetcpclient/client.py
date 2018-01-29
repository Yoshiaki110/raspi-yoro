# -*- coding: utf-8 -*-

import sys
import socket
from contextlib import closing

def main():
  host = 'localhost'
  port = 12345
  bufsize = 4096

  sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  with closing(sock):
    sock.connect((host, port))
    while True:
      msg = sock.recv(bufsize)
      print(ord(msg[-1]))      # 最後の文字

  return

if __name__ == '__main__':
  main()
