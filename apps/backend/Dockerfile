FROM python:3.12.8-slim-bookworm

WORKDIR /BACKEND 


RUN apt-get update && \ 
    apt-get install -y --no-install-recommends \
    build-essential \
    gcc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


COPY requirements.txt /


RUN --mount=type=cache,target=/root/.cache/pip pip install -r /requirements.txt


COPY . /BACKEND
