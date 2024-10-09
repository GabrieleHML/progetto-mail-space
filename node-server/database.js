const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', 
  host: 'postgres-db.c72ukkq6a13e.eu-west-1.rds.amazonaws.com',  
  database: 'postgresDB', // FIXME forse è postgres-db
  password: 'postgrespassword00', 
  port: 5432,      
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
};
