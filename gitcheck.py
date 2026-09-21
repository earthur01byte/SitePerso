import subprocess
out = subprocess.run(['git','status'], cwd=r'C:/Users/earth/Desktop/Cursor/SitePerso', capture_output=True, text=True)
open(r'C:/Users/earth/Desktop/Cursor/SitePerso/gitout.txt','w',encoding='utf-8').write(out.stdout + '\n===STDERR===\n' + out.stderr)
print("done")