const container = document.querySelector(".container-fluid");
const parkList = document.querySelector(".dropdown-menu");

const apiKey = 'Pm7CQrnWT8bucBOFdTP4vrXynKLdUW088fcyo4VD';
const npsEndpoint = 'https://developer.nps.gov/api/v1/parks/';

const getParkInfo = async (event) => {
  event.stopPropagation();
  const element = event.target;
  const selectedPark = element.getAttribute('id');
  container.innerHTML = "";

  let searchURL = npsEndpoint + '?parkCode=' + selectedPark + '&api_key=' + apiKey;

  await fetch(searchURL)
    .then((response) => {
      if (!response.ok) return Promise.reject(response.statusText);
      return response.json();

    }).then((parkData) => {

      if (parkData) {
        const [park] = parkData.data;
        const random = Math.floor(Math.random() * 5);
        const url = park.images[random].url;
        const altText = park.images[random].altText;
        const row = document.createElement('div');
        row.classList.add("card-group", "row");
        container.appendChild(row);
        row.innerHTML += createCard(url, altText, park.parkCode, park.weatherInfo,
          park.designation, park.description, park.activities, park.operatingHours[0].description,
          park.operatingHours[0].standardHours, park.directionsUrl, park.directionsInfo, park.fullName, park.id);
      };
    }).catch((err) => console.error(err));
};

const imageEl = (url, altText) => {
  if (url) {
    return `<img class= "img-fluid rounded" style="max-height: 50vh;" src="${url}" alt="${altText ? altText : "N/A"}"/>`
  } else {
    return ``;
  };
};

const miniImageEl = (url, altText) => {
  if (url) {
    return `<img class= "img-fluid rounded" style="max-height: 25vh;" src="${url}" alt="${altText ? altText : "N/A"}"/>`
  } else {
    return ``;
  };

}
const deleteCard = async (event) => {

  element = event.target;

  if (document.location.href === document.location.origin + '/') {
    const body = element.parentElement;
    const idDiv = body.parentElement;
    const parkId = idDiv.getAttribute('data-card-id');
    const card = idDiv.parentElement;

    if (card.closest('.container').getAttribute('id') === 'container1') {
      localStorage.setItem('favoriteParks', JSON.stringify(favoriteParks.filter((park) => park.id !== parkId)));
    } else if (card.closest('.container').getAttribute('id') === 'container2') {
      localStorage.setItem('favoriteParks', JSON.stringify(favoriteParks.filter((park) => park.id !== parkId)));
      localStorage.setItem('visitedParks', JSON.stringify(visitedParks.filter((park) => park.id !== parkId)));
    } else {
      localStorage.setItem('parksToVisit', JSON.stringify(parksToVisit.filter((park) => park.id !== parkId)));
    };
    location.reload(true);

  } else {
    const body = element.parentElement;
    const media = body.parentElement;
    const card = media.parentElement;
    const nameEl = body.children.item(0);
    const full_name = nameEl.textContent.trim();

    if (location.pathname.endsWith('favorites')) {

      const response = await fetch('/api/parks', {
        method: 'PUT',
        body: JSON.stringify({ full_name, is_favorite: false}),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('The park was removed from your favorites!');
        location.reload(true);
      } else {
        alert(response.statusText);
      };
    } else if (location.pathname.endsWith('visited')){
      const response = await fetch('/api/parks', {
        method: 'PUT',
        body: JSON.stringify({ full_name, is_favorite: false, has_visited: false }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('The park was removed from the been-there list!');
        location.reload(true);
      } else {
        alert(response.statusText);
      };
    } else {
      const response = await fetch('/api/parks', {
        method: 'PUT',
        body: JSON.stringify({ full_name, wants_to_visit: false }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('The park was removed from your bucket-list!');
        location.reload(true);
      } else {
        alert(response.statusText);
      };
    };

  }

};

function createCard(url, altText, parkCode, weatherInfo, designation, description, activities, operatingHours, standardHours, directionsUrl, directionsInfo, fullName, id) {
  return `<div class="col-xs-12 col-md-8 col-lg-6 mx-auto">
          <div class="card bg-transparent text-light border-light" style="display:block" data-favorite="false"> 
            <div class="card-media">
            ${imageEl(url, altText)}
            <div class="card-media-preview u-flex-center" id ="id" data-card-id="${id}" >
              <span class="card-media-tag card-media-tag" id= "parkCode"><strong> Park Code: </strong> ${parkCode}</span>
            <div class="card-body">
              <h2><a class="text-info" href="${directionsUrl}" target="_blank" id ="fullName"><strong>${fullName}</strong></a></h2><br/>
              <h4 id="designation">${designation ? designation : 'N/A'}</h4></br>
              <h3 style="text-align: center;"> Park Description </h3>
              <p class="text-sm font-normal">${description ? description : 'N/A'}}</p><hr/>
              <h3 style="text-align: center;"> Activities </h3>
              ${activitiesEl(activities)}
              <h3 style="text-align: center;"> Weather Info </h3>
              <p><strong>${weatherInfo ? weatherInfo : 'N/A'}</strong></p><hr/>
              <h3 style="text-align: center;"> Directions </h3>
              <p>${directionsInfo ? directionsInfo : 'N/A'}</p>
              <h3 style="text-align: center;"> Operating Hours </h3>
              <p>${operatingHours ? operatingHours : 'N/A'}</p><hr/>
              <h4> Hours per Day of the Week </h4>
              ${standardHoursList(standardHours)}
            </div>
            <div class="card-group row">
            <div class="col-xs-12 col-md-6 col-lg-3">
            <div class="card bg-transparent">
            <div class= "card-body text-center">
            <button class="btn btn-secondary" type="button" onclick = "addFavoritePark(event)">Favorite!</button>
            </div>
            </div>
            </div>
            <div class="col-xs-12 col-md-6 col-lg-3">
            <div class="card bg-transparent">            
            <div class= "card-body text-center">
            <button type="button" class="btn btn-secondary" onclick = "addToVisitedParks(event)">Been There!</button>
            </div>
            </div>
            </div>
            <div class="col-xs-12 col-md-6 col-lg-3">
            <div class="card bg-transparent">            
            <div class= "card-body text-center">
            <button class="btn btn-secondary" type="button" onclick = "addToParksToVisit(event)">Bucket List!</button>
            </div>
            </div>
            </div>
            <div class= "col-xs-12 col-md-6 col-lg-3">
            <div class="card bg-transparent">            
            <div class= "card-body text-center">
            <button type="button" class="btn btn-secondary" onclick = "getThingsToDo()" id= "thingsToDo">Things To Do</button>
            </div>
            </div>
            </div>
            </div>
            <div class="card-group row">
            <div class="col">
            <div class="card bg-transparent">            
            <div class= "card-body text-center">
            <button class="btn btn-danger" type="button" onclick = "closeCard()">Close</button>
            </div>
            </div>
            </div>
            </div>
          </div>
          </div>
        `;
}

function createMiniCard(id, directionsUrl, fullName, url, altText, designation, isFavorite, hasVisited, wantsToVisit) {

  return `<div class="card bg-transparent border-light" style="display:block;" data-favorite="${isFavorite}" data-visited="${hasVisited}" data-wants="${wantsToVisit}"> 
<div class="card-media-preview u-flex-center favorite-button" data-card-id="${id}">
<div class="card-body">
  <h2 ><a class="text-info" href="${directionsUrl}" target="_blank" ><strong>${fullName}</strong></a><br></h2><br/>
  ${miniImageEl(url, altText)}
  <h4 class = "text-rigth text-light">${designation}</h4>
  <button class="btn btn-secondary" type="button" onclick = "deleteCard(event)">Remove from the List</button>
  </div>
  </div>
  </div>`;

}
var favoriteParks = JSON.parse(localStorage.getItem('favoriteParks')) || [];
var visitedParks = JSON.parse(localStorage.getItem('visitedParks')) || [];
var parksToVisit = JSON.parse(localStorage.getItem('parksToVisit')) || [];

function showFavorites() {
  const container1 = document.querySelector('#container1');
  container1.innerHTML = '';

  if (!favoriteParks.length) {
    container1.innerHTML = `<div class="card-group">
                              <div class="card  bg-transparent">
                              <h3 class= "card-title text-light">Here are all your favorite parks: </h3>`;
    container1.innerHTML += `<h4  class= "text-secondary">No favorite parks yet! Feel free to search for them in our site.</h4>
                              </div>
                              </div>`
  } else {
    container1.innerHTML = `<div class="card-group">
    <div class="card  bg-transparent"">
    <h3 class= "card-title text-light">Here are all your favorite parks: </h3>
    </div>`;
    for (let i = 0; i < favoriteParks.length; i++) {
      container1.innerHTML += createMiniCard(favoriteParks[i].id, favoriteParks[i].directionsUrl,
        favoriteParks[i].fullName, favoriteParks[i].url, favoriteParks[i].alt,
        favoriteParks[i].designation, true, true, false);
    };
    container1.innerHTML += `</div>`;
  };
};


function showVisitedParks() {
  const container2 = document.querySelector('#container2');
  container2.innerHTML = '';

  if (!visitedParks.length) {
    container2.innerHTML = `<div class="card-group">
    <div class="card  bg-transparent">
    <h3 class= "card-title text-light">Here are the parks that you have visited: </h3>`;
    container2.innerHTML += `<h4  class= "text-secondary">Haven't visited any parks yet? Join if you want recommendations from other members.</h4>
    </div>
    </div>`
  } else {
    container2.innerHTML = `<div class="card-group">
    <div class="card  bg-transparent"">
    <h3 class= "card-title text-light">Here are the parks that you visited:</h3>
    </div>`;
    for (let i = 0; i < visitedParks.length; i++) {
      container2.innerHTML += createMiniCard(visitedParks[i].id, visitedParks[i].directionsUrl,
        visitedParks[i].fullName, visitedParks[i].url, visitedParks[i].alt,
        visitedParks[i].designation, false, true, false);
    };
    container2.innerHTML += `</div>`;
  };
};

function showParksToVisit() {
  const container3 = document.querySelector('#container3');
  container3.innerHTML = '';

  if (!parksToVisit.length) {
    container3.innerHTML = `<div class="card-group">
    <div class="card  bg-transparent">
    <h3 class= "card-title text-light">Here are the parks you want to visit: </h3>`;
    container3.innerHTML += `<h4  class= "text-secondary">Aren't you planning to visit any parks? Join if you want recommendations from other members.</h4>
    </div>
    </div>`
  } else {
    container3.innerHTML = `<div class="card-group">
    <div class="card  bg-transparent"">
    <h3 class= "card-title text-light">Here are the parks you want to visit: </h3>
    </div>`;
    for (let i = 0; i < parksToVisit.length; i++) {
      container3.innerHTML += createMiniCard(parksToVisit[i].id, parksToVisit[i].directionsUrl,
        parksToVisit[i].fullName, parksToVisit[i].url, parksToVisit[i].alt,
        parksToVisit[i].designation, false, false, true);
    };
    container3.innerHTML += `</div>`;
  };
};

if(document.location.href === document.location.origin + '/') {
const listsContainer = document.querySelector('#lists-container');
const featuresParagraph = document.querySelector('#features');
const featuresList = document.querySelector('#features-list');
const listsBtn = document.querySelector('#lists-btn');

const toggleListsHandler = () => {
  if (document.location.href === document.location.origin + '/') {
    if (listsContainer.style.display === 'none') {
      featuresParagraph.style.display = 'none';
      featuresList.style.display = 'none';
      listsContainer.style.display = 'block';
      listsBtn.textContent = 'Click to close the lists!';
      showFavorites();
      showVisitedParks();
      showParksToVisit();
    } else {
      featuresParagraph.style.display = 'block';
      featuresList.style.display = 'block';
      listsContainer.style.display = 'none';
      location.reload();
    };
  };
};

listsBtn.addEventListener('click', toggleListsHandler);
}

const activitiesEl = (activities) => {
  if (activities.length) {
    let stringList = `<ul>`;
    for (let i = 0; i < activities.length; i++) {
      listEl = `<li>${activities[i].name}</li>`;
      stringList += listEl;
    }
    return stringList + `</u>`;
  }
};

const standardHoursList = (standardHours) => {

  let hoursArr = [
    ["Sunday: ", standardHours.sunday],
    ["Monday: ", standardHours.monday],
    ["Tuesday: ", standardHours.tuesday],
    ["Wednesday: ", standardHours.wednesday],
    ["Thursday: ", standardHours.thursday],
    ["Friday: ", standardHours.friday],
    ["Saturday: ", standardHours.saturday]
  ];
  let hoursStr = `<ul>`;
  for (let i = 0; i < hoursArr.length; i++) {
    const listEl = `<li>${hoursArr[i][0]}${hoursArr[i][1]}</li>`
    hoursStr += listEl;
  }
  return hoursStr + `</ul>`;
}

//Event-listeners for dynamically created elements

const closeCard = () => {
  document.querySelector('.card').style.display = 'none';
  location.reload();
};
if (parkList) {
  parkList.addEventListener("click", getParkInfo);
};
// Function to toggle a movie as a favorite
const addFavoritePark = async (event) => {

  event.stopPropagation();

  let parkId = document.querySelector('#id').getAttribute('data-card-id');
  let parkName = document.querySelector('#fullName').textContent;
  let parkUrl = document.querySelector('#fullName').getAttribute('href');
  let imgUrl = document.querySelector('img').getAttribute('src');
  let imgText = document.querySelector('img').getAttribute('alt');
  let parkDesignation = document.querySelector('#designation').textContent;

  if (document.location.href === document.location.origin + '/') {

    if (parksToVisit.find((park) => park.id === parkId)) {
      const updatePark = confirm('The park is included in your bucket-list. Do you want to update it?');
      if (!updatePark) {
        alert('Ok. We are leaving it as it is');
      } else {
        const updatedParksToVisit = parksToVisit.filter((park) => park.id !== parkId);
        localStorage.setItem('parksToVisit', JSON.stringify(updatedParksToVisit));

        const newFavPark = { id: parkId, fullName: parkName, directionsUrl: parkUrl, url: imgUrl, alt: imgText, designation: parkDesignation };
        favoriteParks.push(newFavPark);
        localStorage.setItem('favoriteParks', JSON.stringify(favoriteParks));

        if (!visitedParks.find((park) => park.id === parkId)) {
          visitedParks.push(newFavPark);
          localStorage.setItem('visitedParks', JSON.stringify(visitedParks));
        };

        alert('The park has been added to your favorites!');
      }
    } else if (!parksToVisit.find((park) => park.id === parkId) && !favoriteParks.find((park) => park.id === parkId)) {

      const newFavPark = { id: parkId, fullName: parkName, directionsUrl: parkUrl, url: imgUrl, alt: imgText, designation: parkDesignation };
      favoriteParks.push(newFavPark);
      localStorage.setItem('favoriteParks', JSON.stringify(favoriteParks));
      if (!visitedParks.find((park) => park.id === parkId)) {
        visitedParks.push(newFavPark);
        localStorage.setItem('visitedParks', JSON.stringify(visitedParks));
      };

      alert('The park has been added to your favorites!');
    } else {
      alert('The park is already in your favorites list!');
    };
    closeCard();

  } else {
    const newFavPark = { full_name: parkName, directions_url: parkUrl, image_url: imgUrl, image_altText: imgText, designation: parkDesignation }

    const response = await fetch(document.location.href, {
      method: 'POST',
      body: JSON.stringify({ newFavPark }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201) {
      alert("New favorite park was added to the database!");
    } else if (response.status === 200) {
      alert('Park is already on your favorites list.');
    } else if (response.status === 202) {

      const wantsToUpdate = confirm('The parks is already on your been-there list. Do you want to update its status?');
      if (!wantsToUpdate) {
        alert('Ok, we are not going to change your lists. Keep exploring!');
        return;
      } else {
        updateToFavorite(newFavPark);
      }
    } else if (response.status === 204) {

      const wantsToUpdate = confirm('The park is currently on your bucket-list. Do you want to update its status?');
      if (!wantsToUpdate) {
        alert('Ok, we are not going to change your lists. Keep exploring!');
        return;
      } else {
        updateToFavorite(newFavPark);
      }
    } else {
      alert(response.statusText);
    }
  }
};

const updateToFavorite = async (newFavPark) => {
  const { full_name } = newFavPark;

  const response = await fetch(document.location.href, {
    method: 'PUT',
    body: JSON.stringify({ full_name, is_favorite: true, has_visited: true, wants_to_visit: false }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    alert('Park was added to your favorites!');
  } else {
    alert(response.statusText);
  };
};

const addToVisitedParks = async (event) => {

  event.stopPropagation();


  let parkId = document.querySelector('#id').getAttribute('data-card-id');
  let parkName = document.querySelector('#fullName').textContent;
  let parkUrl = document.querySelector('#fullName').getAttribute('href');
  let imgUrl = document.querySelector('img').getAttribute('src');
  let imgText = document.querySelector('img').getAttribute('alt');
  let parkDesignation = document.querySelector('#designation').textContent;

  if (document.location.href === document.location.origin + '/') {

    if (favoriteParks.find((park) => park.id === parkId)) {
      alert('The park is already in your favorites and been there lists!')
    } else if (!parksToVisit.find((park) => park.id === parkId) && !visitedParks.find((park) => park.id === parkId)) {
      const newVisitedPark = { id: parkId, fullName: parkName, directionsUrl: parkUrl, url: imgUrl, alt: imgText, designation: parkDesignation };
      visitedParks.push(newVisitedPark);

      localStorage.setItem('visitedParks', JSON.stringify(visitedParks));
      alert('The park has been added to your been-there list!');

    } else if (parksToVisit.find((park) => park.id === parkId)) {
      const updatePark = confirm('The park is included in your bucket-list. Do you want to update it?');
      if (!updatePark) {
        alert('Ok. We are leaving it as it is');
      } else {
        const updatedParksToVisit = parksToVisit.filter((park) => park.id !== parkId);
        localStorage.setItem('parksToVisit', JSON.stringify(updatedParksToVisit));
        const newVisitedPark = { id: parkId, fullName: parkName, directionsUrl: parkUrl, url: imgUrl, alt: imgText, designation: parkDesignation };
        visitedParks.push(newVisitedPark);

        localStorage.setItem('visitedParks', JSON.stringify(visitedParks));
      };
    } else {

      alert('The park is already in your been there list!');
    };
    closeCard();
  } else {
    const visitedPark = { full_name: parkName, directions_url: parkUrl, image_url: imgUrl, image_altText: imgText, designation: parkDesignation }

    const response = await fetch(document.location.href, {
      method: 'POST',
      body: JSON.stringify({ visitedPark }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201) {
      alert("New park was added to your been-there list!");
    } else if (response.status === 200) {
      alert('Park is already on your favorite and been-there lists!');
    } else if (response.status === 204) {
      alert('Park is already on your been-there list!');
    } else if (response.status === 202) {
      const wantsToUpdate = confirm('The park is currently on your bucket-list. Do you want to update its status?');
      if (!wantsToUpdate) {
        alert('Ok, we are not going to change your lists. Keep exploring!');
        return;
      } else {
        updateToVisited(visitedPark);
      }
    } else {
      alert(response.statusText);
    };
  }
};

const updateToVisited = async (visitedPark) => {

  const { full_name, is_favorite } = visitedPark;

  const response = await fetch(document.location.href, {
    method: 'PUT',
    body: JSON.stringify({ full_name, is_favorite, has_visited: true, wants_to_visit: false }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    alert('Park was added to your been-there list!');
  } else {
    alert(response.statusText);
  };
};


const addToParksToVisit = async (event) => {

  event.stopPropagation();

  let parkId = document.querySelector('#id').getAttribute('data-card-id');
  let parkName = document.querySelector('#fullName').textContent;
  let parkUrl = document.querySelector('#fullName').getAttribute('href');
  let imgUrl = document.querySelector('img').getAttribute('src');
  let imgText = document.querySelector('img').getAttribute('alt');
  let parkDesignation = document.querySelector('#designation').textContent;

  if (document.location.href === document.location.origin + '/') {

    if (visitedParks.find((park) => park.id === parkId)) {
      const updatePark = confirm('The park is included in your been-there list. Do you want to update it?');
      if (!updatePark) {
        alert('Ok. We are leaving it as it is');
      } else {
        const updatedFavoriteParks = favoriteParks.filter((park) => park.id !== parkId);
        localStorage.setItem('favoriteParks', JSON.stringify(updatedFavoriteParks));
        const updatedVisitedParks = visitedParks.filter((park) => park.id !== parkId);
        localStorage.setItem('visitedParks', JSON.stringify(updatedVisitedParks));

        const newParkToVisit = { id: parkId, fullName: parkName, directionsUrl: parkUrl, url: imgUrl, alt: imgText, designation: parkDesignation };
        parksToVisit.push(newParkToVisit);

        localStorage.setItem('parksToVisit', JSON.stringify(parksToVisit));
        alert('The park has been added to your bucket-list!')
      }
    } else if (!visitedParks.find((park) => park.id === parkId) && !parksToVisit.find((park) => park.id === parkId)) {

      const newParkToVisit = { id: parkId, fullName: parkName, directionsUrl: parkUrl, url: imgUrl, alt: imgText, designation: parkDesignation };
      parksToVisit.push(newParkToVisit);

      localStorage.setItem('parksToVisit', JSON.stringify(parksToVisit));
      alert('The park has been added to your bucket-list!')
    } else {
      alert('The park is already in your bucket-list!');
    };
    closeCard();
  } else {
    const newParkToVisit = { full_name: parkName, directions_url: parkUrl, image_url: imgUrl, image_altText: imgText, designation: parkDesignation }

    const response = await fetch(document.location.href, {
      method: 'POST',
      body: JSON.stringify({ newParkToVisit }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 201) {
      alert("New park was added to your bucket-list!");
    } else if (response.status === 202) {
      const wantsToUpdate = confirm('Park is already on your favorite list!. Do you want to update its status?');
      if (!wantsToUpdate) {
        alert('Ok, we are not going to change your lists. Keep exploring!');
        return;
      } else {
        updateToWantToVisit(newParkToVisit);
      }
    } else if (response.status === 204) {
      const wantsToUpdate = confirm('Park is already on your been-there list!. Do you want to update its status?');
      if (!wantsToUpdate) {
        alert('Ok, we are not going to change your lists. Keep exploring!');
        return;
      } else {
        updateToWantToVisit(newParkToVisit);
      }
    } else if (response.status === 200) {
      alert('Park is already on your bucket-list!');
    } else {
      alert(response.statusText);
    };
  }
};

const updateToWantToVisit = async (newParkToVisit) => {

  const { full_name } = newParkToVisit;

  const response = await fetch(document.location.href, {
    method: 'PUT',
    body: JSON.stringify({ full_name, is_favorite: false, has_visited: false, wants_to_visit: true }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    alert('Park was added to your bucket-list!');
  } else {
    alert(response.statusText);
  };
};

