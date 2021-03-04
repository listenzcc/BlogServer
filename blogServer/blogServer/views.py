import os
import json
import datetime
import pandas as pd
from . import md_folder
from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    '''Home page response
    '''
    print(request)
    return render(request, 'index.html')


def date_lst(request):
    '''List .md file names of date,
    the format is '%Y-%m-%d'
    '''
    print(request)
    files = [e for e in os.listdir(md_folder) if e.endswith('.md')]
    df = pd.DataFrame()
    df['date'] = sorted([e.split('.')[0] for e in files], reverse=True)
    return HttpResponse(df.to_json(), content_type='application/json')


def fetch_date(request, date):
    '''Fetch the content of the .md file of the [date]
    '''
    print(request)

    # The command will raise an error is date is illegal
    datetime.datetime.strptime(date, '%Y-%m-%d')

    path = os.path.join(md_folder, f'{date}.md')

    if not os.path.isfile(path):
        with open(path, 'w') as f:
            f.write('')

    content = [e.strip() for e in open(path).read().split('\n')]

    df = pd.DataFrame()
    df['content'] = content
    return HttpResponse(df.to_json(), content_type='application/json')


def post_date(request, date):
    print(request)
    content = request.POST.get('content', None)
    if content is None:
        return HttpResponse('{"Status": "ERROR", "REASON": "Not found [content]"}', content_type='application/json')

    date = request.POST.get('date', None)
    if date is None:
        return HttpResponse('{"Status": "ERROR", "REASON": "Not found [date]"}', content_type='application/json')

    # The command will raise an error is date is illegal
    datetime.datetime.strptime(date, '%Y-%m-%d')

    fname = '{}.md'.format(date)
    with open(os.path.join(md_folder, fname), 'w') as f:
        f.write(content)
    print('Wrote {} charaters to {}'.format(len(content), fname))

    rep = dict(
        FileName=fname,
        Status='OK'
    )
    return HttpResponse(json.dumps(rep), content_type='application/json')
