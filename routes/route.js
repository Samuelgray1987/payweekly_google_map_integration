const router = require('express').Router();
const validation = require('./../middleware/validation/postcode');

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBog9w4dWdrmac6T_z7A9qr-gORldtu9qg'
});

// GET / - Retrieve waypoints for given postcodes.
router.get('/', (req, res) => {
    var postcodes = req.query['postcodes'];
    var processedPostcodes = [];
    var optimize = false;
    postcodes.forEach(function (postcode) {
        processedPostcodes.push(postcode['waypoint']);
    });

    if(req.query['optimize'] == true) {
        optimize = true;
    }

    googleMapsClient.directions({
        origin: req.query['origin'],
        destination: req.query['destination'],
        optimize: optimize,
        waypoints: processedPostcodes.join('|'),
        mode: 'driving',
        units: 'imperial'
    }, function (err, response) {
        if (!err) {
            if (response.json['routes']) {
                const route = response.json['routes'][0];
                if (route['legs']) {
                    const legs = route['legs'];
                    let tmp_postcode_array = [];

                    route['waypoint_order'].forEach(function (order_key, key) {
                        tmp_postcode_array[key] = postcodes[order_key];
                    });
                    legs.forEach(function (leg, key) {
                        if (typeof(tmp_postcode_array[key]) !== 'undefined') {
                            leg.postcode = tmp_postcode_array[key].waypoint;
                            leg.id = tmp_postcode_array[key].id;
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
