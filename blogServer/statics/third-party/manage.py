# %%
import os
import requests
import pandas as pd
import configparser

# %%
folder = os.path.join(os.path.dirname(__file__))

cfg = configparser.ConfigParser()
cfg.read(os.path.join(folder, 'packages.ini'))

# %%
df = pd.DataFrame(columns=['name', 'url', 'type'])

for sct in cfg.keys():
    if not 'url' in cfg[sct]:
        continue
    print(sct)
    df = df.append(dict(cfg[sct]), ignore_index=True)

df

# %%
for i in range(len(df)):
    se = df.iloc[i]
    resp = requests.get(se['url'])
    with open(os.path.join(folder, se['name']), 'wb') as f:
        f.write(resp.text.encode('utf-8'))
    print(se, resp)

# %%
