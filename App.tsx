import React from 'react';
import Routes from './src/navigation/Routes'; // Import the Routes component
import {Amplify} from 'aws-amplify'; // Import Amplify from aws-amplify
import awsconfig from './src/amplifyconfiguration.json'; // Import the AWS configuration
Amplify.configure(awsconfig);
const App = () => {
  return <Routes />;
};

export default App;
