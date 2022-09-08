FROM python:3.9.8-slim-buster

RUN apt-get update \
  && apt-get install -y python3-dev build-essential libssl-dev \
  && apt-get install -y ffmpeg curl libpq-dev

# Get Rust, this is required to build tokenizers package. This is due to OS/Wheel mismatch for some M1 Macs.
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

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
