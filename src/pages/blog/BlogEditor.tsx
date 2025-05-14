import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type BlogPost = {
  blogId: string;
  title: string;
  content: string;
  createdAt: string;
};

type BlogEditorProps = {
  onSubmit: (post: BlogPost) => void;
};

const BlogEditor: React.FC<BlogEditorProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const blog: BlogPost = {
      blogId: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    onSubmit(blog);
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: 'auto' }}>
      <h2>Create Blog Post</h2>
      <input
        type="text"
        placeholder="Enter blog title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
        required
      />
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        style={{ height: 200, marginBottom: 20 }}
      />
      <button type="submit">Publish</button>
    </form>
  );
};

export default BlogEditor;
