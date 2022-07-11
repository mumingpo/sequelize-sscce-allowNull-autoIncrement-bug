import { DataTypes, Model } from 'sequelize';
import { createSequelize6Instance } from '../setup/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class Foo extends Model {}

  Foo.init({
    name: DataTypes.TEXT,
    // allowNull doesn't want to work with autoincrement for non-pk
    // and throws a SequelizeUniqueConstraintError instead of anything informative
    // bug may only be present in SQLite: I have not tested it on other dbs.
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    troubleMaker: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Foo',
  });

  await Foo.sync({ force: true });
  const foo = await Foo.create({});
  expect(await Foo.count()).to.equal(1);
}
