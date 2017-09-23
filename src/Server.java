import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;

class Server extends Thread {
	private Socket _s = null;
	private static volatile ArrayList<OutputStream> __osList = new ArrayList<>();

	public static void main(String args[]) {
		//Common.ip();
		//Common.line("aaa1234あいうえお");
		//Common.line("aaa1234");
		int id = Common.getId();
		ServerSocket ss = null;
		try {
			ss = new ServerSocket(Common.PORT);

			while (true) {
				Socket s = ss.accept();
				Thread t = new Server(s);
				t.start();
			}
		} catch(Exception e) {
			e.printStackTrace();
			Common.println("Exception in main: " + e);
		}
		try {
			if (ss != null)
				ss.close();
		} catch(Exception e) {
			Common.println("Exception at ss.close: " + e);
		}
	}

	Server(Socket s) {
		_s = s;
		Common.println(s.getRemoteSocketAddress() + " " + s.getLocalSocketAddress() + " " + __osList.size());
	}

	public void run() {
		InputStream is = null;
		OutputStream os = null;
		try {
			is = _s.getInputStream();
			os = _s.getOutputStream();
			__osList.add(os);
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
//				System.out.println(delimiter + " " + id + " " + data);
				for (OutputStream tos : __osList) {
					//if (os != tos) {
						tos.write(255);
						tos.write(id);
						tos.write(data + 1);
					//}
				}
			}
		} catch(Exception e) {
			Common.println("Exception in thread: " + e);
			Common.println(_s.getRemoteSocketAddress() + " " + _s.getLocalSocketAddress());
		}
		try {
			if (is != null)
				is.close();
		} catch(Exception e) {
			Common.println("Exception at is.close: " + e);
		}
		__osList.remove(os);
		try {
			if (os != null)
				os.close();
		} catch(Exception e) {
			Common.println("Exception at os.close: " + e);
		}
		try {
			if (_s != null)
				_s.close();
		} catch(Exception e) {
			Common.println("Exception at os.close: " + e);
		}
	}
}