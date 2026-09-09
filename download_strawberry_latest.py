import urllib.request
import shutil
url = 'https://sourceforge.net/projects/strawberryperl/files/latest/download'
print('getting', url)
with urllib.request.urlopen(url) as response, open('strawberry-perl.zip', 'wb') as out_file:
    shutil.copyfileobj(response, out_file)
import os
print('downloaded size', os.path.getsize('strawberry-perl.zip'))
