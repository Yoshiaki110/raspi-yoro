# 7/18 デモモード追加（環境だけ）
起動時にボタンが押されていたら、button_onファイルを作成する

  cd system
  sudo cp yoroswpyd.service /etc/systemd/system/
  sudo systemctl enable yoroswpyd

  sudo cp yorobled.service /etc/systemd/system/
  sudo cp yorosvpyd.service /etc/systemd/system/
  sudo reboot

----------------



# 注意6/23バージョンアップで
# SPORTに独自ポートの番号を入れる必要がある
# 現環境ではポー番号は80
## sudo systemctl disable yorobled
## restart時間を１秒にする
  sudo vi /etc/systemd/system/yorobled.service  
  sudo vi /etc/systemd/system/yorosvpyd.service  


# raspi-yoro
## 遠隔お酌装置

### プログラム
- ble.js
  - センサ値をクラウドに送信、クラウドにからセンサ値を受信
  - 開始コマンド「sudo systemctl start yorobled」
  - 終了コマンド「sudo systemctl stop yorobled」
  - ログ参照「sudo journalctl -u yorobled」
  - コンソール起動「sudo node ble.js」（カレントディレクトリを/home/pi/raspi-yoroで実行）

- servo.js（今使ってない）
  - クラウドにからセンサ値を受信（今使ってない）
  - 開始コマンド「sudo systemctl start yorosvjsd」
  - 終了コマンド「sudo systemctl stop yorosvjsd」
  - ログ参照「sudo journalctl -u yorosvjsd」
  - コンソール起動「node servo.js」（カレントディレクトリを/home/pi/raspi-yoroで実行）

- servo.py
  - サーボを動かす
  - 開始コマンド「sudo systemctl start yorosvpyd」
  - 終了コマンド「sudo systemctl stop yorosvpyd」
  - ログ参照「sudo journalctl -u yorosvpyd」
  - コンソール起動「sudo python servo.py」（カレントディレクトリを/home/pi/raspi-yoroで実行）


### 配線
- 下記３つを使用
  - 17 待機スイッチ
  - 10  LED 受信確認用
  - 9  LED BLE接続確認用
  - 8  LED(待機スイッチの)
  - 7  サーボ
- 「gpio readall」でピンアサインが見れる

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
- exports.HostName
    - Azure IoTHubのHostName
- exports.DeviceId
    - Azure IoTHubのDeviceId
- exports.SharedAccessKey
    - Azure IoTHubのSharedAccessKey
- exports.BottleId
    - 自分のID
- exports.ConnectString
    - Azure IoTHubのConnectString
- exports.ReceiveBottleId
    - 受信するID

### １台モードにする場合
- スマホのテザリングをONにする
- ラズパイの電源を入れる
- sshクライアントでラズパイとつなげる   
多分アドレスは「192.168.43.174」か「192.168.43.184」のはず
- sudo nano raspi-yoro/config.js で定義ファイルを編集する   
「exports.BottleId」「exports.ReceiveBottleId」が今は別々の値（'a'と'b'）になっているが同じ値にする
- 「ctrl」を押しながら「x」を押すとファイル変更するかと聞かれるので「Y」を押す
- ファイル名を確認するメッセージが出るのでそのまま「Enter」
- 「sudo reboot」と入力すると、ラズパイが再起動して１台モードになります

### 設定ファイル(config.py)
- REV
    - True 左利き用
    - False 右利き用


### デバッグ
- 電源ONで全てのプログラムが自動実行するようになっている
    - プログラムの停止

    sudo pkill -f "sudo node ble.js"  
    sudo pkill -f "node servo.js"  
    sudo pkill -f "sudo python servo.py"  

    - 全プログラムの停止  
    `sudo pkill -f "sudo node ble.js" `

### TIPS
- 通信料、通信費
  - １回のお酌で１５０メッセージ、１本空けるのに、１５００メッセージ
  - ５１００円／４００万メッセージ＝０．０１２７５円／メッセージ
  - １５００×０。０１２７５＝１９．１２５円

- 原契約で１日何本できるか
  - ４００万／１５００メッセージ＝２６６．６６６本




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
