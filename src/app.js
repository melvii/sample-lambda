const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.lambdaHandler = async (event) => {
    let response;
    try{
        switch (event.httpMethod) {
            case 'POST':
                response = await createItem(JSON.parse(event.body));
                break;
            case 'GET':
                response = await readItem(event.pathParameters.id);
                break;
            case 'PUT':
                response = await updateItem(event.pathParameters.id, JSON.parse(event.body));
                break;
            case 'DELETE':
                response = await deleteItem(event.pathParameters.id);
                break;
            default:
                response = { statusCode: 400, body: 'Invalid HTTP Method' };
        }
    }catch (error) {
        console.error('Error handling request', error);
        response = {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error })
        };
    }
    
    return response;
};

const createItem = async (item) => {
    const params = {
        TableName: TABLE_NAME,
        Item: item
    };
    await dynamo.put(params).promise();
    return { statusCode: 201, body: JSON.stringify('Item created') };
};

const readItem = async (id) => {
     const params = {
        TableName: TABLE_NAME,
        Key: { id }
   };
     const result = await dynamo.get(params).promise();
    return { statusCode: 200, body: JSON.stringify(result.item) };
};

const updateItem = async (id, updateData) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set info = :info',
        ExpressionAttributeValues: {
            ':info': updateData.info
        },
        ReturnValues: 'UPDATED_NEW'
    };
    await dynamo.update(params).promise();
    return { statusCode: 200, body: JSON.stringify('Item updated') };
};

const deleteItem = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { id }
    };
    await dynamo.delete(params).promise();
    return { statusCode: 200, body: JSON.stringify('Item deleted') };
};
