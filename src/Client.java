import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.Random;

class Client extends Thread {
	private static String HOST = "localhost";
//	private static String HOST = "csoft-iot.cloudapp.net";
	private static int ID = 1;
	private Socket _s = null;
	public static void main(String args[]) {
		//write("aaa", "bbb");
		//read();
		if (args.length != 0) {
			ID = Integer.parseInt(args[0]);
		}
		while (true) {
			client();
			try {
				Thread.sleep(5000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}

	public static void client() {
		Random r = new Random(System.currentTimeMillis());
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
			try {
				os = s.getOutputStream();
				while (true) {
					os.write(255);
					os.write(ID);
					os.write(r.nextInt(255));
					Thread.sleep(1000);
				}
			} catch (Exception e) {
				Common.println("Exception in send thread: " + e);
				Common.println(s.getRemoteSocketAddress() + " " + s.getLocalSocketAddress());
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
				System.out.println(delimiter + " " + id + " " + data);
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
			File file = new File("c:\\tmp\\test.txt");
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
			File file = new File("c:\\tmp\\test.txt");
			BufferedWriter bw = new BufferedWriter(new FileWriter(file));
			bw.write(str + "\n");
			bw.write(str2 + "\n");
			bw.close();
		} catch (Exception e) {
			System.out.println(e);
		}
	}
}