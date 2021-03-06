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