import { Amplify } from 'aws-amplify';

const config = {
  aws_appsync_graphqlEndpoint: 'https://g2jxckdqwbfezbgbmjefuhz7gi.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'da2-b72c7ctwtvgsnce635v32ch6wi'
};

Amplify.configure(config);

export default config;
