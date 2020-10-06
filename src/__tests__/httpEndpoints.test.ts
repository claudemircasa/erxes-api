import * as faker from 'faker';
import * as request from 'supertest';

import { customerFactory, integrationFactory, scriptFactory, userFactory } from '../db/factories';
import { Customers, Integrations, Scripts, Users } from '../db/models';
import { app } from '../index';
import './setup.ts';

/**
 * Run this test when erxes-api is stopped, because it uses the entire express app.
 * Otherwise, all the endpoints would have to be redeclared to be tested.
 */
describe('HTTP endpoint tests', () => {
  afterEach(async () => {
    await Customers.deleteMany({});
    await Integrations.deleteMany({});
    await Scripts.deleteMany({});
    await Users.deleteMany({});
  });

  test('Test /initial-setup endpoint with no users', async () => {
    const response = await request(app).get('/initial-setup');

    expect(response.text).toBe('no owner');
  });

  test('Test /initial-setup endpoint with users', async () => {
    await userFactory();

    const response = await request(app).get('/initial-setup');

    expect(response.text).toBe('success');
  });

  test('Test /status', async () => {
    const response = await request(app).get('/status');

    expect(response.text).toBe('ok');
  });

  test('Test /script-manager without script id', async () => {
    const response = await request(app).get('/script-manager');

    expect(response.text).toBe('Not found');
  });

  test('Test /script-manager with script id', async () => {
    const script = await scriptFactory({ name: 'script' });
    const response = await request(app)
      .get('/script-manager')
      .query({ id: script._id });

    expect(response.text).toContain('window.erxesSettings');
  });

  test('Test /events-identify-customer', async () => {
    const integration = await integrationFactory();
    const customer = await customerFactory({
      integrationId: integration._id,
      primaryEmail: faker.internet.email(),
      primaryPhone: faker.phone.phoneNumber(),
    });

    const response = await request(app)
      .post('/events-identify-customer')
      .send({
        args: {
          email: customer.primaryEmail,
          phone: customer.primaryPhone,
          code: customer.code,
        },
      });

    expect(response.body).toBeDefined();
    expect(response.body.customerId).toBe(customer._id);
  });
});
