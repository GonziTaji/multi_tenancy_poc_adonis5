/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route';
import Database, { PostgreConfig } from '@ioc:Adonis/Lucid/Database';
import { Person } from 'App/Models/Person';

Route.get('/', async () => {
    return { hello: 'world' };
});

Route.get('test', async ({ request }) => {
    const { databaseName } = request.qs();

    if (!databaseName) {
        return { alert: '`databaseName` not provided' };
    }

    const connectionName = `${databaseName}_${Date.now()}`;

    try {
        const connection: PostgreConfig = {
            client: 'pg',
            connection: {
                database: databaseName,
                host: 'localhost',
                user: 'postgres',
                password: '1234',
                // port: 5432, // default
            },
        };

        Database.manager.add(connectionName, connection);

        // using queryBuilder
        const people = await Database.connection(connectionName).from('person').select('fullname');

        // using model
        Person.connection = connectionName;
        const person = await Person.first();

        await Database.manager.close(connectionName, true); // true to also release collection from collection stack.

        return { people, person };
    } catch (error) {
        if (Database.manager.has(connectionName)) {
            if (!Database.manager.isConnected(connectionName)) {
                await Database.manager.close(connectionName, true); // true to also release collection from collection stack.
            } else {
                await Database.manager.release(connectionName);
            }
        }

        console.error(error);

        return { error: error.toString() };
    }
});
