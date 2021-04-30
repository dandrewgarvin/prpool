import express from 'express';
import compression from 'compression';
import lusca from 'lusca';

import { health } from './controllers/health';
import { test } from './controllers/test';
import handleError from './middleware/handle-error';
import * as settings from './config/settings';

const app = express();
app.set('port', settings.PORT);

app.use(compression());
app.use(express.json());

app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

app.get('/health', health);
app.get('/test', test);

app.use(handleError());

export default app;
