const thingsToDoBtn = document.querySelector('#thingsToDo');

const npsThingsToDoEndpoint = 'https://developer.nps.gov/api/v1/thingstodo/';

const getThingsToDo = async () => {
 
  const code = document.querySelector('#parkCode').textContent.split(':')[1].trim();
  const name = document.querySelector('#fullName').textContent;
  if(document.location.href === document.location.origin + '/'){
  container.innerHTML = "";
  };
  const response = await fetch(document.location.href, {
    method: 'POST',
    body: JSON.stringify({ code, name }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (response.ok) {
    location.reload(true);
} else {
    alert(response.statusText);
};
};




