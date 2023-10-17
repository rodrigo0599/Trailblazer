const getParksByActivity = async (event) => {
    event.stopPropagation();
    const element = event.target;
    const actId = element.getAttribute('id');
    const actName = element.textContent;
    console.log(document.querySelector('main'));

    const response = await fetch(document.location.href, {
        method: 'POST',
        body: JSON.stringify({ actId, actName }),
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

const getParksByTopic = async (event) => {
    event.stopPropagation();
    const element = event.target;
    const topicId = element.getAttribute('id');
    const topicName = element.textContent;
    container.innerHTML = '';

    const response = await fetch(document.location.href, {
        method: 'POST',
        body: JSON.stringify({ topicId, topicName }),
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

const closeModal = async () => {
    document.querySelector('.modal').style.display = 'none';

    const clearModalData = true;

    const response = await fetch(document.location.href, {
        method: 'PUT',
        body: JSON.stringify({ clearModalData }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

   
   if (response.ok) {
    location.reload(true); 
    } else {
        alert(response.statusText);
    };
};


