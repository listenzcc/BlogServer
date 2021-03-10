# Project of Daily Activities

The aim is to build a web blog server of self-interest.

## User Needs to Know

- The project is based on the files of .md format,
  and the files will be recording my activities everyday.
- The project will provide automatics method for creating, showing, and editing for them.
- Additionally, a web server based on django is used as a manager in the web-end.

## Development Tips

- Remove .strip() from the backend processing the sentences on 2021-03-06.
  1. My original idea is to strip the sentences from the backend;
  2. The aim is to strip the useless spaces around the sentences;
  3. But the operation will definitely break the raw indent structure of the markdown script;
  4. So the .strip() is removed from the backend.

## Development Diary

- 2020-03-09

  1. I put the processing bars on the top of my markdown editor and viewer;
  2. The left bar shows how long since your latest type (the left and blue bar);
  3. The right bar shows how many types you have done since the latest update (the right and red bar);
  4. Now, the update of the viewer will not automatically operating until the two bars both finish their counting.

- 2020-03-10

  1. To speedup the loading of the web app;
  2. I put the known JS libraries into [third-party](blogServer/statics/third-party/) folder in the statics folder;
  3. It also contains a python script [manage.py](blogServer/statics/manage.py) to manage the libraries;
  4. The information of the libraries are saved in the file of [packages.ini](blogServer/statics/third-party/packages.ini);
  5. To whoever concerns, if my behavior invasion your IPs, please contact me, and I will stop it immediately.
