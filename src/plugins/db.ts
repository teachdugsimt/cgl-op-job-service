import 'reflect-metadata';
import fp from 'fastify-plugin';
import { createConnection } from 'typeorm';
import { Favorite, Item, Job, Shipment, VwFavoriteJob, VwJobList, VwJobListV2 } from '../models';

export default fp(async server => {
  try {
    const connection = await createConnection();
    console.log('database connected');

    server.decorate('db', {
      products: connection.getRepository(Item),
      jobs: connection.getRepository(Job),
      shipments: connection.getRepository(Shipment),
      vwJobList: connection.getRepository(VwJobList),
      favorite: connection.getRepository(Favorite),
      vwFavoriteJob: connection.getRepository(VwFavoriteJob),
      vwJobListV2: connection.getRepository(VwJobListV2),
    });
  } catch (error) {
    console.log(error);
    console.log('make sure you have set .env variables - see .env.sample');
  }
});
