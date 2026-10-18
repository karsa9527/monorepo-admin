import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.tsx';
import { StoreProvider, createRootStore } from './stores';
import { createAppRouter } from './router';
import 'antd/dist/reset.css';
import './styles/global.scss';

async function bootstrap() {
  const store = createRootStore();
  const router = await createAppRouter();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <StoreProvider value={store}>
        <App router={router} />
      </StoreProvider>
    </StrictMode>,
  );
}

void bootstrap();
