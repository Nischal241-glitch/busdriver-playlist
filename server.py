import json, mimetypes
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote

ROOT = Path(__file__).parent.resolve()
MUSIC = ROOT / "music"
MUSIC.mkdir(exist_ok=True)
AUDIO_EXT = {".mp3",".wav",".ogg",".m4a",".aac",".flac",".webm"}

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = unquote(self.path.split("?",1)[0])
        if path == "/api/songs":
            songs=[]
            for p in sorted(MUSIC.iterdir(), key=lambda x:x.name.lower()):
                if p.is_file() and p.suffix.lower() in AUDIO_EXT:
                    songs.append({"name":p.name,"url":"/music/"+p.name})
            data=json.dumps(songs, ensure_ascii=False).encode()
            self.send_response(200)
            self.send_header("Content-Type","application/json; charset=utf-8")
            self.send_header("Content-Length",str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        return super().do_GET()

    def translate_path(self, path):
        if path.startswith("/music/"):
            rel=unquote(path[len("/music/"):]).lstrip("/")
            return str((MUSIC/rel).resolve())
        return super().translate_path(path)

print("Bus Driver Playlist running at http://localhost:8000")
print("गीतहरू music folder मा राख्नुहोस्।")
ThreadingHTTPServer(("localhost",8000), Handler).serve_forever()
