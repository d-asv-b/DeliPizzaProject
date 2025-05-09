FROM python:3.13-slim

RUN mkdir /app
WORKDIR /app

# Создаем виртуальное окружение
RUN pip install --upgrade pip
RUN python3 -m venv .venv

# Активируем вирт. окружение и устанавливаем необходимые зависимости
COPY ./requirements.txt /app/
RUN sh ./.venv/bin/activate
RUN pip install -r requirements.txt

COPY . /app/
EXPOSE 3001

RUN python ./manage.py migrate

CMD [ "python", "manage.py", "runserver", "0.0.0.0:3001" ]