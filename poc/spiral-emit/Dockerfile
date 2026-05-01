FROM php:8.3-cli

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/download/2.7.5/install-php-extensions /usr/local/bin/

RUN apt-get update && apt-get install -y --no-install-recommends \
        unzip \
        git \
    && rm -rf /var/lib/apt/lists/*

RUN install-php-extensions \
        @composer-2.8.5 \
        sockets \
        mbstring \
        intl \
        pcntl \
        opcache \
        xdebug

ARG DOCKER_HOST_UID
ARG DOCKER_HOST_GID

RUN set -xe \
    && delgroup dialout \
    && groupadd --gid "$DOCKER_HOST_GID" app \
    && useradd --uid "$DOCKER_HOST_UID" --gid "$DOCKER_HOST_GID" --create-home --shell /bin/bash app

USER $DOCKER_HOST_UID:$DOCKER_HOST_GID

WORKDIR /var/www

EXPOSE 8080
