FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    curl \
    git \
    zip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

WORKDIR /app

EXPOSE 8000
