import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'flux-5glvqyru0fb2b1a0',
});

export const auth = app.auth({
  persistence: 'local',
});

export const db = app.database();

export async function ensureLogin() {
  let state = await auth.getLoginState();
  if (!state) {
    state = await auth.signInAnonymously();
  }
  return state;
}

