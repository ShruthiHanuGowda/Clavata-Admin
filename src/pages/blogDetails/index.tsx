import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery, ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { GET_BLOG_BY_ID } from 'graphql/queries';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

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
  const { data, loading, error } = useQuery(GET_BLOG_BY_ID, {
    variables: { id },
    client
  });

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Typography color="error">Error loading blog.</Typography>;

  const blog = data?.getBlogs;

  const breadcrumbLinks = [
    { title: 'Home', to: APP_DEFAULT_PATH },
    { title: 'Blog', to: '/blog' },
    { title: blog.title }
  ];

  return (
    <>
      <Breadcrumbs custom heading={blog.title} links={breadcrumbLinks} />
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, mt: 4, mb: 6, borderRadius: 3 }}>
          <Typography variant="h3" fontWeight={600} gutterBottom>
            {blog.title}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            By <strong>{blog.author_name}</strong> • Status: <em>{blog.status}</em>
          </Typography>

          {blog.tags?.length > 0 && (
            <Box mt={2} mb={3} display="flex" flexWrap="wrap" gap={1}>
              {blog.tags.map((tag: string, i: number) => (
                <Chip key={i} label={tag} variant="outlined" />
              ))}
            </Box>
          )}

          {blog.image_url && (
            <Box mb={4} display="flex" justifyContent="center">
              <img
                src={blog.image_url}
                alt="Blog Cover"
                style={{
                  maxWidth: '100%',
                  borderRadius: '12px',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              typography: 'body1',
              lineHeight: 1.7,
              '& h1, h2, h3': {
                mt: 3,
                mb: 1
              },
              '& p': {
                mb: 2
              }
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </Paper>
      </Container>
    </>
  );
}
