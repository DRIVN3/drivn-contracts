FROM python:3.10

EXPOSE 9999

RUN pip install --upgrade pip

RUN pip3 install fastapi[all] web3
WORKDIR /app

CMD uvicorn app.main:app --reload --host 0.0.0.0 --port 9999
