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
- 下記３つを使用
  - 17 スイッチ
  - 8  LED
  - 7  サーボ
- 「gpio readall」でピンアサインが見れる

### Raspberry Piと接続
- 無線LAN設定
  - Windowsのコマンドプロンプトを起動（管理者として実行）
    - 仮のIPアドレスを設定  
    `arp -s 169.254.35.170 b8-27-eb-88-f6-53`

  - sshで169.254.35.170に接続
    - sshはRLogin、Tera Term、PuTTYでもなんでもいい
    - ユーザ名「pi」、パスワード「root」
    - 無線LANの設定をする  
    `sudo nano /etc/wpa_supplicant/wpa_supplicant.conf`

    - 無線LANが接続されたか確認とIPアドレスの確認  
    `ifconfig wlan0`

    - 接続されていない場合、下記コマンドで無線LANを再起動

    sudo ifdown wlan0  
    sudo ifup wlan0  

  - ssh切断
  - 仮のIPアドレスを削除
    `arp -d 169.254.35.170`


- 最新版にアップデート
  - sshで接続
    - sshはRLogin、Tera Term、PuTTYでもなんでもいい
    - ユーザ名「pi」、パスワード「root」
  - コンソールで下記を実行

    cd ~/raspi-yoro  
    git pull origin  
    npm install  

- 再起動  
    `sudo reboot`

### サービス化

    sudo vi /etc/rc.local
    pkill -f pigpio
    systemctl list-unit-files | grep -i gpio
    sudo systemctl enable pigpiod
    systemctl list-unit-files | grep -i gpio
    sudo systemctl start pigpiod

    cd system

    sudo cp yorobled.service /etc/systemd/system/
    systemctl list-unit-files | grep -i yorobled
    sudo systemctl enable yorobled
    systemctl list-unit-files | grep -i yorobled
    sudo systemctl start yorobled
    sudo journalctl -u yorobled

    sudo cp yorosvjsd.service /etc/systemd/system/
    systemctl list-unit-files | grep -i yorosvjsd
    sudo systemctl enable yorosvjsd
    systemctl list-unit-files | grep -i yorosvjsd
    sudo systemctl start yorosvjsd
    sudo journalctl -u yorosvjsd

    sudo cp yorosvpyd.service /etc/systemd/system/
    systemctl list-unit-files | grep -i yorosvpyd
    sudo systemctl enable yorosvpyd
    systemctl list-unit-files | grep -i yorosvpyd
    sudo systemctl start yorosvpyd
    sudo journalctl -u yorosvpyd


### 設定ファイル(config.js)
- 


### デバッグ
- 電源ONで全てのプログラムが自動実行するようになっている
    - プログラムの停止

    sudo pkill -f "sudo node ble.js"  
    sudo pkill -f "node servo.js"  
    sudo pkill -f "sudo python servo.py"  

    - 全プログラムの停止  
    `sudo pkill -f "sudo node ble.js" ` 

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



