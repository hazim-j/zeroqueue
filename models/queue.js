module.exports = (sequelize, DataTypes) => {
  const Queue = sequelize.define(
    'Queue',
    {
      name: DataTypes.STRING,
      schedule: DataTypes.STRING,
    },
    {},
  );
  return Queue;
};
