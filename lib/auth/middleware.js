import { getSession } from './iron';

export const authenticateRequst = async (req, res, next) => {
  const token = await getSession(req);
  req.authToken = token;

  (token && next()) || res.status(401).send({ error: 'Unauthorized error' });
};
