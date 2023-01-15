const {ApolloServer} = require('apollo-server')

const typeDefs = `
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhoto: [Photo!]!
  }
  
  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers:[User!]!                                                                                                                                                                                                                                                   
  }

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }
  
  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }
  
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }
  
  type Mutation {
    postPhoto(input: PostPhotoInput): Photo!
  }
`

const user = [
  {githubLogin: '111', name: 'aaa'},
  {githubLogin: '113', name: 'bb'},
  {githubLogin: '115', name: 'ccc'},
]

const photos = [
  {
    id: '1',
    name: 'a',
    description: 'a_description',
    category: 'ACTION',
    githubUser: '111'
  },
  {
    id: '2',
    name: 'b',
    description: 'b_description',
    category: 'SELFIE',
    githubUser: '115'
  }
]

const tags = [
  {
    photoID: 1, userID: '111'
  },
  {
    photoID: 2, userID: '112'
  },
  {
    photoID: 2, userID: '113'
  },
  {
    photoID: 2, userID: '111'
  },
]

let _id = 0
// let photos = []

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },

  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        ...args.input
      }
      photos.push(newPhoto)

      return newPhoto
    }
  },

  Photo: {
    url: parent => `http://hoge.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      return user.find(u => u.githubLogin === parent.githubUser)
    },
    taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
      .map(tag => tag.userID)
      .map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhoto: parent => tags.filter(tag => tag.userID === parent.id)
      .map(tag => tag.photoID)
      .map(photoID => photos.find(p => p.id === photoID))

  }

}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({url}) => console.log(`GraphQL Service running on ${url}`))