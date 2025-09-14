import { environment } from './environment';

const appVersion = (require('../../package.json') as { version: string }).version;
const finalAppVersion = environment.production ? appVersion : `dev-${appVersion}`;

export default finalAppVersion;