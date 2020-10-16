

const express= require('express')
const router = express.Router();
const app= express();
const axios=require('axios');

app.get('/say', async (req,res)=>{

    try{
    if (!req.query || !req.query.keyword){
        res.status(400).send("Provide valid parameters");
}
else{
await axios.get('https://b3hqua9080.execute-api.us-east-2.amazonaws.com/test/say?keyword=' + req.query.keyword)
.then(function(val){ 
	    
            res.status(200).send(val.data)
        })
}
    }
    catch(error){
        console.error(error.message)
        res.status(500).send('Server Error');
    }

});

const port=3000

app.listen(port,()=>{
        console.log(`Exapmle app listening at http://localhost:${port}`)
})

