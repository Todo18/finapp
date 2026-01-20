import { auth, getFunction } from '~/services/firebase/api';

const getResponseFunction = getFunction('responses');

async function getCustomToken({ uid }) {
  try {
    //
    // FIXME: This only works with the Admin SDK, of course, so needs more work
    //
    // const customToken = await auth.createCustomToken(uid)
    const customToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    return customToken;
  } catch (error) {
    console.log('Error creating custom token:', error);
  }
}

export default {
  async getResponse(content, schema, auth) {
    // const customToken = await getCustomToken(auth);
    try {
      const response = await getResponseFunction({
        content,
        schema
      });
      return response.data;
    } catch (error) {
      console.error('Error getting response:', error);
      throw error;
    }
  }
};