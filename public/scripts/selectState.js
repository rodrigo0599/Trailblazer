
const stateCodesArr = ['AL', 'AK', 'AZ', 'AR', 'CA',
    'CO', 'CT', 'DE', 'DC', 'FL',
    'GA', 'HI', 'ID', 'IL', 'IN',
    'IA', 'KS', 'KY', 'LA', 'ME',
    'MD', 'MA', 'MI', 'MN', 'MS',
    'MO', 'MT', 'NE', 'NV', 'NH',
    'NJ', 'NM', 'NY', 'NC', 'ND',
    'OH', 'OK', 'OR', 'PA',
    'RI', 'SC', 'SD', 'TN', 'TX',
    'UT', 'VT', 'VA', 'WA',
    'WV', 'WI', 'WY'];

const stateNamesArr = ['Alabama', 'Arkansas', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida',
    'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana',
    'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Maryland', 'Massachussets', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
    'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'];

const states = stateNamesArr.map((state) => state.toUpperCase());

const stateForm = document.querySelector('.form');

const chooseState = async (event) => {

    const selectedState = document.querySelector('#state').value.trim().toUpperCase();

    event.preventDefault();
    if (selectedState) {
        const index = states.indexOf(selectedState);
        const stateCode = stateCodesArr[index];

        const response = await fetch(document.location.href, {
            method: 'POST',
            body: JSON.stringify({ stateCode }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            location.reload(true);
        } else {
            alert(response.statusText);
        }

    } else {
        alert("You must enter a state to find trails!");
    }
};


stateForm.addEventListener('submit', chooseState);
