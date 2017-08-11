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
    | 2 |+5v|
    +---+---+
    | 3 |GND|
    +---+---+
    | 4 | 14|
    +---+---+
    |GND| 15|
    +---+---+
    |   |   |

### Raspberry Piと接続
- 無線LAN設定
  - Windowsのコマンドプロンプトを起動（管理者として実行）
    - 仮のIPアドレスを設定
      arp -s 169.254.35.170 b8-27-eb-88-f6-53
  - sshで169.254.35.170に接続
    - sshはRLogin、Tera Term、PuTTYでもなんでもいい
    - ユーザ名「pi」、パスワード「root」
    - 無線LANの設定をする
      sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
    - 無線LANが接続されたか確認とIPアドレスの確認
      ifconfig wlan0
    - 接続されていない場合、下記コマンドで無線LANを再起動
      sudo ifdown wlan0
      sudo ifup wlan0
  - ssh切断
  - 仮のIPアドレスを削除
    arp -d 169.254.35.170


- 最新版にアップデート
  - sshで接続
    - sshはRLogin、Tera Term、PuTTYでもなんでもいい
    - ユーザ名「pi」、パスワード「root」
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
    - プログラムの停止
      sudo pkill -f 'sudo node ble.js'
      sudo pkill -f 'node ble.js'
      sudo pkill -f "sudo python servo.py"


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



