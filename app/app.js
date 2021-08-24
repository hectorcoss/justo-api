const restify = require('restify');
const env = require('./config/env');
const db = require('../app/config/db');
const user = require('./models/user');
const hit = require('./models/hit');
const corsMiddleware = require('restify-cors-middleware');
const rjwt = require('restify-jwt-community');
const jwt = require('jsonwebtoken');

const cors = corsMiddleware({
   preflightMaxAge: 5,
   origins: ['http://localhost:4200'],
   allowHeaders: ['*','token'],
   exposeHeaders: ['*','token']
})

const server = restify.createServer({
   name: 'justo-test',
   version: '1.0.0'
});

server.pre(cors.preflight);
server.pre((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   next();
});

server.use(cors.actual)
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: true}));

server.use(rjwt(env.jwt).unless({
   path: ['/auth']
}));

server.post('/auth', (req, res, next) => {
   let { user } = req.body;
   db.query('SELECT * from user where email = ' + '"'+user.username+'"', {type: db.QueryTypes.SELECT})
       .then(user => {
          if (user.length > 0) {
             let token = jwt.sign({name: user[0].name}, env.jwt.secret, {
                expiresIn: 60 * 60
             });

             let { iat, exp } = jwt.decode(token);
             res.send({ iat, exp, token, name: user[0].name, id: user[0].id, type: user[0].type_id });
          } else {
             res.send(null)
          }
       })
});

server.post('/register', (req, res, next) => {
   return next();
});

server.get('/user/:id', (req, res, next) => {
   user.findOne({
      where: {id: req.params.id}
   }).then(response => {
      if (response) {
         res.send(response)
      } else {
         res.send(404, 'User not found.')
      }
   })
   return next();
});

server.get('/hitmen', (req, res, next) => {
   console.log(req.query)
   const user_type = req.query.user_type;
   const user_id = req.query.user_id;
   let query = `
        SELECT h.id, h.name, h.email, h.description, h.active, m.manager_id,
       (SELECT name from justo.user WHERE id = m.manager_id) AS manager_name,
       (SELECT JSON_ARRAYAGG(h2.name)
        FROM justo.user h2
        JOIN justo.user_manager m2
        ON h2.id = m2.user_id
        WHERE h.id = m2.manager_id) AS manages
       FROM justo.user h
       LEFT JOIN justo.user_manager m
       ON h.id = m.user_id`;

   switch (user_type) {
      case '1':
         db.query(query, {type: db.QueryTypes.SELECT})
             .then(r => {
                if (r) {
                   res.send(r);
                };
             });
         break;
      case '2':
         db.query(`
        SELECT GROUP_CONCAT(user_id) AS ids
        FROM justo.user_manager
        WHERE manager_id = ${user_id}
        GROUP BY manager_id`, {type: db.QueryTypes.SELECT}).then(r => {
            const ids = `${r[0].ids},${user_id}`;
            query += ` WHERE h.id in (${ids})`
            db.query(query, {type: db.QueryTypes.SELECT})
                .then(r => {
                   if (r) {
                      res.send(r);
                   };
                });
         })
         break;
      case '3':
         query += ` WHERE h.id = ${user_id}`
         db.query(query, {type: db.QueryTypes.SELECT})
             .then(r => {
                if (r) {
                   res.send(r);
                };
             });
         break;
   }

   return next();
});

server.get('/hitmen/list', (req, res, next) => {
   user.findAll({
      attributes: ['id', 'name'],
   }).then((r) => {
      if (r) {
         res.send(r);
      };
   });

   return next();
});

server.get('/hitmen/:id', (req, res, next) => {
   db.query('SELECT * FROM hitmen WHERE id = ' + req.params['id'], (err, r) => {
      if (r) {
         res.send(r);
      };
   });

   return next();
});

server.get('/hits', function (req, res, next) {
   const user_type = req.query.user_type;
   const user_id = req.query.user_id;
   let query = `select hit.id, hitmen.name as hitman, hit.target_name as target, hit.description, hs.name as status,
       (SELECT e.name from justo.user e WHERE e.id = hit.creator_id) AS creator
       from justo.hit hit
       join justo.user hitmen
       on hit.hitmen_id = hitmen.id
       join justo.hit_status hs
       on hit.status_id = hs.id`

   switch (user_type) {
      case '1':
         db.query(query, {type: db.QueryTypes.SELECT})
             .then(r => {
                if (r) {
                   res.send(r);
                };
             });
         break;
      case '2':
         db.query(`
        SELECT GROUP_CONCAT(user_id) AS ids
        FROM justo.user_manager
        WHERE manager_id = ${user_id}
        GROUP BY manager_id`, {type: db.QueryTypes.SELECT}).then(r => {
            const ids = r[0].ids;
            query += ` WHERE hit.hitmen_id in (${ids})`
            db.query(query, {type: db.QueryTypes.SELECT})
                .then(r => {
                   if (r) {
                      res.send(r);
                   };
                });
         })
         break;
      case '3':
         query += ` WHERE hit.hitmen_id = ${user_id}`
         db.query(query, {type: db.QueryTypes.SELECT})
             .then(r => {
                if (r) {
                   res.send(r);
                };
             });
         break;
   }

   return next();
});

server.get('/hits/:id', function (req, res, next) {
   db.query('SELECT * FROM hits WHERE id = ' + req.params['id'], (err, r) => {
      if (r) {
         res.send(r);
      };
   });

   return next();
});

server.post('/hits', function (req, res, next) {
   hit.create({
      hitmen_id: req.params.hitmen_id,
      target_name: req.params.target,
      description: req.params.description,
      creator_id: req.params.creator_id
   }).then(() => {
      res.send('Record created!');
      return next();
   })
});

server.post('/hitmen/deactivate', function (req, res, next) {
  const user_id = req.params.user_id;
  db.query(`UPDATE justo.user SET active = 0 WHERE id = ${user_id}`)
      .then(r => {
         res.send('User deactivated')
         return next()
      })
});

server.post('/hits/status', function (req, res, next) {
    const hitId = req.params.hitId;
    const statusId = req.params.statusId;
    db.query(`UPDATE justo.hit SET status_id = ${statusId} WHERE id = ${hitId}`)
        .then(r => {
            res.send('Hit status changed')
            return next()
        })
});

server.listen(env.port, function () {
   console.log('%s listening at %s', server.name, server.url);
});
