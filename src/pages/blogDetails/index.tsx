import { Box, Chip, CircularProgress, Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery, ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { GET_BLOG_BY_ID } from 'graphql/queries';
import React from 'react';

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_APP_BLOG_GRAPHQL_URL,
    headers: {
      'x-api-key': import.meta.env.VITE_APP_BLOG_GRAPHQL_API_KEY
    }
  }),
  cache: new InMemoryCache()
});

export default function BlogDetails() {
  const { id } = useParams<{ id: string }>();
  console.log('id', id);

  const { data, loading, error } = useQuery(GET_BLOG_BY_ID, {
    variables: { id },
    client
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading blog.</Typography>;

  const blog = data?.getBlogs;

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          {blog.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          By {blog.author_name} • {blog.status}
        </Typography>
        <Box mt={2}>{blog.tags?.map((tag: string, i: number) => <Chip key={i} label={tag} size="small" sx={{ mr: 0.5 }} />)}</Box>
        <Box mt={4}>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </Box>
      </Box>
    </Container>
  );
}
