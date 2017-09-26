import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.Socket;
import java.net.SocketException;
import java.util.Collections;
import java.util.Date;
import java.util.ResourceBundle;

public class Common {
	public final static int PORT = 80;
	private static ResourceBundle __rb = ResourceBundle.getBundle("setting");

	public static void println(String str) {
		System.out.println((new Date()).toString() + " " + str + " " + ip());
	}

	public static String ip() {
		String ret = "?.?.?.?";
		try {
			StringBuffer sb = new StringBuffer();
			for(NetworkInterface n: Collections.list(NetworkInterface.getNetworkInterfaces()) ) {
				//System.out.println("" + n);
				for (InetAddress addr : Collections.list(n.getInetAddresses()))  {
					if( addr instanceof Inet4Address && !addr.isLoopbackAddress() ){
						//System.out.println(addr.getHostAddress());
						sb.append(addr + ":" + n.getName() + ":" + n.getDisplayName() + "/");
					}
				}
			}
			ret = sb.toString();
		} catch (SocketException e) {
			e.printStackTrace();
		}
		return ret;
	}

	public static void line(String msg) {
		final String EOL = "\r\n";
		String content = "{\"msg\":\"" + msg + "\"}";
		try {
			Socket s = new Socket("yoro.azurewebsites.net", 80);
			OutputStream os = s.getOutputStream();
			OutputStreamWriter osw = new OutputStreamWriter(os);
			InputStream is = s.getInputStream();
			osw.write("POST /line HTTP/1.1" + EOL);
			osw.write("Content-Type: application/json" + EOL);
			osw.write("host: yoro.azurewebsites.net" + EOL);
			osw.write("accept: application/json" + EOL);
			osw.write("Content-length: " + content.length() + EOL);
			osw.write("Connection: close" + EOL);
			osw.write(EOL);
			osw.write(content + EOL);
			osw.flush();
			while (true) {
				int a = is.read();
				if (a <= 0) {
					break;
				}
				System.out.print((char) a);
			}
			is.close();
			osw.close();
			os.close();
			s.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	static public int getInt(String key) {
		int ret = 0;
		try {
			ret = Integer.parseInt(__rb.getString(key));
		} catch (NumberFormatException e) {
			e.printStackTrace();
		}
		return ret;
	}
/*
	static public int getId() {
		int ret = 0;
		try {
			ret = Integer.parseInt(__rb.getString("id"));
		} catch (NumberFormatException e) {
			e.printStackTrace();
		}
		return ret;
	}*/
}
