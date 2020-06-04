import nextConnect from 'next-connect';
import { getSession } from '../../../lib/auth/iron';
import { updateUser } from '../../../lib/auth/user';
import { authenticateRequst } from '../../../lib/auth/middleware';

export default nextConnect()
  .get(async (req, res) => {
    const session = await getSession(req);

    res.status(200).send({ user: session || null });
  })
  .use(authenticateRequst)
  .patch(async (req, res) => {
    try {
      const {
        body: { newUsername, password, newPassword },
      } = req;
      const { username } = req.authToken;

      await updateUser({
        username,
        newUsername: newUsername || username,
        password,
        newPassword: newPassword || password,
      });
      res.status(200).send({ data: 'OK' });
    } catch (error) {
      if (error.message === `Invalid credentials`) {
        res.status(401).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal server error' });
      }
    }
  });
