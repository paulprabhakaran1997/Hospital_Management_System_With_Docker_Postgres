FROM python:3.10

ENV PYTHONUNBUFFERED 1
RUN mkdir /webapps
RUN mkdir /webapps/lint_hospital
WORKDIR /webapps/lint_hospital
ADD . /webapps/lint_hospital

RUN ln -sf /bin/bash /bin/sh
RUN pip install -r requirements.txt