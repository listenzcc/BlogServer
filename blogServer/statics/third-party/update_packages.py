'''
File: update_packages.py

The script will work in its folder.
- It will download the third-party files in the packages.ini;
- A report will be generated and opened in your web browser.

A legal packages.ini file is like this:
[SectionName]
name=script.js                // In what name the file will be saved
url=https://url_of_script.js  // Where the file is found
type=js                       // The type of the file, for future use
'''

# %%
# Necessary packages
import os
import time
import requests
import webbrowser
import configparser
import pandas as pd
import traceback

# %%
# Make sure it works in its folder
folder = os.path.join(os.path.dirname(__file__))

cfg = configparser.ConfigParser()
cfg.read(os.path.join(folder, 'packages.ini'))

# %%
# The third-party files will listed in the dataframe of [df]
df = pd.DataFrame(columns=['name', 'url', 'type', 'state'])

for sct in cfg.keys():
    if not all([e in cfg[sct] for e in ['url', 'name']]):
        continue

    print(sct)
    df = df.append(dict(cfg[sct]), ignore_index=True)

df['state'] = '--'
df

# %%
for i in range(len(df)):
    se = df.iloc[i]
    path = os.path.join(folder, se['name'])
    if not os.path.isfile(path):
        try:
            resp = requests.get(se['url'])
        except requests.exceptions.ConnectionError as err:
            traceback.print_exc()
            df['state'][i] = 'Failed on download'
            continue

        with open(path, 'wb') as f:
            f.write(resp.text.encode('utf-8'))
        print(se, resp)
        df['state'][i] = time.ctime()
    else:
        df['state'][i] = 'Old'

# %%
html = os.path.join(folder, 'latest.html')
df.to_html(html)
webbrowser.open(html)

# %%
