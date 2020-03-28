# assessagility project migration

# after clone the project do this step:

- go to the project folder and write pipenv shell, it will prepare the environment and open the env.
- copy this command and paste it to install some library in python:
pipenv install gchartwrapper xlwt xlrd
- copy this command also to install the requirements django:
pipenv install
- then run the project ./manage.py runserver or python manage.py runserver
- go to assessagility folder and open urls.py and each folder have contain urls.py :
before taking any of the urls in each folder check out the urls in assessagility if have a url like that usermanagement , client/admin/ should be added before copy any urls from any folder.