import {
   AngularNodeAppEngine,
   createNodeRequestHandler,
   isMainModule,
   writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import cookieParser from 'cookie-parser';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(cookieParser());

/**
 * Serve static files from /browser
 */
app.use(
   express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      redirect: false,
   }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
   console.log('🍪 Cookies received:', req.cookies);

   // خواندن state از کوکی‌ها
   const appSettingsCookie = req.cookies?.['app-settings'];
   let theme: 'light' | 'dark' = 'light';
   let language = 'fa';

   // پارس کردن کوکی app-settings اگر وجود دارد
   if (appSettingsCookie) {
      try {
         const parsedSettings = JSON.parse(appSettingsCookie);
         theme = parsedSettings.theme || 'light';
         language = parsedSettings.language || 'fa';
         console.log('🎯 Parsed app-settings cookie:', { theme, language });
      } catch (error) {
         console.error('❌ Error parsing app-settings cookie:', error);
      }
   }

   // همچنین می‌تونی مستقیماً از کوکی‌های جداگانه هم بخونی
   const userLanguage = req.cookies?.['user-language'];
   const userTheme = req.cookies?.['user-theme'];

   if (userLanguage) language = userLanguage;
   if (userTheme && (userTheme === 'light' || userTheme === 'dark')) {
      theme = userTheme;
   }

   console.log('🎯 Final extracted settings:', { theme, language });

   angularApp
      .handle(req, {
         headers: req.headers,
         cookies: req.cookies,
         // انتقال state به Angular از طریق context
         context: {
            appSettings: {
               theme,
               language
            },
            cookies: req.cookies,
            // همچنین REQUEST object رو هم پاس بده
            request: req
         }
      })
      .then((response) =>
         response ? writeResponseToNodeResponse(response, res) : next()
      )
      .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
   const port = process.env['PORT'] || 4000;
   app.listen(port, (error) => {
      if (error) {
         throw error;
      }
      console.log(`🚀 Node Express server listening on http://localhost:${port}`);
   });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
