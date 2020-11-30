export default (options) => {
  return {
    id: 'etsy',
    name: 'Etsy',
    type: 'oauth',
    version: '1.0',
    scope: 'email_r listings_r listings_d listings_w',
    accessTokenUrl: 'https://openapi.etsy.com/v2/oauth/access_token',
    requestTokenUrl: 'https://openapi.etsy.com/v2/oauth/request_token',
    authorizationUrl: 'https://www.etsy.com/oauth/signin',
    profileUrl: 'https://openapi.etsy.com/v2/users/__SELF__',
    profile: (profile) => {
      return {
        id: profile.results[0].user_id,
        email: profile.results[0].primary_email,
        name: profile.results[0].login_name,
      };
    },
    clientId: process.env.ETSY_ID,
    clientSecret: process.env.ETSY_SECRET,
    ...options,
  };
};
