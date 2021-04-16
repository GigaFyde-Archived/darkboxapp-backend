import {loadEnvironment} from './util/config';
import {Strategy, ExtractJwt} from 'passport-jwt';
import {Crypto} from './class/crypto';
import {Database} from './class/database';
import {Storage} from './class/storage';
import Snowflake from 'flake-idgen';
import {nanoid} from 'nanoid';
import multer from 'multer';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import morgan from 'morgan';

export const classes = {
  Database,
  Storage,
  Snowflake,
};

export const util = {
  loadEnvironment,
  multer,
  nanoid,
};

export const crypt = {
  Strategy,
  ExtractJwt,
  Crypto,
};

export const logging = {Sentry, Tracing, morgan};
