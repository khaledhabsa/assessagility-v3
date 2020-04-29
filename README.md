# Dr Agile


#### For running the application:
1. Open your terminal in the root directory.
2. Run shell environment by copy and paste this command `pipenv shell`
3. Run `pipenv install -r requirements.txt` to install packages in requirements.txt file.
4. Run `./manage.py runserver` or `python manage.py runserver` to run the server.


#### For working on urls into the application:
1. Navigate to `assessagility` folder, you will find urls.py file, each app in the project contain url should be setup in this file. well in each url app,take the path that found in first parameter, and navigate to this app you will find urls.py open it and take each url and run it like that:
- in client admin url should be add `/client/admin/` that found in urls in assessgility folder. and add after this what you want urls that found in this app like that `client/admin/adduser`.

