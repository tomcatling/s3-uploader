FROM webdevops/php-apache

WORKDIR /app

COPY app/ /app/

USER application

RUN composer install