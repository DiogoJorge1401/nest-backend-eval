import axios from 'axios';

export const getMockToken = async () => {
  const response = await axios.post(
    `${process.env.MOCK_API_URL}/mock-auth/token`,
    {
      client_id: process.env.MOCK_API_CLIENT_ID,
      client_secret: process.env.MOCK_API_CLIENT_SECRET,
    },
  );
  return response.data.access_token;
};

export const openMockAccount = async (token: string) => {
  await axios.post(
    `${process.env.MOCK_API_URL}/mock-account/open`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};
