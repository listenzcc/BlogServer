'''
Makeup some .md files, with absolutely nonsense.
'''

# %%
import os
import datetime
import random

chars = [chr(ord('a') + i) for i in range(26)]


def word(n=3, m=10):
    '''Generate random word with length between [n] and [m] charaters.
    '''
    r = random.randint(n, m)
    return ''.join([random.choice(chars) for _ in range(r)])


def sentence(n=5, m=10):
    '''Generate random sentence with length between [n] and [m] words.
    '''
    r = random.randint(n, m)
    ws = [word() for _ in range(r)]
    ws[0] = ws[0].title()
    return ' '.join(ws) + '.'


def paragraph(n=5, m=10):
    '''Generate random paragraph with length between [n] and [m] sentences.
    '''
    r = random.randint(n, m)
    ss = [sentence() for _ in range(r)]
    return '\n'.join(ss)


word(), sentence(), paragraph()

# %%
num = 100
date = datetime.datetime(2020, 3, 17)
lst = [_ for _ in range(num * 3)]
random.shuffle(lst)
date_lst = sorted([date + datetime.timedelta(i) for i in lst[:100]])
date_lst


# %%

for d in date_lst:
    fpath = os.path.join(os.path.dirname(__file__),
                         '{}.md'.format(d.strftime('%Y-%m-%d')))

    contents = []

    contents.append('# {}'.format(sentence()))
    contents.append('{}'.format(paragraph()))

    r = random.randint(2, 5)
    for i in range(r):
        contents.append('## {}'.format(sentence()))
        contents.append('{}'.format(paragraph()))

    content = '\n\n'.join(contents)

    with open(fpath, 'w') as f:
        f.write(content)

# %%
