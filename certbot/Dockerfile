FROM ubuntu:22.04

ARG EMAIL 
ARG DOMAIN

ENV DOMAIN=DOMAIN
ENV EMAIL=EMAIL

COPY . /certbot
WORKDIR /certbot

RUN apt-get update
RUN apt-get -y install certbot

CMD [ "sh", "gen_cert.sh" ]