import urllib.request
import shutil
url = 'https://downloads.sourceforge.net/project/strawberryperl/strawberryperl/5.42.0.1/strawberry-perl-5.42.0.1-64bit.zip'
print('getting', url)
with urllib.request.urlopen(url) as response, open('strawberry-perl.zip', 'wb') as out_file:
    shutil.copyfileobj(response, out_file)
import os
print('downloaded size', os.path.getsize('strawberry-perl.zip'))
