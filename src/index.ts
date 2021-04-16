import passport from 'passport';
import {HttpError, HttpErrors} from './util/error';
import express, {Request, Response, NextFunction} from 'express';
import {Payload} from './class/crypto';

import {classes, util, crypt, logging} from './imports';
const {Database, Storage, Snowflake} = classes;
const {Strategy, ExtractJwt, Crypto} = crypt;
const {loadEnvironment, multer, nanoid} = util;
const {Sentry, Tracing, morgan} = logging;

const api = express();

api.use(morgan('dev'));
api.use(passport.initialize());
api.use(Sentry.Handlers.requestHandler());
api.use(Sentry.Handlers.tracingHandler());

api.use((_: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

const config = loadEnvironment();
const multipart = multer().fields([{name: 'language'}, {name: 'content'}]);
const snowflake = new Snowflake({epoch: Date.now() / 1000});

const crypto = new Crypto(config.security.key);
const database = new Database(config.database, crypto);
const storage = new Storage(config.storage, crypto);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

if (config.sentry.enabled) {
  Sentry.init({
    ...config.sentry.options,
    integrations: [
      new Sentry.Integrations.Http({tracing: true}),
      new Tracing.Integrations.Express({app: api}),
    ],
  });
}

passport.use(
  new Strategy(
    {
      secretOrKey: config.security.key,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload: Payload, done) => {
      const user = await database.users.fetch(payload.id);
      if (!user) done(HttpErrors.InvalidUser, null);
      else {
        if (payload.bits === user.bits) done(null, payload.id);
        else done(HttpErrors.InvalidBits, null);
      }
    }
  )
);

api.post(
  '/api/create',
  [passport.authenticate('jwt', {session: true}), multipart],
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.language && req.body.content) {
      const postId = nanoid(config.keyLength);
      const path = await storage.create(postId, req.body.content);
      await database.posts.create(postId, path, req.body.language);
      res.status(200).send({id: postId});
    } else next(HttpErrors.InvalidBody);
  }
);

api.get(
  '/api/fetch',
  passport.authenticate('jwt', {session: true}),
  async (req, res, next) => {
    if (req.query.id) {
      const post = await database.posts.fetch(req.query.id as string);
      if (post !== null) {
        res.status(200).send({
          language: post.language,
          content: await storage.read(post.location),
        });
      } else next(HttpErrors.UnknownPost);
    } else next(HttpErrors.InvalidId);
  }
);

api.post('/auth/token', async (_, res) => {
  const userId = snowflake.next().readBigInt64LE();
  const [hash, token] = await crypto.token(userId);
  await database.users.create(userId, hash);
  res.status(200).send({token});
});

api.use(Sentry.Handlers.errorHandler());
api.use((err: HttpError, _: Request, res: Response, next: NextFunction) => {
  if (err) res.status(err.statusCode).send({error: err.message});
  else next();
});

(async () => {
  await database.connect();
  await storage.initialize();
  api.listen(config.port);
})();
