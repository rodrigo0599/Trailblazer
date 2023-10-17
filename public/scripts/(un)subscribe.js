let subscribeForm = document.querySelector('.form');

if(subscribeForm){
const subscribeHandler = async () => {
    const emailEl = document.querySelector('#email');
    const email = emailEl.value.trim();

    if(email){

    const response = await fetch('/api/dashboard', {
        method: 'PUT',
        body: JSON.stringify({ email }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(response.ok){
        
        alert('You are now subscribed to the mailing list!');

        location.reload(true);
    } else {
        alert(response.statusText);
    };
} else { alert('You must enter an email to subscribe to our mailing list.')}
};

document.querySelector('.btn-success').addEventListener('click', subscribeHandler);
};

let unsubscribeBtn = document.querySelector('#noEmail');

if(unsubscribeBtn){

const unsubscribeHandler = async () => {

    const email = null;

    const response = await fetch('/api/dashboard', {
        method: 'PUT',
        body: JSON.stringify({ email }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(response.ok){
        alert('You have been unsubscribed from the mailing list.')
        location.reload(true);
    } else {
        alert(response.statusText);
    }
};

unsubscribeBtn.addEventListener('click', unsubscribeHandler);
};

const goodbye = document.querySelector('#goodbye');

const deleteRecord = async () => {
    
    const response = await fetch('/api/dashboard', {
        method: 'DELETE'
    });

    if(response.ok){
        location.reload(true);
        alert('Goodbye! Maybe our destinies will cross paths again.');
    } else {
        alert(response.statusText);
    };
};

goodbye.addEventListener('click', deleteRecord);