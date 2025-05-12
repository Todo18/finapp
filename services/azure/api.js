import axios from 'axios';
// import { auth } from '~/services/firebase/api';

async function getCustomToken({ uid }) {
  try {
    //
    // FIXME: This only works with the Admin SDK, of course, so needs more work
    //
    // const customToken = await auth.createCustomToken(uid)
    const customToken = 'fake-token';
    return customToken;
  } catch (error) {
    console.log('Error creating custom token:', error);
  }
}

export default {
  async getResponse(prompt, content, schema, auth) {
    const customToken = await getCustomToken(auth);
    try {
      const response = await axios.post('/api/responses',
        {
          prompt,
          content,
          schema
        },
        {
          headers: {
            'Token': customToken,
          }
        });
      return response.data;
    } catch (error) {
      console.error('Error getting response:', error);
      throw error;
    }
  }
};