# raspi-yoro
## 遠隔お酌装置

### プログラム
- ble.js
 - センサ値をクラウドに送信
 - コマンド「sudo node jle.js」
- servo.js
 - クラウドにからセンサ値を受信
 - コマンド「node servo.js」
- servo.py
 - サーボを動かす
 - コマンド「sudo python servo.py」

### 配線
    +---+---+
    |+3v|+5v|
    +---+---+
    |+3v|+5v|
    +---+---+
    |+3v|GND|
    +---+---+
    |+3v|GND|
    +---+---+
    |   |   |

### Raspberry Piと接続
- とりあえず優先LAN直結で強制的に接続
  - Windowsのコマンドプロンプトを起動
    - 仮のIPアドレスを設定
      arp -s 169.254.0.xxx b8-27-eb-62-c6-09
  - vncで169.254.0.xxxに接続
    - ユーザ名「pi」、パスワード「root」
    - UIで無線LANを接続
    - ターミナルを起動、無線LANのIPアドレスを確認
      ifconfig
  - vnc切断
  - 仮のIPアドレスを削除
    arp -d 169.254.0.xxx
  - vncを無線LANのIPアドレスで再接続



  - sshで169.254.0.xxxに接続
    - sshはRLogin、Tera Term、PuTTYでもなんでもいい
    - ユーザ名「pi」、パスワード「root」
- 無線LANで接続

### 最新版にアップデート
- 

- コンソールで下記を実行
      cd ~/raspi-yoro
      git pull origin
      npm install
- 再起動
      sudo reboot

### 設定ファイル(config.js)
- 


### デバッグ
- 電源ONで全てのプログラムが自動実行するようになっている
    kill `ps ax | grep process | awk '{print $1}'
    pkill -f 'プロセス名'
    ps aux | grep [プロセス名] | grep -v grep | awk '{ print "kill -9", $2 }' | sh



### TIPS
- ネットワークが...
- BLEが...
- GPIOが...



-----



vi /etc/rc.local





169.254.0.0

ベンダーID(b8:27:eb)

ping 169.254.0.255

https://www.indetail.co.jp/blog/170414/

Macは何も考えずにraspberrypi.localで接続できる
---------
無線でVNCで入って、ifconfig、LANケーブルさしてifconfig
-----
arp -s 169.254.0.xxx   b8-27-eb-62-c6-09



