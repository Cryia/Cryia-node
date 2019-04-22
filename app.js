import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import connectMongo from 'connect-mongo';
import session from 'express-session';
import bodyParser from 'body-parser';

import config from './config/default';
import router from './routes/index.js';

import db from './models/db.js';

const app = express();

app.all('*', (req, res, next) => {
    const { origin, Origin, referer, Referer } = req.headers;
    const allowOrigin = origin || Origin || referer || Referer || '*';
    res.header("Access-Control-Allow-Origin", allowOrigin);
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true); //可以带cookies
    res.header("X-Powered-By", 'Express');
    res.header("Access-Control-Expose-Headers", 'Authorization');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

const MongoStore = connectMongo(session);
app.use(cookieParser());
app.use(session({
    name: config.session.name,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: false,
    cookie: config.session.cookie,
    store: new MongoStore({
        url: config.database
    })
}))

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true }));

app.use(bodyParser.json({ type: 'application/*+json', limit: '50mb' }));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


router(app);

//app.use(history());
app.listen(config.port, () => {
    console.log('成功监听端口：' + config.port );
});
