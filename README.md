# sequelize-automatic-migrations
Simple utility to automatically generate and manage sequelize migrations

### Local installation
```
npm i --save-dev sequelize-automatic-migrations
```

### Global installation
```
npm i -g sequelize-automatic-migrations
```
## Usage

    sequelize-automatic-migrations -c [/path/to/config] -e [environment name] -d [/path/to/models] -i [/path/to/migrations] -m [model-name]

    Options:
      -c, --config                 JSON file for Sequelize's constructor "options" flag object as defined here: https://sequelize.readthedocs.org/en/latest/api/sequelize/
      -e, --node-env               Node environment namemodels-directory
      -d, --models-directory       Path to models directory
      -i, --migrations-directory   Path to migrations directory
      -m, --model-name             Model name
      
## Local usage
    
    node_modules/.bin/sequelize-automatic-migrations -c [/path/to/config] -e [environment name] -d [/path/to/models] -i [/path/to/migrations] -m [model-name]  

## Example
    sequelize-automatic-migrations -c ./config/database.json -e development -i ./db/migrate -d ./models -m User

    'use strict';

    module.exports = {
      up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('User', {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement : true,
            allowNull : false,
            primaryKey : true,
          },

          login: {
            type: Sequelize.STRING,
            allowNull : false,
          },

          password: {
            type: Sequelize.STRING,
            allowNull : false,
          },

          firstName: {
            type: Sequelize.STRING,
          },

          lastName: {
            type: Sequelize.STRING,
          },

          isActivated: {
            type: Sequelize.BOOLEAN,
          },

          createdAt: {
            type: Sequelize.DATE,
            allowNull : false,
          },

        })
        .then( function() {
          return queryInterface.addIndex(
            'User',
            ["login"],
            {
              indexName: 'users_login_unique',
              indicesType: 'UNIQUE'
            }
          )
        });
      },

      down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('User');
      }
    };
