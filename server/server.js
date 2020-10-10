const express=require('express');
const app=express();
const port=3000;
const bodyParser = require("body-parser");
const mariadb=require('mariadb');
const pool=mariadb.createPool({
	host:'localhost',
	user:'root',
	password:'root',
	database:'sample',
	port:3306,
	connectionlimit:5
});
const { check, validationResult } = require('express-validator');

const swaggerJsdoc= require('swagger-jsdoc');
const swaggerUi= require('swagger-ui-express');

const options={
	swaggerDefinition:{
	info:{
	title:"Assignment 08 ",
	version:"1.0.0",
	description:""
},
host:'142.93.10.50:3000',
basePath:'/'
},
apis:['./server.js']
};

const specs= swaggerJsdoc(options);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const cors=require('cors')
app.use('/docs',swaggerUi.serve,swaggerUi.setup(specs));

app.use(cors());

const cache = require('memory-cache');
// configure cache middleware
    let memCache = new cache.Cache();
    let cacheMiddleware = (duration) => {
        return (req, res, next) => {
            let key =  '__express__' + req.originalUrl || req.url
            let cacheContent = memCache.get(key);
            if(cacheContent){
                res.send( cacheContent );
		return
            }else{
                res.sendResponse = res.send
                res.send = (body) => {
                    memCache.put(key,body,duration*1000);
                    res.sendResponse(body)
                }
                next()
            }
        }
    }

/**
 * @swagger
 * /companies:
 *    get:
 *     description: Return companies
 *     produces:
 *        -application/json
 *     responses:
 *         200:
 *             description: Object companies 
 */

app.get('/companies',cacheMiddleware(30), async (req,res)=>{
let conn;
try{
  conn= await pool.getConnection();
  const result= await conn.query("SELECT * FROM company");
  res.setHeader('Content-Type','application/json');
  res.status(200).send(JSON.stringify(result,null,3));
}
catch(err){
res.status(500).send('Server Error');
}
finally{
if (conn) return conn.end();
}

});

 /**
 * @swagger
 * /agents:
 *    get:
 *     description: Return agents
 *     produces:
 *        -application/json
 *     responses:
 *         200:
 *             description: Object agent
 */

app.get('/agents',cacheMiddleware(30), async(req,res)=>{
	let conn;
	try{
		conn = await pool.getConnection();
		const result= await pool.query("SELECT * FROM agents");
		res.setHeader("Content-Type","application/json");
		res.status(200).send(JSON.stringify(result,null,3));
	}
	catch (err){
		res.status('500').send('Server Error');
	}
	finally{
	if (conn) return conn.end();
	}

});

/**
 * @swagger
 * /foods:
 *    get:
 *     description: Return foods
 *     produces:
 *        -application/json
 *     responses:
 *         200:
 *             description: Object food
 */
app.get('/foods',cacheMiddleware(30), async(req,res)=>{
	let conn;
	try{
		conn = await pool.getConnection();
		const result= await pool.query("SELECT * FROM foods");
		res.setHeader("Content-Type","application/json");
		res.status(200).send(JSON.stringify(result,null,3));
	}
	catch (err){
		res.status('500').send('Server Error');
	}
	finally{
	if (conn) return conn.end();
	}

});


 /**
 * @swagger
 * /students:
 *    get:
 *     description: Return students
 *     produces:
 *        -application/json
 *     responses:
 *         200:
 *             description: Object student
 */

app.get('/student',cacheMiddleware(30), async(req,res)=>{
	let conn;
	try{
		conn = await pool.getConnection();
		const result= await pool.query("SELECT * FROM student");
		res.setHeader("Content-Type","application/json");
		res.status(200).send(JSON.stringify(result,null,3));
	}
	catch (err){
		res.status('500').send('Server Error');
	}
	finally{
	if (conn) return conn.end();
	}

})

/**
 * @swagger
 * definitions:
 *   Company:
 *     properties:
 *       COMPANY_ID:
 *         type: string
 *       COMPANY_NAME:
 *         type: string
 *       COMPANY_CITY:
 *         type: string
 */
/**
 * @swagger
 * /addCompany:
 *    post:
 *      description: add record to food table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Added data to food table
 *          500:
 *              description: Server Error
 *      parameters:
 *          - name: Company
 *            description: Company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *
 */

 
app.post('/addCompany',[check('COMPANY_ID','Company ID is required').not().isEmpty().trim(),
                  check('COMPANY_NAME').trim(),
                  check('COMPANY_CITY').trim()],async (req,res)=>{
    let conn;
   console.log(req.body)
    const {COMPANY_ID,COMPANY_NAME,COMPANY_CITY}=req.body

    try{
	conn= await pool.getConnection();
	
const result= await pool.query(`INSERT INTO company (COMPANY_ID, COMPANY_NAME, COMPANY_CITY) VALUES ('${COMPANY_ID}', '${COMPANY_NAME}', '${COMPANY_CITY}')`);
res.status(200).send(result)
	
}
catch(error) {
         console.error(error.message)
        res.status(500).send('Server Error');
    }
finally{
    if (conn) return conn.end();
}

});
/**
 * @swagger
 * definitions:
 *   Company:
 *     properties:
 *       name:
 *         type: string
 *       city:
 *         type: string
 */
/**
 * @swagger
 * /company/{id}:
 *    patch:
 *      description: Update record partially to food table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Updated data to food table
 *          500:
 *              Server Error
 *      parameters:
 *          - name: company
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *          - name: id
 *            in: path
 *            required: true
 *            type: string       
 */

app.patch('/company/:id',async (req,res)=>{
let conn;
const {name,city} =req.body

try{
conn= await pool.getConnection();
var result
if( name && city){
 result= await pool.query(`UPDATE company SET COMPANY_NAME='${name}',COMPANY_CITY='${city}' WHERE COMPANY_ID='${req.params.id}'`);
}
else if (name){
 result= await pool.query(`UPDATE company SET COMPANY_NAME='${name}' WHERE COMPANY_ID='${req.params.id}'`)
}
else if (city){
 result= await pool.query(`UPDATE company SET COMPANY_CITY='${city}' WHERE COMPANY_ID='${req.params.id}'`)
}
else{
res.status(400).json({error:"Enter values to update"})
}
if(result.affectedRows===0){
res.status(300).json({error:"invalid id, cannot update "});
}
else {res.status(200).send(result)}

}
catch(error){
 console.error(error.message)
        res.status(500).send('Server Error');
}
finally{
    if (conn) return conn.end();
}



});

 /**
 * @swagger
 * /companies/{id}:
 *    delete:
 *      description: Delete record in Company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Successfully deleted record from table
 *          500:
 *              Server Error
 *      parameters:
 *          - name: id
 *            in: path
 *            required: true
 *            type: string
 *
 */


app.delete(('/companies/:id'),async (req,res) => {
    let conn;
    try{
        conn = await pool.getConnection();
        
        var query = `DELETE FROM company WHERE COMPANY_ID='${req.params.id}'`;
        var result = await conn.query(query);
        
        if(result.affectedRows == 0){
            res.status(404).send("Invalid Id")
        }
        else{
            res.status(200).send("Successfully deleted");
        }
        
    }catch (err){
        console.log(err);
        throw err;
    } finally {
        if (conn) return conn.end();
    }

})

/**
 * @swagger
 * definitions:
 *   Company:
 *     properties:
 *       COMPANY_NAME:
 *         type: string
 *       COMPANY_CITY:
 *         type: string 
 */

/**
 * @swagger
 * /company/{id}:
 *    put:
 *      description: add or update a record to Company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Added or Updated data to Company table
 *          500:
 *              Server Error
 *      parameters:
 *          - name: Company
 *            description: Company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Company'
 *          - name: id
 *            in: path
 *            required: true
 *            type: string 
 */


app.put('/company/:id', async (req,res)=>{
let conn;
try{    
const {name,city}=req.body
conn= await pool.getConnection();    
var result=0;

if (name && city){
result= await pool.query(`UPDATE company SET COMPANY_NAME='${name}', COMPANY_CITY='${city}' WHERE COMPANY_ID='${req.params.id}'`);

if (result.affectedRows==0){
result= await pool.query(`INSERT INTO company (COMPANY_ID,COMPANY_NAME,COMPANY_CITY) VALUES ('${req.params.id}','${name}','${city}')`)}
res.status(200).send("Updated company")

}
else{
res.status(500).send("Provide all attributes")
}


}
catch(error){
console.error(error.message)
        res.status(500).send('Server Error');
}
finally{
    if (conn) return conn.end();
}

    
});




app.listen(port,()=>{
	console.log(`Exapmle app listening at http://localhost:${port}`)
})
