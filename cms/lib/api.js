import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// GraphQL queries
export const listPages = `
  query ListPages {
    listPages {
      items {
        id
        title
        slug
        content
        published
        createdAt
        updatedAt
      }
    }
  }
`;

export const listBlogPosts = `
  query ListBlogPosts {
    listBlogPosts {
      items {
        id
        title
        slug
        content
        excerpt
        published
        createdAt
        updatedAt
      }
    }
  }
`;

export const createPage = `
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      id
      title
      slug
      content
      published
    }
  }
`;

export const updatePage = `
  mutation UpdatePage($input: UpdatePageInput!) {
    updatePage(input: $input) {
      id
      title
      slug
      content
      published
    }
  }
`;

export { client };
