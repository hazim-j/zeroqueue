import crypto from 'crypto';
import { User } from '../../models';

export const passwordEncrypt = (password) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, 'salt', 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });

export async function findUser({ username, password }) {
  const [user, hash] = await Promise.all([
    User.findOne({ where: { username }, raw: true }),
    passwordEncrypt(password),
  ]);
  if (!user) throw new Error('Invalid credentials');

  const passwordsMatch = user.passwordHash === hash;
  if (passwordsMatch) {
    return { username, createdAt: Date.now() };
  } else {
    throw new Error(`Invalid credentials`);
  }
}

export async function updateUser({ username, newUsername, password, newPassword }) {
  const [user, hash] = await Promise.all([
    User.findOne({ where: { username }, raw: true }),
    passwordEncrypt(password),
  ]);
  if (!user) throw new Error('Invalid credentials');

  const passwordsMatch = user.passwordHash === hash;
  if (passwordsMatch) {
    return User.update(
      { username: newUsername, passwordHash: await passwordEncrypt(newPassword) },
      { where: { username } },
    );
  } else {
    throw new Error(`Invalid credentials`);
  }
}
