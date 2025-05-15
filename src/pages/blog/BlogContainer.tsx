import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BlogEditor from './BlogEditor';

const BlogContainer = () => {
  return (
    <>
      <BlogEditor
        onSubmit={function (post: { blogId: string; title: string; content: string; createdAt: string }): void {
          throw new Error('Function not implemented.');
        }}
      />
    </>
  );
};

export default BlogContainer;
