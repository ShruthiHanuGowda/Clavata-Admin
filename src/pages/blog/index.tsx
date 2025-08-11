import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useQuery, useMutation, ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { LIST_BLOGS, CREATE_BLOG, UPDATE_BLOG, DELETE_BLOG } from 'graphql/queries';
import { useNavigate } from 'react-router';
import { TablePaginationToken } from 'components/third-party/react-table';

const initialFormState = {
  id: '',
  title: '',
  image_url: '',
  content: '',
  author_name: '',
  tags: [] as string[],
  status: 'Draft'
};

// const token = localStorage.getItem('serviceToken');
// const client = new ApolloClient({
//   link: new HttpLink({
//     uri: import.meta.env.VITE_APP_BLOG_GRAPHQL_URL,
//     headers: {
//       // 'x-api-key': import.meta.env.VITE_APP_BLOG_GRAPHQL_API_KEY
//       Authorization: token ? `Bearer ${token}` : ''
//     }
//   }),
//   cache: new InMemoryCache()
// });

export default function BlogManager() {
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore,
    refetch
  } = useQuery(LIST_BLOGS, {
    variables: { nextToken: null, limit: pageSize }
  });
  const [createBlog] = useMutation(CREATE_BLOG);
  const [updateBlog] = useMutation(UPDATE_BLOG);
  const [deleteBlog] = useMutation(DELETE_BLOG);

  const [form, setForm] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  //image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // const blogs = data?.listBlogs?.items || [];
  const navigate = useNavigate();

  if (error) {
    console.error('GraphQL Error:', error);
  }

  const handleOpen = (blog?: any) => {
    if (blog) {
      setForm({ ...blog, tags: blog.tags || [] });
      setIsEdit(true);
    } else {
      setForm(initialFormState);
      setIsEdit(false);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    const input = {
      title: form.title,
      content: form.content,
      author_name: form.author_name,
      tags: form.tags,
      status: form.status,
      image_url: imageURL
    };

    console.log('Saving blog with input:', input); // 👈 Log full payload
    console.log('Final imageURL before save:', imageURL);

    if (isEdit) {
      await updateBlog({ variables: { updateblogsinput: { ...input, id: form.id } } });
    } else {
      await createBlog({ variables: { createblogsinput: { ...input, id: Math.random().toString(16).slice(2) } } });
    }

    await refetch();
    setForm(initialFormState);
    setImageFile(null);
    setImageURL('');
    setTagInput('');
    setShowForm(false);
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToDelete: string) => {
    setForm({ ...form, tags: form.tags.filter((tag) => tag !== tagToDelete) });
  };

  const handleImageUpload = async (file: File) => {
    console.log('file.type', file.type);
    try {
      setUploading(true);

      const res = await fetch('https://ku5yu8b4ob.execute-api.me-central-1.amazonaws.com/default/uploadImage', {
        method: 'POST',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      console.log('image data data', data);
      console.log('data.url', data.data.url);
      setImageURL(data.data.url); // Adjust based on actual response
      setForm((prev) => ({ ...prev, image_url: data.data.url }));
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (queryData) {
      setData(queryData.listBlogs.items);
      setNextToken(queryData.listBlogs.nextToken);
    }
  }, [queryData]);

  const handlePagination = useCallback(
    async (direction: 'next' | 'previous' | 'first') => {
      let token = direction === 'next' ? nextToken : previousTokens[previousTokens.length - 1];

      if (!token) token = null;
      if (nextToken === null) {
        token = previousTokens[previousTokens.length - 2];
      }
      switch (direction) {
        case 'first':
          token = null;
          setPreviousTokens([]);
          break;
        case 'previous':
          if (currentPageIndex === 2) {
            token = null;
          }
          break;
        case 'next':
          break;
        default:
          break;
      }

      let variables: { limit: number; nextToken?: string } = {
        limit: pageSize
      };
      if (token) {
        variables.nextToken = token;
      }
      fetchMore({
        variables
      }).then((fetchMoreResult: any) => {
        const fetchedData = fetchMoreResult.data;

        setData(fetchedData.listBlogs.items);
        setNextToken(fetchedData.listBlogs.nextToken);

        if (direction === 'next') {
          setPreviousTokens((prev) => [...prev, nextToken!]);
          setCurrentPageIndex((prev) => prev + 1);
        } else if (direction === 'previous') {
          setCurrentPageIndex((prev) => prev - 1);
          if (nextToken === null) {
            setPreviousTokens((prev) => prev.slice(0, prev.length - 2));
          } else {
            setPreviousTokens((prev) => prev.slice(0, prev.length - 1));
          }
        } else {
          setCurrentPageIndex(1);
        }
      });
    },
    [nextToken, previousTokens, pageSize, fetchMore]
  );

  useEffect(() => {
    handlePagination('first');
  }, [pageSize]);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" onClick={() => handleOpen()}>
          Create Blog
        </Button>
      </Box>

      {showForm && (
        <Box mb={4} p={2} border="1px solid #ccc" borderRadius={2}>
          <Typography variant="h6" gutterBottom>
            {isEdit ? 'Edit Blog' : 'Create Blog'}
          </Typography>
          <Stack spacing={2}>
            {/* image upload */}
            <Box>
              <InputLabel>Upload Image</InputLabel>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    await handleImageUpload(file);
                  }
                }}
              />
              {uploading && <Typography color="text.secondary">Uploading...</Typography>}
              {imageURL && (
                <Box mt={1}>
                  <img src={imageURL} alt="Uploaded preview" style={{ maxWidth: '200px', borderRadius: 8 }} />
                </Box>
              )}
            </Box>
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
            <Box>
              <Box mb={1}>Content</Box>
              <ReactQuill theme="snow" value={form.content} onChange={(value) => setForm({ ...form, content: value })} />
            </Box>

            <TextField
              label="Author"
              value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              fullWidth
            />

            <Box>
              <InputLabel>Tags</InputLabel>
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                {form.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} onDelete={() => handleTagRemove(tag)} />
                ))}
              </Stack>
              <TextField
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialFormState);
                  setTagInput('');
                }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      <TableContainer>
        <Typography variant="h5">Blog Manager</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length > 0 &&
              data.map((blog: any) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    {blog.image_url ? (
                      <img
                        src={blog.image_url}
                        alt="Blog Thumbnail"
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No image
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.author_name}</TableCell>
                  <TableCell>{blog.status}</TableCell>
                  <TableCell>
                    {blog.tags?.map((tag: string, i: number) => (
                      <Chip key={i} label={tag} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => navigate(`/blog/${blog.id}`)}>
                        View
                      </Button>
                      <Button size="small" onClick={() => handleOpen(blog)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={async () => {
                          await deleteBlog({ variables: { input: { id: blog.id } } });
                          await refetch();
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2 }}>
        <TablePaginationToken
          {...{
            currentPageIndex,
            handlePagination,
            nextToken,
            previousTokens,
            pageSize,
            setPageSize,
            isLoading: loading
          }}
        />
      </Box>
    </Box>
  );
}
