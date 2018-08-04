/**
 * Manages dummy API routes
 * 
 * @param {function} app  An instance of express
 * @param {*} db 
 */
module.exports = function(app, db) {
    const logger = global.services.logger;
    const router = global.services.express.Router();
    const sprintf = global.services.sprintf;

    router.use('/*', (req, res, next) => {
        logger.pushLabel("ROUTING");
        logger.log(
            sprintf.sprintf(
                "Received request of type %s, with data of type %s",
                req.method,
                req.headers['content-type']
            )
        );
        next();
        logger.popLabel();
    });
    app.use('/', router);

    app.delete('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.get('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.post('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.put('/true', (req, res) => {
        boolean_route(res, true);
    });

    app.delete('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.get('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.post('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.put('/false', (req, res) => {
        boolean_route(res, false);
    });

    app.delete('/truefalse', (req, res) => {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    });
    app.get('/truefalse', (req, res) => {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    });
    router.post('/truefalse', (req, res) => {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    });
    app.put('/truefalse', (req, res) => {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    });

    app.delete('/mirror', (req, res) => {
        mirror_route(req, res);
    });

    app.get('/mirror', (req, res) => {
        mirror_route(req, res);
    });

    app.post('/mirror', (req, res) => {
        mirror_route(req, res);
    });

    app.put('/mirror', (req, res) => {
        mirror_route(req, res);
    });

    /**
     * @description Returns a single boolean value as the response.
     * @param {ServerResponse} res 
     * @param {boolean} value 
     */
    function boolean_route(res, value) {
        logger.log("Passed to boolean_route.");
        logger.pushLabel("BOOLEAN");
        logger.log("Returning boolean value " + value);
        logger.popLabel();
        res.send(value);
    }
    
    /**
     * @description Returns the request body to the client 
     * as the response body
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    function mirror_route(req, res) {
        const content_type = req.headers['content-type'];
        logger.log(
            sprintf.sprintf(
                "Mirror received %j",
                (
                    req.method === 'GET' 
                        ? req.query
                        : req.body
                )
            )
        );

        const body = (() => {
            let body;
            if (req.method === 'GET') {
                body = req.query;
            } else {
                if (typeof req.body === 'object') {
                    body = JSON.stringify(req.body);
                } else {
                    body = req.body;
                }
            }

            return body;
        })();

        if (req.headers['content-type-override']) {
            logger.log(
                sprintf.sprintf(
                    "Overriding content-type with %s.",
                    req.headers['content-type-override']
                )
            );

            res.set(
                'content-type',
                req.headers['content-type-override']
            );
        }

        logger.log(
            sprintf.sprintf(
                "Returning request body to client with content-type %s.",
                res.get('content-type')
            )
        );

        res.send(body);
    }

    function html_code_route(req, res) {

    }
};

