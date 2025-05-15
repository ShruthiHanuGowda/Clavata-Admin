import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
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
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useQuery, useMutation, ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { LIST_BLOGS, CREATE_BLOG, UPDATE_BLOG, DELETE_BLOG } from 'graphql/queries';

const initialFormState = {
  id: '',
  title: '',
  content: '',
  author_name: '',
  tags: [] as string[],
  status: 'Draft'
};

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_APP_BLOG_GRAPHQL_URL,
    headers: {
      'x-api-key': import.meta.env.VITE_APP_BLOG_GRAPHQL_API_KEY
    }
  }),
  cache: new InMemoryCache()
});

export default function BlogManager() {
  const { data, refetch } = useQuery(LIST_BLOGS, {
    client
  });
  const [createBlog] = useMutation(CREATE_BLOG, {
    client
  });
  const [updateBlog] = useMutation(UPDATE_BLOG, {
    client
  });
  const [deleteBlog] = useMutation(DELETE_BLOG, { client });

  const [form, setForm] = useState(initialFormState);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  const blogs = data?.listBlogs?.items || [];

  const handleOpen = (blog?: any) => {
    if (blog) {
      setForm({ ...blog, tags: blog.tags || [] });
      setIsEdit(true);
    } else {
      setForm(initialFormState);
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setForm(initialFormState);
    setTagInput('');
    setOpen(false);
  };

  const handleSave = async () => {
    const input = {
      title: form.title,
      content: form.content,
      author_name: form.author_name,
      tags: form.tags,
      status: form.status
    };

    if (isEdit) {
      await updateBlog({ variables: { updateblogsinput: { ...input, id: form.id } } });
    } else {
      await createBlog({ variables: { createblogsinput: { ...input, id: Math.random().toString(16).slice(2) } } });
    }

    await refetch();
    handleClose();
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

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Blog Manager</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Create Blog
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs.map((blog: any) => (
              <TableRow key={blog.id}>
                <TableCell>{blog.title}</TableCell>
                <TableCell>{blog.author_name}</TableCell>
                <TableCell>{blog.status}</TableCell>
                <TableCell>
                  {blog.tags?.map((tag: string, i: number) => <Chip key={i} label={tag} size="small" sx={{ mr: 0.5 }} />)}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => handleOpen(blog)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedBlogId(blog.id);
                        setDeleteDialogOpen(true);
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this blog?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (selectedBlogId) {
                await deleteBlog({ variables: { input: { id: selectedBlogId } } });
                await refetch();
              }
              setDeleteDialogOpen(false);
              setSelectedBlogId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
