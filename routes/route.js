const router = require('express').Router();
const validation = require('./../middleware/validation/postcode');

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBog9w4dWdrmac6T_z7A9qr-gORldtu9qg'
});

// GET / - Retrieve waypoints for given postcodes.
router.get('/', (req, res) => {
    googleMapsClient.directions({
        origin: req.query['origin'],
        destination: req.query['destination'],
        optimize: true,
        waypoints: req.query['postcodes'],
        mode: 'driving',
        units: 'imperial'
    }, function (err, response) {
        if (!err) {
            if(response.json['routes']) {
                const route = response.json['routes'][0];
                if(route['legs']) {
                    const legs = route['legs'];
                    const postcode_array = req.query['postcodes'].split('|');
                    let tmp_postcode_array = [];
                    route['waypoint_order'].forEach(function(order_key, key) {
                       tmp_postcode_array[key] = postcode_array[order_key];
                    });
                    legs.forEach(function(leg, key){
                        leg.postcode = tmp_postcode_array[key];
                        if(typeof(tmp_postcode_array[key]) === 'undefined') {
                            leg.postcode = req.query['destination'];
                        }
                    });
                    return res.status(200).send(legs);
                } else {
                    return res.status(400).send({'legs': false})
                }
            }
            return res.status(200).send(response);
        } else {
            return res.status(500).send(err);
        }
    });
});

module.exports = router;