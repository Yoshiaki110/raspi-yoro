import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

class Client extends Thread {
//	private static String HOST = "localhost";
	private static String HOST = "csoft-iot.cloudapp.net";
	private static int ID = Common.getInt("id");
	private static int RECEIVE_ID = Common.getInt("receiveId");
	private static BufferedWriter BW = null;
	private Socket _s = null;

	public static void main(String args[]) {
//		write("aaa", "bbb");
//		read();
		if (args.length != 0) {
			ID = Integer.parseInt(args[0]);
		}
		try {
			for (int i = 0; i < 10; i++) {
				System.out.println( i + " " + Common.ip());
				Thread.sleep(1000);
			}
			File file = new File("../fifo");
			BW = new BufferedWriter(new FileWriter(file));
			BW.write("301\n");				// LED ON
			BW.flush();
		} catch(Exception e) {
			Common.println("Exception at bw.close: " + e);
		}
		while (true) {
			client();
			try {
				Thread.sleep(500);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
//		try {
//			if (BW != null)
//				BW.close();
//		} catch(Exception e) {
//			Common.println("Exception at bw.close: " + e);
//		}
	}

	/*
	 * メインスレッド（送信）
	 */
	public static void client() {
		Socket s = null;
		try {
			s = new Socket(HOST, Common.PORT);
			Common.println(s.getRemoteSocketAddress() + " " + s.getLocalSocketAddress());
		} catch (Exception e) {
			Common.println("Exception: " + e);
		}
		if (s != null) {
			Thread t = new Client(s);
			t.start();
			OutputStream os = null;
			BufferedReader br = null;
			try {
				os = s.getOutputStream();
				File file = new File("../sfifo");
				br = new BufferedReader(new FileReader(file));
				String str;
				while (true) {
					while (true) {
						str = br.readLine();
						if (str != null) {
							break;
						} else {
							br.close();
							br = new BufferedReader(new FileReader(file));
						}
					}
//					System.out.println("### " + str);
					os.write(255);		// デリミタ
					os.write(ID);		// ID
					os.write(Integer.parseInt(str));
				}
			} catch (Exception e) {
				Common.println("Exception in send thread: " + e);
				Common.println(s.getRemoteSocketAddress() + " " + s.getLocalSocketAddress());
			}
			try {
				if (br != null)
					br.close();
			} catch(Exception e) {
				Common.println("Exception at br.close: " + e);
			}
			try {
				if (os != null)
					os.close();
			} catch(Exception e) {
				Common.println("Exception at os.close: " + e);
			}
			try {
				if (s != null)
					s.close();
			} catch(Exception e) {
				Common.println("Exception at s.close: " + e);
			}
		}
	}

	/*
	 * 受信スレッド
	 */
	Client(Socket s) {
		_s = s;
	}
	public void run() {
		InputStream is = null;
		try {
			is = _s.getInputStream();
			while (true) {
				int delimiter = is.read();
				if (delimiter == -1) {
					Common.println("EOF " + _s.getRemoteSocketAddress() + " " + _s.getLocalSocketAddress());
					break;
				}
				if (delimiter != 255) {
					Common.println("illegal format(1) " + _s.getRemoteSocketAddress() + " " + _s.getLocalSocketAddress());
					break;
				}
				int id = is.read();
				if (id == -1) {
					Common.println("illegal format(2) " + _s.getRemoteSocketAddress() + " " + _s.getLocalSocketAddress());
					break;
				}
				int data = is.read();
				if (data == -1) {
					Common.println("illegal format(3) " + _s.getRemoteSocketAddress() + " " + _s.getLocalSocketAddress());
					break;
				}
				System.out.println(delimiter + " " + id + "=" + RECEIVE_ID + " " + data);
				BW.write("300\n");
				if (id == RECEIVE_ID) {
					BW.write(String.valueOf(data) + "\n");
				}
				BW.flush();
			}
		} catch (Exception e) {
			Common.println("Exception in receive thread: " + e);
			Common.println(_s.getRemoteSocketAddress() + " " + _s.getLocalSocketAddress());
		}
		try {
			if (is != null)
				is.close();
		} catch(Exception e) {
			Common.println("Exception at is.close: " + e);
		}
	}

	public static void read(){
		try {
			File file = new File("test.txt");
			BufferedReader br = new BufferedReader(new FileReader(file));
			String str;
			while((str = br.readLine()) != null){
				System.out.println(str);
			}
			br.close();
		} catch (Exception e) {
			System.out.println(e);
		}
	}

	public static void write(String str, String str2){
		try {
			File file = new File("test.txt");
			BufferedWriter bw = new BufferedWriter(new FileWriter(file));
			bw.write(str + "\n");
			bw.write(str2 + "\n");
			bw.close();
		} catch (Exception e) {
			System.out.println(e);
		}
	}
}
