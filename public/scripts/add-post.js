const addPostHandler = async (event) => {

    event.preventDefault();
    const title = document.querySelector('#post-title').value.trim();
    const content = document.querySelector('#post-area').value.trim();
  
    let response;
    if (title && content) {
      response = await fetch('/api/dashboard/post', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res.ok) {
          alert("Post added!");
        } else {
          alert(res.statusText);
        }
      });
    } else {
        alert('Either the title or the content is empty. Both fields are required!');
    }
  };
  
  document.querySelector('#add-post').addEventListener('submit', addPostHandler);