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

        next();
        logger.popLabel();
    });
    router.use('/mirror', (req, res, next) => {
        logger.log("Passing to mirror_route().")
        logger.pushLabel("MIRROR");
        next();
        logger.popLabel();
    });
    router.use(['/true', '/false'], (req, res, next) => {
        logger.log("Passing to boolean_route().")
        logger.pushLabel("BOOLEAN");
        next();
        logger.popLabel();
    });
    router.use('/truefalse', (req, res, next) => {
        logger.log("Passing to random_boolean_route().")
        logger.pushLabel("RAND_BOOL");
        next();
        logger.popLabel();
    });
    router.use('/responsecode', (req, res, next) => {
        logger.log("Passing to http_response_code_route().")
        logger.pushLabel("HTTP_CODE");
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
    app.head('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.patch('/true', (req, res) => {
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
    app.head('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.patch('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.post('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.put('/false', (req, res) => {
        boolean_route(res, false);
    });

    app.delete('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    app.get('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    app.head('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    router.patch('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    router.post('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    app.put('/truefalse', (req, res) => {
        random_boolean_route(res);
    });

    app.delete('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.get('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.head('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.patch('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.post('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.put('/mirror', (req, res) => {
        mirror_route(req, res);
    });

    app.delete('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.get('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.head('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.patch('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.post('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.put('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });

    /**
     * @description Returns a single boolean value as the response.
     * @param {ServerResponse} res 
     * @param {boolean} value 
     */
    function boolean_route(res, value) {
        logger.pushLabel("BOOLEAN");
        logger.log("Returning boolean value " + value);
        logger.popLabel();
        res.send(value);
    }

    /**
     * @description Selects randomly from [true, false] before
     * calling boolean_route() with the selected value.
     * @param {ServerResponse} res 
     */
    function random_boolean_route(res) {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
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
                "Received body of '%j'",
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

        logger.log(
            sprintf.sprintf(
                "Returning request body to client."
            )
        );

        res.send(body);
    }

    /**
     * @description Returns an empty body with the specified HTTP code
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    function http_response_code_route(req, res) {
        const http_code = parseInt(req.params.http_code);
        logger.log(sprintf.sprintf("Returning response with HTTP code %s", http_code))
        res.status(http_code)
        res.send("");
    }
};

