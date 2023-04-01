
import { ApolloServer, gql } from 'apollo-server';
import { expressMiddleware } from '@apollo/server/express4';
import { AuthenticationError } from 'apollo-server';

const articles = [
  {
    id: '1',
    title: 'Article 1',
    content: 'This is first article',
    authorId: '1',
    comments: [
      {
        title: 'Comment 1',
        content: 'Comment Comment 1',
      },
      {
        title: 'Comment 2',
        content: 'Comment 2 Comment2',
      },
    ],
  },
  {
    id: '2',
    title: 'Second Article',
    content: 'This is the second article',
    authorId: '2',
    comments: [
      {
        title: 'Comment 3',
        content: 'comment 3',
      },
      {
        title: 'Comment 4',
        content: 'comment 4 desc',
      },
    ],
  },
];

const users = [
  { fullname: 'Mahmoud Awd', email: 'Mahmoudawd54@gmail.com', dob: '1997-01-01', id: '1' },
  { fullname: 'Ahmed Mohamed', email: 'ahmed@gmail.com', dob: '1995-01-01', id: '2' },
  { fullname: 'Ahmed ahmed', email: 'ahmed2@gmail.com', dob: '1995-01-01', id: '3' },

];

const typeDefs = gql`
  type Article {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
  }

  type User {
    fullname: String!
    email: String!
    dob: String!
    id: ID!
  }

  type Comment {
    title: String!
    content: String!
  }

  type Query {
    articles: [Article!]!
    article(id: ID!): Article
    user(id: ID!): User
  }

  type Mutation {
    createArticle(title: String!, content: String!): Article!
    createUser(fullname: String!, email: String!, dob: String!): User!
    login(email: String!, password: String!): String!
  }
`;

const resolvers = {
  Query: {
    articles: () => articles,
    article: (_, { id }) => articles.find((article) => article.id === id),
    user: (_, { id }) => users.find((user) => user.id === id),
  },
  Article: {
    author: (parent) => users.find((user) => user.id === parent.authorId),
  },
  Mutation: {
    createArticle: (_, { title, content }) => {
      const newArticle = {
        id: articles.length + 1,
        title,
        content,
        authorId: '1',
        comments: [],
      };
      articles.push(newArticle);
      return newArticle;
    },
    createUser: (_, { fullname, email, dob }) => {
      const newUser = { fullname, email, dob, id: users.length + 1 };
      users.push(newUser);
      return newUser;
    },
    login: (_, { email, password }) => {
      const user = users.find((user) => user.email === email);
      if (!user || password !== 'password') {
        throw new AuthenticationError('Invalid credentials');
      }
      return 'token';
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const { authorization } = req.headers;
    if (authorization !== 'Basic dXNlcjpwYXNzd29yZA==') {
      throw new AuthenticationError('Unauthorized');
    }
  },
});

server.listen().then(({ url }) => {
  console.log(` Server ready at ${url}`);
});
