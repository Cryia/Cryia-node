'use strict';

export default ({
    port: 8848,
    database: 'mongodb://192.168.159.2:27017/cryia',
    session: {
        name: 'SID',
        secret: 'SID',
        cookie: {
            httpOnly: true,
            secure:   false,
            maxAge:   365 * 24 * 60 * 60 * 1000
        }
    }
})
