const express = require('express');
const path = require('path');
//database connection
const db = require('./config/connection');
const routes = require('./routes');
//apollo server
const { ApollopServer, ApolloServer } = require('apollo-server-express');
//typeDefs and resolvers
const {typeDefs, resolvers } = require('./schemas');
//require the auth middleware
const {authMiddleWare} = require('./utils/auth');
//express server
const app = express();
const PORT = process.env.PORT || 3001;

//apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleWare
});

server.applyMiddleware({ app })

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}
//get all 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

//app.use(routes);

db.once('open', () => {
  console.log('connected to dB!');
  app.listen(PORT, () => {
  console.log(`🌍 Now listening on localhost:${PORT}`);
  console.log(`to user GraphQl, go to http://localhost:${PORT}${server.graphqlPath}`);
  
  });
});
