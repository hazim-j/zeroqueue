module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        passwordHash:
          '745731af4484f323968969eda289aeee005b5903ac561e64a5aca121797bf7734ef9fd58422e2e22183bcacba9ec87ba0c83b7a2e788f03ce0da06463433cda6',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
