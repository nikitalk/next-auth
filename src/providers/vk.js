export default (options) => {
  return {
    id: 'vk',
    name: 'VK',
    type: 'oauth',
    version: '2.0',
    scope: 'email',
    params: { grant_type: 'authorization_code' },
    accessTokenUrl: 'https://oauth.vk.com/access_token',
    requestTokenUrl: 'https://oauth.vk.com/access_token',
    authorizationUrl: 'https://oauth.vk.com/authorize?response_type=code',
    profileUrl: 'https://api.vk.com/method/users.get',
    profile: (profile) => {
      return {
        id: profile.id,
        email: profile.email,
        name: profile.first_name,
      };
    },
    clientId: process.env.VK_ID,
    clientSecret: process.env.VK_SECRET,
    setGetAccessTokenProfileUrl: true, // access_token должен быть в profileUrl
    apiVersionProfileUrl: '5.21', // версия api также должна быть в profileUrl
    getEmailFromRawResponse: true,
    ...options,
  };
};
