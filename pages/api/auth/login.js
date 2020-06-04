import passport from 'passport';
import nextConnect from 'next-connect';
import { localStrategy } from '../../../lib/auth/password-local';
import { encryptSession } from '../../../lib/auth/iron';
import { setTokenCookie } from '../../../lib/auth/auth-cookies';

const authenticate = (method, req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate(method, { session: false }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    })(req, res);
  });

passport.use(localStrategy);

export default nextConnect()
  .use(passport.initialize())
  .post(async (req, res) => {
    try {
      const user = await authenticate('local', req, res);
      // session is the payload to save in the token, it may contain basic info about the user
      const session = { ...user };
      // The token is a string with the encrypted session
      const token = await encryptSession(session);
      // longer session if remember me is checked
      const isExtededSession = req.body.remember;

      setTokenCookie(res, token, isExtededSession);
      res.status(200).send({ done: true });
    } catch (error) {
      console.log(error.message);
      if (error.message === `Invalid credentials`) {
        res.status(401).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal server error' });
      }
    }
  });
