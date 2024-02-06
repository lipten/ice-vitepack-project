import React, { Suspense, StrictMode } from 'react';
import { Spin } from 'antd';
import './global.less';

import { renderRoutes } from 'react-router-config';
import { BrowserRouter } from 'react-router-dom';
import routes from '@/routes';
import { ResolveHistory } from '@/utils/history';
import { APP_MODE } from 'ice';
import dva from 'dva';
import createLoading from 'dva-loading';
import models from '@/models';
import { createBrowserHistory } from 'history';
import Dashboard from '@/pages/Dashboard'
window.IS_VITE = APP_MODE === 'vite';

const app = dva({
  history: createBrowserHistory(),
});
app.use(createLoading());

models.forEach((model) => {
  app.model(model);
});

app.router(() => (
  <StrictMode>
    <Dashboard />
  </StrictMode>
));
app.start('#root');

// 像umi一样设置全局变量
if (!window.g_app) {
  window.g_app = app;
}
