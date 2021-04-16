# DarkBox Backend

This repository contains the backend source code for the DarkBox web application and
houses the API used by both the frontend and third party applications. Self hosting the backend
is not necessarily supported as there is a lot of moving parts and things could break at any point, however
if you feel obligated to try to selfhost this application yourself, no one will stop you.

## Setup

In order to setup the backend, you need to first have nodejs installed, to do this go to the [NodeJS](https://nodejs.org/en/) website
and find how to install the latest version, on arch linux for example this is done by running `sudo pacman -S nodejs npm`.

1. Install NodeJS from the [official website](https://nodejs.org/en/).
2. Git clone the repoistory by running `git clone -b dev https://github.com/darkboxapp/backend.git`.
3. Install all required dependencies needed for the backend by running `cd backend && npm i`.
4. Compile the backend source by running `npm run compile`.

After you have completed these steps, continue to the configuration section.

## Configuration

DarkBox uses JSON files for configuration of the backend, an example configuration can be seen below, but do note
that there will be no in depth look at the configuration as the configuration is always changing and growing.

### Example

```json
{
  "port": 3000,
  "keyLength": 12,
  "database": {
    "user": "postgres",
    "password": "example_postgres_password",
    "host": "example_postgres_host",
    "database": "devel"
  },
  "security": {
    "key": "example_encryption_key"
  },
  "storage": {
    "type": "file",
    "path": "blobs"
  },
  "sentry": {
    "enabled": true,
    "options": {
      "dsn": "example_sentry_dsn",
      "traceSampleRate": 1.0
    }
  }
}
```
