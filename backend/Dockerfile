FROM python:3.9.8-slim-buster

RUN apt-get update
EXPOSE 9000
EXPOSE 9001

RUN pip install --upgrade pip
RUN pip3 install poetry

WORKDIR /app

COPY ./pyproject.toml ./pyproject.toml
# COPY ./poetry.lock ./poetry.lock

RUN poetry config virtualenvs.create false \
  && poetry install --no-dev --no-root

COPY . .

CMD ["python3", "main.py"]
