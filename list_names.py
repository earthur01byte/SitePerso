import os, json
files = [f for f in os.listdir(r'C:/Users/earth/Desktop/Cursor/SitePerso/Images') if 'Horiz' in f or 'Fresque' in f]
open(r'C:/Users/earth/Desktop/Cursor/SitePerso/names.txt', 'w', encoding='utf-8').write(json.dumps(files, ensure_ascii=False))