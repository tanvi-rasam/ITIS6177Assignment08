console.log('Loading function');

exports.handler = async (event, context) => {
    
    return {
        statusCode:200,
        body:"Tanvi says "+ event.queryStringParameters.keyword
    }
};

