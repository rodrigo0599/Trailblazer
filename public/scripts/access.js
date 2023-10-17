if(location.pathname.endsWith('login') || location.pathname.endsWith('signup')){

const accessFormHandler = async (event) => {
    event.preventDefault();
  
    // Collect values from the login form
    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value.trim();
    
    
    if (username && password) {
      // Send a POST request to the API endpoint
      const response = await fetch(document.location.href, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        document.location.replace('/api/dashboard'); 
      } else if(response.status === 403){
        alert("Sorry, the chosen username is already taken. Please try another one.");
      } else if(response.status === 422){
        alert("Password length is too short. It must have at least 8 characters.")
      } else{
        alert("Invalid username or password. Either try again or sign-up if you are new.");

      };
    } else {
      alert('You must enter both a username and a password to access.');
    }
  };

  document.querySelector('.login-form').addEventListener('submit', accessFormHandler);
};

  if(location.pathname.endsWith('dashboard')){

   
    const changePWForm = document.querySelector('#change-pw');

    const changePWHandler = async (event) => {
      event.preventDefault();
      const pwInputEl = document.querySelector('#pw');
      const confirmInputEl = document.querySelector('#confirm-pw');
      const pwInput = pwInputEl.value.trim();
      const confirmInput = confirmInputEl.value.trim();
      
      if(pwInput === ''){
        alert('No new password has been entered.')
      };

      if(pwInput !== confirmInput){

        alert(`The passwords don't match. Please, try again and remember that passwords are case-sensitive.`);

      } else {
        const newPassword = pwInput;

        console.log(newPassword);
        const response = await fetch('/api/dashboard', {
          method: 'PUT',
          body: JSON.stringify({ newPassword }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if(response.ok){

          alert('New password has been securely stored in the database!');
        } else {
          alert(response.statusText);
        };
      };   

    };

    changePWForm.addEventListener('submit', changePWHandler);
  };
  