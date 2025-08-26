import React from 'react';
import 'react-quill/dist/quill.snow.css';
import BlogEditor from './BlogEditor';

const BlogContainer = () => {
  return (
    <>
      <BlogEditor
        onSubmit={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    </>
  );
};

export default BlogContainer;
