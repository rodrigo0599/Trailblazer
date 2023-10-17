const updatePostHandler = async (event) => {
    event.preventDefault();
    const id = document.querySelector('.card-subtitle').textContent
    const title = document.querySelector('#post-title').value.trim();
    const content = document.querySelector('#content').value.trim();
  
  
    if (title && content) {
      const response = await fetch(`/api/dashboard/${id}/edit`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        document.location.replace('/api/dashboard');
      } else {
        alert(response.statusText);
      }
    } else {
      alert("Either the title or the content of the post is missing.")
    }
  };

  const updateCommentHandler = async (event) => {
    event.preventDefault();
    const id = document.querySelector('.card-subtitle').textContent
    const content = document.querySelector('#content').value.trim();
  
  
    if (content) {
      const response = await fetch(`/api/dashboard/comments/${id}/edit`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
        if (response.ok) {
          document.location.replace('/api/dashboard/comments');
        } else {
          alert(response.statusText);
        };
    } else{
      alert("The comment must include some content.");
    }
  };
  
  const delHandler = async (event) => {
    event.preventDefault();

    const response = await fetch(document.location.href, {
      method: 'DELETE',
    });
  
    if (response.ok) {

      if(document.location.href.includes('comments')){

      document.location.replace('/api/dashboard/comments');

      } else {

        document.location.replace('/api/dashboard')

      }
    } else {
      alert(response.statusText);
    }
  };
  
  document.querySelector('#update').addEventListener('click', updatePostHandler);

  document.querySelector('#update').addEventListener('click', updateCommentHandler);

  document.querySelector('#delete').addEventListener('click', delHandler);
  
  