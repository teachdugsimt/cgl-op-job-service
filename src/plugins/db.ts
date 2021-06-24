import 'reflect-metadata';
import fp from 'fastify-plugin';
import { createConnection } from 'typeorm';
import { Item, Job, Shipment, VwJobList } from '../models';

export default fp(async server => {
  try {
    const connection = await createConnection();
    console.log('database connected');

    server.decorate('db', {
      products: connection.getRepository(Item),
      jobs: connection.getRepository(Job),
      shipments: connection.getRepository(Shipment),
      vwJobList: connection.getRepository(VwJobList),
    });
  } catch (error) {
    console.log(error);
    console.log('make sure you have set .env variables - see .env.sample');
  }
});
