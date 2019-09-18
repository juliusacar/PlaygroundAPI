// Twilio
const accountSid = 'HIDDEN';
const authToken = 'HIDDEN';
const client = require('twilio')(accountSid, authToken);

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('index');
});

app.post('/crypto', (req, res) => {
    let url = 'https://apiv2.bitcoinaverage.com/convert/global';
    let target = req.body.target;
    let crypto = req.body.crypto;
    let fiat = req.body.fiat;
    let amount = req.body.amount;

    let options = {
        url: url,
        method: 'GET',
        qs: {
            from: crypto,
            to: fiat,
            amount: amount
        }
    };

    request(options, (err, response, body) => {
        let data = JSON.parse(body);
        let information = data.price;
        console.log(`Information from BTC to USD for 1 amount: ${information}`);
        // console.log(body);
        res.write(`<p>Amount of ${crypto}: ${amount}</p>`);
        res.write(`Amount of ${fiat}: ${information}`);
        res.send();
    });
});

app.post('/weather', (req, res) => {
    let cityName = req.body.cityName;
    let appID = 'hidden';
    let url = `https://api.openweathermap.org/data/2.5/weather`;

    let options = {
        url: url,
        method: 'GET',
        qs: {
            q: cityName,
            appid: appID
        }
    };

    request(options, (err, response, body) => {
        let data = JSON.parse(body);
        let temperature = data.main.temp;
        let celsiusNumber = Math.floor(temperature - 273.15);
        let fahrenheitNumber = Math.floor((temperature - 273.15) * (9/5) + 32);
        let name = data.name;
        // console.log(`Information about Main Temp at ${cityName}: ${information}`);
        console.log(body);
        res.write(`<p>City Name: ${name}</p>`);
        res.write(`<p>Temperature in Celcius: ${celsiusNumber}</p>`);
        res.write(`<p>Temperature in Fahrenheit: ${fahrenheitNumber}</p>`);
        res.send();
    });
});

app.post('/foursquare', (req, res) => {
    let nearPlace = req.body.nearPlace;
    let query = req.body.query;
    let url = 'https://api.foursquare.com/v2/venues/explore';

    let options = {
        url: url,
        method: 'GET',
        qs: {
            client_id: 'hidden',
            client_secret: 'hidden',
            near: nearPlace,
            query: query,
            v: '20190811',
            limit: 50
        }
    };

    request(options, (err, response, body) => {

        let data = JSON.parse(body);

        if (data.meta.code == 400) {
            res.send(`<h1>Please try again with a better location name.</h1>`);
        } else {
            let items = data.response.groups[0].items;
            let location = data.response.geocode.displayString;
            let query = _.startCase(data.response.query);
            let address = data.response.groups[0].items[0].venue.location.formattedAddress;
            let recommendedNames = new Array();
            let recommendedAddress = new Array();
            let recommendedCategory = new Array();
                
            for (let i = 0; i < items.length; i++) {
                recommendedNames.push(data.response.groups[0].items[i].venue.name);
                recommendedAddress.push(data.response.groups[0].items[i].venue.location.formattedAddress);
                recommendedCategory.push(data.response.groups[0].items[i].venue.categories[0].name);
            }   

            res.write(`<h1>We found ${recommendedNames.length} '${query}' in ${location}:</h1>`);
            
            for (let i = 0; i < recommendedNames.length; i++) {
                res.write(`<p><b>Title: ${recommendedNames[i]}</b></p>`);
                res.write(`<p>Address:<a target="_blank" href="https://www.google.com/maps/search/${recommendedAddress[i]}">${recommendedAddress[i]}</a></p>`);
                res.write(`<p>Category: ${recommendedCategory[i]}</p><br>`);
            }

            res.send();
        }
    });
});

app.post('/twilio', (req, res) => {

    let number = req.body.number;
    let message = req.body.message;

    client.messages.create({
        body: `${message}`,
        from: '+17736964784',
        to: `+1${number}`
    })
        .then(message => console.log(message.sid));

    res.write(`<h1>Success!</h1>`);
    res.write(`<h4>Phone Number: ${number}</h4>`);
    res.write(`<h4>Message: ${message}</h4>`);
    res.send();
});

app.listen(8081, () => {
    console.log('Server started on port 8081.');
});
