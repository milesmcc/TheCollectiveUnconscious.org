"""
Serves files out of its current directory.
Doesn't handle POST requests.
"""
import SocketServer
import SimpleHTTPServer
import datamanager

PORT = 12024

datamanager.init()


def parse_path(path):
    print path
    path = path.replace('/', '')
    parts = path.split(';')
    print str(parts)
    try:
        data = {'id': None, 'time': None}
        for part in parts:
            kv = part.split('=')
            print str(kv)
            if kv[0] == "id":
                data['id'] = kv[1]
            elif kv[0] == "time":
                data['time'] = int(kv[1])
        print str(data)
        return data
    except Exception as e:
        raise


def handle(path):
    # Path format: /id=<id>;time=<seconds>;
    # Response format: id=<id>;total=<total seconds>;personal=<personal contribution>;error=OK

    if path == "/favicon.ico":
        return

    error = "OK"
    dicti = parse_path(path)  # go python
    id = dicti['id']
    time = dicti['time']
    print str(id) + "?" + str(time)
    if id == "none" or id == "undefined":
        id = str(datamanager.generate_new_id())
    if time > 5:
        error = "time cannot be greater than five seconds!"
        print(id + " attempted to report a time > 5 seconds")
        time = 5
    print id + ">" + str(time)
    datamanager.add_time_to_id(id, time)
    total = datamanager.get_total_time()
    personal = datamanager.get_time_from_id(id)
    datamanager.ping(id)
    sessions = datamanager.get_sessions()
    return "id=" + str(id) + ";total=" + str(total) + ";sessions="+str(sessions)+";personal=" + str(personal) + ";error=" + error


class CustomHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(handle(self.path))
        return


httpd = SocketServer.ThreadingTCPServer(('localhost', PORT), CustomHandler)

print "collective unconscious is successfully running on port ", PORT
httpd.serve_forever()
