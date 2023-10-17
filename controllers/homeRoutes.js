const router = require('express').Router();
const withAuth = require('../../utils/auth');
const mainImage = require('../../seeds/mainImage');
const imageData = require('../../seeds/imageData');
const { Explorer, Post, Comment, ExplorerPark, Park } = require('../../models');
const axios = require('axios');

const { apiKey, npsEndpoint, npsThingsToDoEndpoint, npsActivitiesEndpoint, npsTopicsEndpoint } = require('../../public/nps-api-info/npsData');

const activities = require('../../public/nps-api-info/nps-activities');
const topics = require('../../public/nps-api-info/nps-topics');


let state;
let selectedPark;
let stateParks = [];

let actId;
let selectedActivity;
let actParks = [];

let topicId;
let selectedTopic;
let topicParks = [];

let thingsToDo = [];

const transparent = true;


//Displays the homepage
router.get('/', withAuth, async (req, res) => {

    const explorerData = await Explorer.findByPk(req.session.userId);
    const username = explorerData.username;

    res.render('add-delete-parks', {
        imageData, activities, topics,
        state, stateParks, selectedPark,
        actId, selectedActivity, actParks,
        topicId, selectedTopic, topicParks,
        thingsToDo,
        loggedIn: req.session.loggedIn,
        username,
        id: req.session.userId,
        transparent,
        background: mainImage[0].file_path, stylesheet: "/css/style.css"
    });
});

router.post('/', async (req, res) => {

    if (req.body.stateCode) {

        state = req.body.stateCode;

        await fetch(npsEndpoint + '?stateCode=' + req.body.stateCode + '&api_key=' + apiKey)
            .then((response) => {
                if (!response.ok) {
                    return res.json({ message: response.statusText });
                }
                return response.json();
            }).then((parksData) => {
                stateParks = [];
                for (let i = 0; i < parksData.total; i++) {
                    const { parkCode, fullName, activities } = parksData.data[i];
                    const activitiesNames = activities.map((activity) => activity.name);
                    //Filtering the results to ensure that the parks in the results allow nature-intensive activities
                    if (activitiesNames.includes('Hiking') || activitiesNames.includes('Biking')
                        || activitiesNames.includes('Kayaking') || activitiesNames.includes('Canoeing')
                        || activitiesNames.includes('Camping')) {

                        const park = {
                            parkCode,
                            fullName
                        };
                        stateParks.push(park);
                    }
                };
                return res.status(201).json({ stateParks });
            }).catch((err) => console.error(err));
    }
    if (req.body.code) {

        selectedPark = req.body.name;

        await fetch(npsThingsToDoEndpoint + '?parkCode=' + req.body.code + '&api_key=' + apiKey)
            .then((response) => {
                if (!response.ok) {
                    return res.json({ message: response.statusText });
                }
                return response.json();
            }).then((thingsData) => {
                thingsToDo = [];
                for (let i = 0; i < thingsData.data.length; i++) {
                    const { id, url, title,
                        shortDescription, images, season,
                        timeOfDay, duration } = thingsData.data[i];

                    const TimeOfDay = timeOfDay ? timeOfDay : 'N/A';
                    const Duration = duration ? duration : 'N/A';
                    const thing = {
                        id, url, title,
                        shortDescription, images, season,
                        TimeOfDay, Duration
                    };

                    thingsToDo.push(thing);
                };
                return res.status(201).json({ thingsToDo });
            }).catch((err) => console.error(err));

    }

    if (req.body.clearThingsToDo) {
        thingsToDo = [];
    }

    if (req.body.actId) {
        actId = req.body.actId;
        selectedActivity = req.body.actName;

        await fetch(npsActivitiesEndpoint + '?id=' + req.body.actId + '&api_key=' + apiKey)
            .then((response) => {
                if (!response.ok) {
                    return res.json({ message: response.statusText });
                }
                return response.json();
            }).then((actParksData) => {
                actParks = [];
                for (let i = 0; i < actParksData.data[0].parks.length; i++) {
                    const { states, parkCode, designation, fullName, url } = actParksData.data[0].parks[i];
                    const park = {
                        states,
                        parkCode,
                        designation,
                        fullName,
                        url
                    };
                    actParks.push(park);
                };
                return res.status(201).json({ stateParks });
            }).catch((err) => console.error(err));
        }
        if (req.body.topicId) {
            topicId = req.body.topicId;
            selectedTopic = req.body.topicName;
            try {
                const topicResponse = await axios.get(`${npsTopicsEndpoint}?id=${req.body.topicId}&api_key=${apiKey}`);
                if (!topicResponse.data || !topicResponse.data.data) {
                    return res.status(404).json({ message: 'No parks found for this topic' });
                }
                const topicData = topicResponse.data;
                topicParks = [];
                for (let i = 0; i < topicData.data[0].parks.length; i++) {
                    const { states, parkCode, designation, fullName, url } = topicData.data[0].parks[i];
                    const park = {
                        states,
                        parkCode,
                        designation,
                        fullName,
                        url
                    };
                    topicParks.push(park);
                };
                return res.status(201).json({ stateParks });
            } catch (err) {
                console.error(err);
                return res.status(500).json({ message: 'Failed to load topic page' });
            }
        }
    if (req.body.newFavPark) {

        try {

            const existentParkData = await Park.findOne({
                where: {
                    full_name: req.body.newFavPark.full_name
                }
            });

            let newFavData;
            let parkId

            if (!existentParkData) {

                newFavData = await Park.create(req.body.newFavPark);

                parkId = newFavData.id;

                const explorerPark = {
                    is_favorite: true,
                    was_visited: true,
                    explorer_id: req.session.userId,
                    park_id: parkId
                };
                await ExplorerPark.create(explorerPark);
                res.status(201).json({ message: "New favorite park added!" });

            } else {
                newFavData = existentParkData;

                parkId = newFavData.id;

                const existentExplorerParkData = await ExplorerPark.findOne({
                    where: {
                        explorer_id: req.session.userId,
                        park_id: parkId
                    }
                });

                if (!existentExplorerParkData) {

                    const explorerPark = {
                        is_favorite: true,
                        was_visited: true,
                        explorer_id: req.session.userId,
                        park_id: parkId
                    };
                    await ExplorerPark.create(explorerPark);

                    res.status(201).json({ message: "New favorite park added!" });

                } else {
                    const Is_Favorite = existentExplorerParkData.is_favorite;
                    const Has_Visited = existentExplorerParkData.has_visited;
                    const Wants_To_Visit = existentExplorerParkData.wants_to_visit;
                    if (Is_Favorite) {
                        res.status(200).json({ message: 'Park is already in the favorites list.' });
                    } else if (Has_Visited) {
                        res.status(202).json({ message: 'Park is already on the been there list.' });
                    } else if (Wants_To_Visit) {
                        res.status(204).json({ message: 'Park is already on the bucket list.' });
                    } else {
                        res.status(500);
                    };
                };

            };

        } catch (err) {
            res.status(400).json(err);
        };
    }

    if (req.body.visitedPark) {

        try {

            const existentParkData = await Park.findOne({
                where: {
                    full_name: req.body.visitedPark.full_name
                }
            });

            let parkId

            if (!existentParkData) {

                const newVisitedData = await Park.create(req.body.visitedPark);

                parkId = newVisitedData.id;

                const explorerPark = {
                    was_visited: true,
                    explorer_id: req.session.userId,
                    park_id: parkId
                };
                await ExplorerPark.create(explorerPark);
                res.status(201).json({ message: "New park added to been there list!" });

            } else {
                parkId = existentParkData.id

                const existentExplorerParkData = await ExplorerPark.findOne({
                    where: {
                        explorer_id: req.session.userId,
                        park_id: parkId
                    }
                });

                if (!existentExplorerParkData) {

                    const explorerPark = {
                        was_visited: true,
                        explorer_id: req.session.userId,
                        park_id: parkId
                    };
                    await ExplorerPark.create(explorerPark);

                    res.status(201).json({ message: "New park added to been there list!" });

                } else {
                    const Is_Favorite = existentExplorerParkData.is_favorite;
                    const Has_Visited = existentExplorerParkData.has_visited;
                    const Wants_To_Visit = existentExplorerParkData.wants_to_visit;
                    if (Is_Favorite) {
                        res.status(200).json({ message: 'Park is already in the favorites and been there lists.' });
                    } else if (Has_Visited) {
                        res.status(204).json({ message: 'Park is already on the been there list.' });
                    } else if (Wants_To_Visit) {
                        res.status(202).json({ message: 'Park is already on the bucket list.' });
                    } else {
                        res.status(500);
                    };
                };

            };

        } catch (err) {
            res.status(400).json(err);
        };
    }

    if (req.body.newParkToVisit) {

        try {

            const existentParkData = await Park.findOne({
                where: {
                    full_name: req.body.newParkToVisit.full_name
                }
            });

            let parkId

            if (!existentParkData) {

                const newToVisitData = await Park.create(req.body.newParkToVisit);

                parkId = newToVisitData.id;

                const explorerPark = {
                    wants_to_visit: true,
                    explorer_id: req.session.userId,
                    park_id: parkId
                };
                await ExplorerPark.create(explorerPark);
                res.status(201).json({ message: "New park added to your bucket list!" });

            } else {
                parkId = existentParkData.id

                const existentExplorerParkData = await ExplorerPark.findOne({
                    where: {
                        explorer_id: req.session.userId,
                        park_id: parkId
                    }
                });

                if (!existentExplorerParkData) {

                    const explorerPark = {
                        wants_to_visit: true,
                        explorer_id: req.session.userId,
                        park_id: parkId
                    };
                    await ExplorerPark.create(explorerPark);

                    res.status(201).json({ message: "New park added to your bucket list!" });

                } else {
                    const Is_Favorite = existentExplorerParkData.is_favorite;
                    const Has_Visited = existentExplorerParkData.has_visited;
                    const Wants_To_Visit = existentExplorerParkData.wants_to_visit;
                    if (Is_Favorite) {
                        res.status(202).json({ message: 'Park is already in the favorites and been there lists.' });
                    } else if (Has_Visited) {
                        res.status(204).json({ message: 'Park is already on the been there list.' });
                    } else if (Wants_To_Visit) {
                        res.status(200).json({ message: 'Park is already on the bucket list.' });
                    } else {
                        res.status(500);
                    };
                };

            };

        } catch (err) {
            res.status(400).json(err);
        };
    };
});

router.put('/', withAuth, async (req, res) => {
    
    if (req.body.clearModalData) {
        actParks = [];
        topicParks = [];
        thingsToDo = [];

        res.status(200).json({message: 'Modal data was deleted.'})
    } else{
    try {
        const park = await Park.findOne({
            where: {
                full_name: req.body.full_name
            }
        });
        const parkId = park.id;

        
        const updatedParkData = await ExplorerPark.update({
            is_favorite: req.body.is_favorite,
            has_visited: req.body.has_visited,
            wants_to_visit: req.body.wants_to_visit
        }, {
            where: {
                explorer_id: req.session.userId,
                park_id: parkId
            }
        });

        if (updatedParkData[0]) {
            res.status(200).json({ message: 'Explorere/park relationship was updated!' });
        } else {
            res.status(500).json({ message: 'Something went wrong with the request' });

        };
        
    } catch (err) {
        res.status(400).json({ message: 'Something went wrong with the request' });
    };
}

});

//Render the page in which you can find a registered user's favorite parks
router.get('/explorers/:id/favorites', withAuth, async (req, res) => {
    try {
        const explorerData = await Explorer.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Park, through: ExplorerPark, as: 'your_parks' }],
        });
        const explorer = explorerData.get({ plain: true });
        let favoriteParks;
        let length;
        if (explorer.your_parks.length) {
            favoriteParks = explorer.your_parks.filter((park) => park.explorer_park.is_favorite);
            if(favoriteParks.length){
                length= true;
            } else {
                favoriteParks = true;
                length=false
            }
        } else {
            favoriteParks = true;
            length= false;
        };
        let ownParks = req.params.id == req.session.userId;
        res.render('view-parks', {
            ...explorer,
            favoriteParks,
            length,
            loggedIn: req.session.loggedIn,
            ownParks,
            transparent,
            background: imageData[0].file_path,
            stylesheet: "/css/style.css"
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

//Render the page in which you can find a registered user's already visited parks
router.get('/explorers/:id/visited', withAuth, async (req, res) => {
    try {
        const explorerData = await Explorer.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Park, through: ExplorerPark, as: 'your_parks' }],
        });
        const explorer = explorerData.get({ plain: true });
        let visitedParks;
        let length;
        if (explorer.your_parks.length) {
            visitedParks = explorer.your_parks.filter((park) => park.explorer_park.has_visited);
            if(visitedParks.length){
                length = true;
            } else {
                visitedParks = true;
                length = false;
            }
        } else {
            visitedParks = true;;
            length = false;
        };
        let ownParks = req.params.id == req.session.userId;
        res.render('view-parks', {
            ...explorer,
            visitedParks,
            length,
            loggedIn: req.session.loggedIn,
            ownParks,
            transparent,
            background: imageData[0].file_path,
            stylesheet: "/css/style.css"
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

//Render the page in which you can find a registered user's parks to visit list
router.get('/explorers/:id/to_visit', withAuth, async (req, res) => {
    try {
        const explorerData = await Explorer.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Park, through: ExplorerPark, as: 'your_parks' }],
        });
        const explorer = explorerData.get({ plain: true });
        let planToVisitParks;
        let length;
        if (explorer.your_parks.length) {
            planToVisitParks = explorer.your_parks.filter((park) => park.explorer_park.wants_to_visit);
            if(planToVisitParks.length){
            length= true;
            } else {
                planToVisitParks= true;
                length= false;
            };
        } else {
            planToVisitParks = true;
            length= false;
        };
        let ownParks = req.session.userId == req.params.id;
        res.render('view-parks', {
            ...explorer,
            planToVisitParks,
            length,
            loggedIn: req.session.loggedIn,
            ownParks,
            transparent,
            background: imageData[0].file_path,
            stylesheet: "/css/style.css"
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;