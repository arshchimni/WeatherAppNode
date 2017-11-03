const hapi = require('hapi');
const request = require('request');
const server = new hapi.Server();
server.connection({ port: 3000, host: 'localhost', labels: 'weatherApi' });

const api = server.select('weatherApi');

api.register(require('vision'), (err) => {
    if (err) {
        throw err;
    }
    api.views({
        engines: {
            html: require('handlebars')
        },
        path: __dirname + '/views',
    })
})

api.route({
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
        reply.view('index');
    }
});

api.route({
    method: 'POST',
    path: '/',
    handler: (req, reply) => {
        let payload = req.payload;
        let apiKey = "***************";
        let city = payload.city;
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        //console.log(payload.city);
        request(url, (err, response, body) => {
            if (err) {
                console.log('err');
                let data = {
                    weather: null,
                    error: 'Error, please try again'
                }
                reply.view('index', data);
            } else {
                let weather = JSON.parse(body);
                let data = {};
                if (weather.main == undefined) {
                    data.weather = null;
                    data.error = 'Error, please try again';
                    //console.log(data);
                    reply.view('index', data);
                } else {
                    let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
                    data.weather = weatherText;
                    data.error = null;
                    //console.log(data);
                    reply.view('index', data);
                }
               
            }


        });


    }
})

api.register(require('inert'), (err) => {
    if (err) {
        throw err;
    }
    api.route({
        method: 'GET',
        path: '/public/css/{file*}',
        handler: {
            directory: {
                path: __dirname + "/public/css"
            }
        }
    })
})

api.start((err) => {
    if (err) {
        throw err;
    }
    else {
        console.log(`sever started at ${server.info.uri}`);
    }
})