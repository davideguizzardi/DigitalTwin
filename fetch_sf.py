import urllib.request
url = 'https://sourceforge.net/projects/strawberryperl/files/'
data = urllib.request.urlopen(url).read().decode('utf-8')
print('len', len(data))
with open('sf-page.html', 'w', encoding='utf-8') as f:
    f.write(data)
